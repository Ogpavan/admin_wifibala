import { extendTheme, theme as baseTheme } from '@chakra-ui/react';

const brandPalettes = {
  blue: {
    50: '#eef2ff',
    100: '#d8e1ff',
    200: '#b7c7ff',
    300: '#95adff',
    400: '#7291ff',
    500: '#4169e1',
    600: '#3456b9',
    700: '#284291',
    800: '#1b2d68',
    900: '#0f1940',
  },
  green: {
    50: '#ecfdf3',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
  },
  orange: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316',
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
  },
  rose: {
    50: '#fff1f2',
    100: '#ffe4e6',
    200: '#fecdd3',
    300: '#fda4af',
    400: '#fb7185',
    500: '#f43f5e',
    600: '#e11d48',
    700: '#be123c',
    800: '#9f1239',
    900: '#881337',
  },
  slate: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
};

const defaultThemeColor = 'blue';

function normalizeHexColor(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  const match = /^#?([0-9a-fA-F]{6})$/.exec(trimmed);
  return match ? `#${match[1].toLowerCase()}` : null;
}

function hexToRgb(hex) {
  const normalized = normalizeHexColor(hex);
  if (!normalized) return null;
  const value = normalized.slice(1);
  return {
    r: Number.parseInt(value.slice(0, 2), 16),
    g: Number.parseInt(value.slice(2, 4), 16),
    b: Number.parseInt(value.slice(4, 6), 16),
  };
}

function rgbToHex(r, g, b) {
  return [r, g, b]
    .map((channel) => Math.max(0, Math.min(255, Math.round(channel))).toString(16).padStart(2, '0'))
    .join('');
}

function mixColors(hexA, hexB, amount) {
  const colorA = hexToRgb(hexA);
  const colorB = hexToRgb(hexB);
  if (!colorA || !colorB) return normalizeHexColor(hexA) || '#4169e1';

  const weight = Math.max(0, Math.min(1, amount));
  const mixed = {
    r: colorA.r + (colorB.r - colorA.r) * weight,
    g: colorA.g + (colorB.g - colorA.g) * weight,
    b: colorA.b + (colorB.b - colorA.b) * weight,
  };

  return `#${rgbToHex(mixed.r, mixed.g, mixed.b)}`;
}

function buildPalette(baseHex) {
  const base = normalizeHexColor(baseHex) || '#4169e1';
  return {
    50: mixColors(base, '#ffffff', 0.92),
    100: mixColors(base, '#ffffff', 0.82),
    200: mixColors(base, '#ffffff', 0.66),
    300: mixColors(base, '#ffffff', 0.5),
    400: mixColors(base, '#ffffff', 0.25),
    500: base,
    600: mixColors(base, '#000000', 0.12),
    700: mixColors(base, '#000000', 0.25),
    800: mixColors(base, '#000000', 0.4),
    900: mixColors(base, '#000000', 0.55),
  };
}

const savedThemeColor = typeof window !== 'undefined'
  ? window.localStorage.getItem('app_theme_color')
  : defaultThemeColor;
const activePalette = brandPalettes[savedThemeColor] || buildPalette(savedThemeColor);

const colors = {
  brand: activePalette,
};

const theme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  colors,
  fonts: {
    heading: `'Inter', ${baseTheme.fonts.heading}`,
    body: `'Inter', ${baseTheme.fonts.body}`,
  },
  styles: {
    global: {
      body: {
        bg: 'gray.50',
      },
    },
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'brand',
      },
    },
    Tabs: {
      defaultProps: {
        colorScheme: 'brand',
      },
    },
  },
});

export default theme;
