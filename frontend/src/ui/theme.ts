/**
 * Единый источник оформления интерфейса: палитры светлой и тёмной темы, тени, радиусы.
 *
 * Значения выставляются в CSS-переменные на :root (см. applyTheme), поэтому styles.css и
 * компоненты читают одни и те же цвета, а графики (recharts) берут их отсюда напрямую.
 * Двух источников цветов быть не должно — из-за них палитра разъезжается.
 */

import type { ThemeName } from '../domain/types';

export interface Palette {
  bg: string;
  surface: string;
  surfaceMuted: string;
  border: string;
  borderStrong: string;
  text: string;
  muted: string;
  accent: string;
  accentDark: string;
  accentSoft: string;
  income: string;
  incomeSoft: string;
  expense: string;
  expenseSoft: string;
  transfer: string;
  transferSoft: string;
  danger: string;
  dangerSoft: string;
  dangerBorder: string;
  /** Цвет текста на залитой акцентом поверхности. */
  onAccent: string;
  /** Затемнение под модальным окном. */
  overlay: string;
  /** Цвета секторов диаграммы и точек легенды. */
  chart: readonly string[];
  shadow: { sm: string; md: string; lg: string };
}

const lightPalette: Palette = {
  bg: '#eef1f5',
  surface: '#ffffff',
  surfaceMuted: '#f6f8fa',
  border: '#dde3e9',
  borderStrong: '#c6d0d9',
  text: '#16212a',
  muted: '#5d6b76',
  accent: '#1f6f8b',
  accentDark: '#17566c',
  accentSoft: '#e7f0f4',
  income: '#2e7d5b',
  incomeSoft: '#e7f3ed',
  expense: '#d24b3f',
  expenseSoft: '#fbeceb',
  transfer: '#7a6ba8',
  transferSoft: '#efedf7',
  danger: '#9b1c31',
  dangerSoft: '#fdecee',
  dangerBorder: '#e2c3c7',
  onAccent: '#ffffff',
  overlay: 'rgba(22, 33, 42, 0.45)',
  chart: ['#1f6f8b', '#2e7d5b', '#d24b3f', '#7a6ba8', '#b8862b', '#4b6bb5', '#5f6b72'],
  shadow: {
    sm: '0 1px 2px rgba(22, 33, 42, 0.06)',
    md: '0 2px 8px rgba(22, 33, 42, 0.08)',
    lg: '0 12px 32px rgba(22, 33, 42, 0.16)',
  },
};

const darkPalette: Palette = {
  bg: '#12161a',
  surface: '#1b2127',
  surfaceMuted: '#232b33',
  border: '#2c353e',
  borderStrong: '#3a4550',
  text: '#e6ecf1',
  muted: '#97a3ae',
  accent: '#5bb3d1',
  accentDark: '#7cc6de',
  accentSoft: '#1e3038',
  income: '#63c398',
  incomeSoft: '#16302a',
  expense: '#f0776a',
  expenseSoft: '#33201f',
  transfer: '#a89ad4',
  transferSoft: '#272336',
  danger: '#f08a95',
  dangerSoft: '#33201f',
  dangerBorder: '#4a2a30',
  onAccent: '#0e1418',
  overlay: 'rgba(0, 0, 0, 0.6)',
  chart: ['#5bb3d1', '#63c398', '#f0776a', '#a89ad4', '#d9ab4f', '#8ba6e8', '#9aa5ae'],
  shadow: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.35)',
    md: '0 2px 8px rgba(0, 0, 0, 0.45)',
    lg: '0 12px 32px rgba(0, 0, 0, 0.6)',
  },
};

export const palettes: Record<ThemeName, Palette> = {
  light: lightPalette,
  dark: darkPalette,
};

/**
 * Цвет сектора диаграммы и соответствующей точки легенды по индексу.
 * Первые цвета — из палитры темы, дальше — дополнительные оттенки по «золотому углу»,
 * чтобы при большом числе категорий цвета не повторялись.
 */
export function chartColor(theme: ThemeName, index: number): string {
  const palette = palettes[theme];
  if (index < palette.chart.length) {
    return palette.chart[index];
  }
  const hue = Math.round((index * 137.508) % 360);
  const lightness = theme === 'dark' ? 58 : 38;
  return `hsl(${hue}, 42%, ${lightness}%)`;
}

/**
 * Ширина символов Inter в долях кегля — нужна, чтобы подобрать кегль суммы так, чтобы
 * значение поместилось в карточку целиком. Табличные цифры (font-variant-numeric: tabular-nums)
 * имеют одинаковую ширину 0.6484em.
 */
const GLYPH_WIDTHS: Record<string, number> = {
  ' ': 0.2812,
  '\u00A0': 0.2812,
  '\u202F': 0.2812,
  ',': 0.2881,
  '.': 0.2881,
  '-': 0.34,
  '+': 0.5859,
  '\u2212': 0.5859,
  '\u2192': 0.9,
  '\u20BD': 0.55,
};

const DIGIT_WIDTH = 0.6484;
const UPPERCASE_WIDTH = 0.7;
const LOWERCASE_WIDTH = 0.58;
const OTHER_WIDTH = 0.62;

/** Приблизительная ширина строки в долях кегля. */
export function relativeWidth(text: string): number {
  let width = 0;

  for (const char of text) {
    const known = GLYPH_WIDTHS[char];
    if (known !== undefined) {
      width += known;
    } else if (char >= '0' && char <= '9') {
      width += DIGIT_WIDTH;
    } else if (char >= 'A' && char <= 'Z') {
      width += UPPERCASE_WIDTH;
    } else if (char >= 'a' && char <= 'z') {
      width += LOWERCASE_WIDTH;
    } else {
      width += OTHER_WIDTH;
    }
  }

  return width;
}

export const radii = {
  sm: '6px',
  md: '10px',
  lg: '14px',
} as const;

export const fontFamily =
  "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif";

/** Карта «имя токена → значение CSS-переменной», чтобы styles.css и TS смотрели в одну палитру. */
function cssVariables(theme: ThemeName): Record<string, string> {
  const palette = palettes[theme];
  const variables: Record<string, string> = {
    '--bg': palette.bg,
    '--surface': palette.surface,
    '--surface-muted': palette.surfaceMuted,
    '--border': palette.border,
    '--border-strong': palette.borderStrong,
    '--text': palette.text,
    '--muted': palette.muted,
    '--accent': palette.accent,
    '--accent-dark': palette.accentDark,
    '--accent-soft': palette.accentSoft,
    '--income': palette.income,
    '--income-soft': palette.incomeSoft,
    '--expense': palette.expense,
    '--expense-soft': palette.expenseSoft,
    '--transfer': palette.transfer,
    '--transfer-soft': palette.transferSoft,
    '--danger': palette.danger,
    '--danger-soft': palette.dangerSoft,
    '--danger-border': palette.dangerBorder,
    '--on-accent': palette.onAccent,
    '--overlay': palette.overlay,
    '--shadow-sm': palette.shadow.sm,
    '--shadow-md': palette.shadow.md,
    '--shadow-lg': palette.shadow.lg,
    '--radius-sm': radii.sm,
    '--radius-md': radii.md,
    '--radius-lg': radii.lg,
    '--font-family': fontFamily,
  };

  return variables;
}

/** Выставляет токены оформления выбранной темы в CSS-переменные корневого элемента. */
export function applyTheme(root: HTMLElement, theme: ThemeName): void {
  for (const [name, value] of Object.entries(cssVariables(theme))) {
    root.style.setProperty(name, value);
  }
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
}
