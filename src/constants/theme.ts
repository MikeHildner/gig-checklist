export const theme = {
  colors: {
    // Brand: amber accent on a near-black chrome.
    primary: '#F4A62A', // amber — for filled accents (buttons, progress, active states)
    onPrimary: '#1A1206', // text/icons placed on an amber fill
    primaryText: '#A66A12', // amber-toned text/links on light surfaces (readable on white)
    primaryLight: '#FCEFD6', // soft amber tint (e.g. active chip background)
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
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  radius: {
    sm: 6,
    md: 10,
    lg: 16,
  },
  font: {
    sm: 13,
    md: 15,
    lg: 17,
    xl: 22,
  },
} as const;
