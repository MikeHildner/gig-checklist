const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

const radius = {
  sm: 6,
  md: 10,
  lg: 16,
} as const;

const font = {
  sm: 13,
  md: 15,
  lg: 17,
  xl: 22,
} as const;

// The brand chrome (amber accent on near-black) is intentionally the same in
// both modes — only the content surfaces flip between light and dark.
export const lightColors = {
  primary: '#F4A62A', // amber — filled accents (buttons, progress, active states)
  onPrimary: '#1A1206', // text/icons on an amber fill
  primaryText: '#A66A12', // amber-toned text/links on a surface
  primaryLight: '#FCEFD6', // soft amber tint (active chip background, qty badge)
  brandBg: '#17120B', // near-black brand surface (headers / nav chrome)
  onBrand: '#FFFFFF', // text/icons on the brand surface
  background: '#F1F5F9',
  surface: '#FFFFFF',
  surfaceElevated: '#F8FAFC',
  border: '#E2E8F0',
  text: '#0F172A',
  textSecondary: '#64748B',
  checked: '#10B981',
  checkedLight: '#D1FAE5',
  danger: '#EF4444',
  dangerLight: '#FEE2E2',
};

export const darkColors: typeof lightColors = {
  primary: '#F4A62A',
  onPrimary: '#1A1206',
  primaryText: '#F6B847', // brighter amber for text on dark surfaces
  primaryLight: '#3A2C12', // dark amber tint
  brandBg: '#17120B',
  onBrand: '#FFFFFF',
  background: '#0E1014',
  surface: '#191C22',
  surfaceElevated: '#23272F',
  border: '#2C313A',
  text: '#E8EAEF',
  textSecondary: '#9AA1AD',
  checked: '#10B981',
  checkedLight: '#10291F',
  danger: '#F2706F',
  dangerLight: '#371C1C',
};

export type ThemeColors = typeof lightColors;

export interface AppTheme {
  colors: ThemeColors;
  spacing: typeof spacing;
  radius: typeof radius;
  font: typeof font;
}

export const lightTheme: AppTheme = { colors: lightColors, spacing, radius, font };
export const darkTheme: AppTheme = { colors: darkColors, spacing, radius, font };
