// Converted from oklch() -> hex (React Native has no oklch support)
export const darkColors = {
  background: '#050504',
  foreground: '#f2f0ec',
  card: '#0e0c09',
  primary: '#d3a34f',
  primaryForeground: '#100d07',
  secondary: '#17140f',
  muted: '#14110c',
  mutedForeground: '#99948a',
  border: '#3a3021',
  surfaceLow: '#090806',
  surfaceHigh: '#1b1710',
  goldSoft: '#e0bd76',
  green: '#6fbd77',
  greenDeep: '#111b10',
  coral: '#e87561',
  blue: '#73a9c9',
  phoneEdge: '#3b3733',
};

export const lightColors = {
  background: '#f3f0e9',
  foreground: '#28251f',
  card: '#fbf9f4',
  primary: '#9f711f',
  primaryForeground: '#fffaf0',
  secondary: '#e9e4da',
  muted: '#ece8df',
  mutedForeground: '#706b61',
  border: '#d8cfbd',
  surfaceLow: '#eeeae2',
  surfaceHigh: '#e6dfd2',
  goldSoft: '#8c641d',
  green: '#3e8247',
  greenDeep: '#e0ecdd',
  coral: '#bc5545',
  blue: '#397999',
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
