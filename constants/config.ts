export const APP_CONFIG = {
  name: 'Sherisha Workshop',
  tagline: 'Cut. Track. Deliver.',
  storageKey: 'sherisha_orders_v1',
  userKey: 'sherisha_user_v1',
};

export const THICKNESS_OPTIONS = ['3 mm', '4 mm', '6 mm', '8 mm', '10 mm', '12 mm', '15 mm', '18 mm'];

export const MOCK_USERS = [
  { id: 'u_ahmed', name: 'Ahmed', role: 'internal' as const },
  { id: 'u_youssef', name: 'Youssef', role: 'internal' as const },
  { id: 'u_clientA', name: 'Client A', role: 'external' as const },
  { id: 'u_manager', name: 'Manager', role: 'manager' as const },
];

export const DEFAULT_USER_ID = 'u_ahmed';
