// Converted from oklch() -> hex (React Native has no oklch support)
export const darkColors = {
  background: '#020101',
  foreground: '#edebe7',
  card: '#0c0a06',
  primary: '#c99c54',
  primaryForeground: '#090704',
  secondary: '#15120e',
  muted: '#120f0b',
  mutedForeground: '#95928d',
  border: '#2a2621',
  surfaceLow: '#050403',
  surfaceHigh: '#181410',
  goldSoft: '#d1af70',
  green: '#53af6e',
  greenDeep: '#0e2e18',
  coral: '#ea6c5a',
  blue: '#499fd0',
  phoneEdge: '#3b3733',
};

export const lightColors = {
  background: '#e4dfd7',
  foreground: '#2b2520',
  card: '#f0ece5',
  primary: '#a56d14',
  primaryForeground: '#f9f5ee',
  secondary: '#dbd7d0',
  muted: '#dcd9d2',
  mutedForeground: '#635c56',
  border: '#c8c3bc',
  surfaceLow: '#ddd8d1',
  surfaceHigh: '#d3cfc7',
  goldSoft: '#965900',
  green: '#0d773a',
  greenDeep: '#c7e8cd',
  coral: '#c83c25',
  blue: '#006b9e',
  phoneEdge: '#bbb7b0',
};

export type ThemeColors = typeof darkColors;

// Brand / splash logo colours
export const logo = {
  brown: '#8b5a38', orange: '#f5820b', green: '#7cb342', cream: '#f5e6d3',
  brownLight: '#5a331f', orangeLight: '#e07000',
};

// Replacement for CSS color-mix(): alpha('#rrggbb', 0.12)
export const alpha = (hex: string, a: number) =>
  hex + Math.round(Math.max(0, Math.min(1, a)) * 255).toString(16).padStart(2, '0');