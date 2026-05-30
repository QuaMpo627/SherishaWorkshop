import React, { createContext, ReactNode, useEffect, useMemo, useState } from 'react';
import { APP_CONFIG, DEFAULT_USER_ID, MOCK_USERS } from '@/constants/config';
import { genId, loadOrders, saveOrders } from '@/services/orderService';
import { storage } from '@/services/storageService';
import { estimateSheets } from '@/services/nestingService';
import { getWorkshopWeek, isInWeek } from '@/services/weekService';
import { AppUser, ExecutionFile, Order, OrderStatus, Shape } from '@/services/types';

export interface CreateOrderInput {
  name: string;
  thickness: string;
  notes?: string;
  shapes: Shape[];
}

interface OrdersContextValue {
  user: AppUser;
  setUser: (id: string) => void;
  orders: Order[];
  loading: boolean;
  currentWeekOrders: Order[];
  archivedOrders: Order[];
  createOrder: (input: CreateOrderInput) => Order;
  updateStatus: (orderId: string, status: OrderStatus) => void;
  bulkUpdateStatus: (orderIds: string[], status: OrderStatus) => void;
  setActualSheets: (orderId: string, count: number) => void;
  deleteOrder: (orderId: string) => void;
  addExecutionFile: (
    orderId: string,
    file: Omit<ExecutionFile, 'id' | 'addedAt'>,
  ) => void;
  removeExecutionFile: (orderId: string, fileId: string) => void;
  visibleOrders: Order[];
}

export const OrdersContext = createContext<OrdersContextValue | undefined>(undefined);

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<AppUser>(MOCK_USERS[0]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // hydrate
  useEffect(() => {
    (async () => {
      const storedUserId = (await storage.get<string>(APP_CONFIG.userKey)) ?? DEFAULT_USER_ID;
      const found = MOCK_USERS.find((u) => u.id === storedUserId) ?? MOCK_USERS[0];
      setUserState(found);
      const stored = await loadOrders();
      if (stored.length === 0) {
        const seeded = seedDemoOrders();
        await saveOrders(seeded);
        setOrders(seeded);
      } else {
        setOrders(stored);
      }
      setLoading(false);
    })();
  }, []);

  // persist on change (skip initial load)
  useEffect(() => {
    if (!loading) saveOrders(orders);
  }, [orders, loading]);

  const setUser = (id: string) => {
    const next = MOCK_USERS.find((u) => u.id === id);
    if (!next) return;
    setUserState(next);
    storage.set(APP_CONFIG.userKey, id);
  };

  const createOrder = (input: CreateOrderInput): Order => {
    const week = getWorkshopWeek();
    const order: Order = {
      id: genId('ord'),
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      name: input.name.trim() || 'Untitled order',
      thickness: input.thickness,
      notes: input.notes,
      shapes: input.shapes,
      status: 'pending',
      estimatedSheets: estimateSheets(input.shapes),
      createdAt: Date.now(),
      weekKey: week.key,
    };
    setOrders((prev) => [order, ...prev]);
    return order;
  };

  const updateStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, status, completedAt: status === 'done' ? Date.now() : undefined }
          : o,
      ),
    );
  };

  const bulkUpdateStatus = (orderIds: string[], status: OrderStatus) => {
    if (orderIds.length === 0) return;
    const ids = new Set(orderIds);
    setOrders((prev) =>
      prev.map((o) =>
        ids.has(o.id)
          ? { ...o, status, completedAt: status === 'done' ? Date.now() : undefined }
          : o,
      ),
    );
  };

  const setActualSheets = (orderId: string, count: number) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, actualSheets: count } : o)),
    );
  };

  const deleteOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  const addExecutionFile = (
    orderId: string,
    file: Omit<ExecutionFile, 'id' | 'addedAt'>,
  ) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              executionFiles: [
                ...(o.executionFiles ?? []),
                { ...file, id: genId('f'), addedAt: Date.now() },
              ],
            }
          : o,
      ),
    );
  };

  const removeExecutionFile = (orderId: string, fileId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              executionFiles: (o.executionFiles ?? []).filter((f) => f.id !== fileId),
            }
          : o,
      ),
    );
  };

  const visibleOrders = useMemo(() => {
    if (user.role === 'manager' || user.role === 'internal') return orders;
    return orders.filter((o) => o.userId === user.id);
  }, [orders, user]);

  const week = useMemo(() => getWorkshopWeek(), []);
  const currentWeekOrders = useMemo(
    () => visibleOrders.filter((o) => isInWeek(o.createdAt, week)),
    [visibleOrders, week],
  );
  const archivedOrders = useMemo(
    () => visibleOrders.filter((o) => !isInWeek(o.createdAt, week)),
    [visibleOrders, week],
  );

  const value: OrdersContextValue = {
    user,
    setUser,
    orders,
    loading,
    currentWeekOrders,
    archivedOrders,
    createOrder,
    updateStatus,
    bulkUpdateStatus,
    setActualSheets,
    deleteOrder,
    addExecutionFile,
    removeExecutionFile,
    visibleOrders,
  };

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

function seedDemoOrders(): Order[] {
  const week = getWorkshopWeek();
  const now = Date.now();
  const day = 86_400_000;

  const sample: Order[] = [
    {
      id: 'ord_seed_1',
      userId: 'u_ahmed',
      userName: 'Ahmed',
      userRole: 'internal',
      name: 'Salon Cabinet Doors',
      thickness: '18 mm',
      notes: 'Match grain direction. Client prefers warm finish.',
      shapes: [
        {
          id: 'sh_1',
          dimensions: [
            { id: 'd_1', width: 60, height: 200, quantity: 4 },
            { id: 'd_2', width: 40, height: 80, quantity: 6 },
          ],
        },
        {
          id: 'sh_2',
          dimensions: [{ id: 'd_3', width: 30, height: 30, quantity: 12 }],
        },
      ],
      status: 'pending',
      estimatedSheets: 0,
      createdAt: now - day,
      weekKey: week.key,
    },
    {
      id: 'ord_seed_2',
      userId: 'u_clientA',
      userName: 'Client A',
      userRole: 'external',
      name: 'Office Reception Panels',
      thickness: '12 mm',
      shapes: [
        {
          id: 'sh_3',
          dimensions: [{ id: 'd_4', width: 100, height: 220, quantity: 3 }],
        },
      ],
      status: 'done',
      estimatedSheets: 0,
      actualSheets: 4,
      executionFiles: [
        {
          id: 'f_seed_1',
          name: 'reception_panels_v2.dxf',
          uri: 'file://demo/reception_panels_v2.dxf',
          size: 142_336,
          mimeType: 'application/dxf',
          addedAt: now - day,
        },
        {
          id: 'f_seed_2',
          name: 'cut_plan_summary.pdf',
          uri: 'file://demo/cut_plan_summary.pdf',
          size: 84_120,
          mimeType: 'application/pdf',
          addedAt: now - day + 3_600_000,
        },
      ],
      createdAt: now - 2 * day,
      completedAt: now - day,
      weekKey: week.key,
    },
    {
      id: 'ord_seed_3',
      userId: 'u_youssef',
      userName: 'Youssef',
      userRole: 'internal',
      name: 'Kitchen Drawer Set',
      thickness: '15 mm',
      notes: 'Soft-close compatible.',
      shapes: [
        {
          id: 'sh_4',
          dimensions: [
            { id: 'd_5', width: 50, height: 15, quantity: 8 },
            { id: 'd_6', width: 45, height: 50, quantity: 8 },
          ],
        },
      ],
      status: 'pending',
      estimatedSheets: 0,
      createdAt: now - 3 * 60 * 60 * 1000,
      weekKey: week.key,
    },
  ];

  return sample.map((o) => ({ ...o, estimatedSheets: estimateSheets(o.shapes) }));
}
