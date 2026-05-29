import { APP_CONFIG } from '@/constants/config';
import { Order } from './types';
import { storage } from './storageService';

export async function loadOrders(): Promise<Order[]> {
  const orders = await storage.get<Order[]>(APP_CONFIG.storageKey);
  return orders ?? [];
}

export async function saveOrders(orders: Order[]): Promise<void> {
  await storage.set(APP_CONFIG.storageKey, orders);
}

export function genId(prefix: string = 'id'): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}
