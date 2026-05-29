// Sherisha Workshop Theme - Industrial copper on dark steel
export const colors = {
  // Surfaces
  background: '#0E0F12',
  surface: '#16181D',
  surfaceElevated: '#1E2127',
  surfaceMuted: '#23272F',
  border: '#2A2E37',
  divider: '#22252C',

  // Text
  textPrimary: '#F5F1EA',
  textSecondary: '#A9A39A',
  textMuted: '#6B6760',

  // Brand - copper/amber industrial
  primary: '#E07A2E',
  primaryDark: '#B85F1F',
  primarySoft: '#3A1F10',
  accent: '#E4B65C',

  // Semantic
  success: '#5DB075',
  successSoft: '#15281C',
  warning: '#E0A33A',
  danger: '#D1495B',
  dangerSoft: '#2C1518',
  info: '#5A9CC9',

  // Status pills
  pending: '#E0A33A',
  pendingSoft: '#2C2110',
  done: '#5DB075',
  doneSoft: '#15281C',

  // Role tags
  internal: '#5A9CC9',
  internalSoft: '#0F1F2C',
  external: '#B36BD9',
  externalSoft: '#1E102C',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  pill: 999,
};

export const typography = {
  display: { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.5 },
  title: { fontSize: 22, fontWeight: '700' as const, letterSpacing: -0.3 },
  heading: { fontSize: 18, fontWeight: '600' as const },
  subheading: { fontSize: 15, fontWeight: '600' as const },
  body: { fontSize: 16, fontWeight: '400' as const },
  bodyStrong: { fontSize: 16, fontWeight: '600' as const },
  caption: { fontSize: 13, fontWeight: '500' as const },
  micro: { fontSize: 11, fontWeight: '600' as const, letterSpacing: 0.6 },
};

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const SHEET = {
  WIDTH_CM: 120,
  HEIGHT_CM: 240,
  WASTE_MARGIN: 0.15, // 15% nesting waste in MVP
};
