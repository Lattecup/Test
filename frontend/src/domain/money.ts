/** Разбор суммы из строки ввода в минорные единицы. null — значение некорректно. */
export function parseAmountToMinor(input: string): number | null {
  const normalized = input.replace(/[\s\u00A0\u202F]/g, '').replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    return null;
  }
  const [whole, fraction = ''] = normalized.split('.');
  return Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
}

/** Форматирование минорных единиц с валютой: 123456 → «1 234,56 ₽». */
export function formatMoney(minor: number, currency: string): string {
  const value = (minor / 100).toLocaleString('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${value} ${currency}`;
}

/** Минорные единицы в строку с точкой — для выгрузки. */
export function minorToDecimalString(minor: number): string {
  return (minor / 100).toFixed(2);
}
