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

chartPalette.forEach((color, index) => {
  cssVariables[`--chart-${index + 1}`] = color;
});

/** Выставляет токены оформления в CSS-переменные корневого элемента. */
export function applyTheme(root: HTMLElement): void {
  for (const [name, value] of Object.entries(cssVariables)) {
    root.style.setProperty(name, value);
  }
}
