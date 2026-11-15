/**
 * Единый источник оформления интерфейса: палитра, тени, радиусы.
 *
 * Значения выставляются в CSS-переменные на :root при старте приложения (см. applyTheme),
 * поэтому styles.css и компоненты читают одни и те же цвета, а графики (recharts) берут их
 * отсюда напрямую. Двух источников цветов быть не должно — из-за них палитра разъезжается.
 */

export const palette = {
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
} as const;

/** Цвета секторов диаграммы и точек легенды. */
export const chartPalette = [
  '#1f6f8b',
  '#2e7d5b',
  '#d24b3f',
  '#7a6ba8',
  '#b8862b',
  '#4b6bb5',
  '#5f6b72',
] as const;

/**
 * Цвет сектора диаграммы и соответствующей точки легенды по индексу.
 * Первые цвета — из общей палитры, дальше — дополнительные оттенки по «золотому углу»,
 * чтобы при большом числе категорий цвета не повторялись.
 */
export function chartColor(index: number): string {
  if (index < chartPalette.length) {
    return chartPalette[index];
  }
  const hue = Math.round((index * 137.508) % 360);
  return `hsl(${hue}, 42%, 38%)`;
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

export const shadows = {
  sm: '0 1px 2px rgba(22, 33, 42, 0.06)',
  md: '0 2px 8px rgba(22, 33, 42, 0.08)',
  lg: '0 12px 32px rgba(22, 33, 42, 0.16)',
} as const;

export const radii = {
  sm: '6px',
  md: '10px',
  lg: '14px',
} as const;

export const fontFamily =
  "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif";

/** Карта «имя токена → значение CSS-переменной», чтобы styles.css и TS смотрели в одну палитру. */
const cssVariables: Record<string, string> = {
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
  '--shadow-sm': shadows.sm,
  '--shadow-md': shadows.md,
  '--shadow-lg': shadows.lg,
  '--radius-sm': radii.sm,
  '--radius-md': radii.md,
  '--radius-lg': radii.lg,
  '--font-family': fontFamily,
};

/** Выставляет токены оформления в CSS-переменные корневого элемента. */
export function applyTheme(root: HTMLElement): void {
  for (const [name, value] of Object.entries(cssVariables)) {
    root.style.setProperty(name, value);
  }
}
