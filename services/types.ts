export type UserRole = 'manager' | 'internal' | 'external';

export interface AppUser {
  id: string;
  name: string;
  role: UserRole;
}

export interface Dimension {
  id: string;
  width: number; // cm
  height: number; // cm
  quantity: number;
}

export interface Shape {
  id: string;
  imageUri?: string;
  dimensions: Dimension[];
}

export type OrderStatus = 'pending' | 'done';

export interface Order {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  name: string;
  thickness: string;
  notes?: string;
  shapes: Shape[];
  status: OrderStatus;
  estimatedSheets: number;
  actualSheets?: number;
  executionFiles?: string[];
  createdAt: number;
  completedAt?: number;
  weekKey: string; // e.g. 2026-W22
}

export interface WeekRange {
  start: number; // ms
  end: number; // ms
  key: string;
  label: string;
}
