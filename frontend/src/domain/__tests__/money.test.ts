import { describe, expect, it } from 'vitest';
import { formatMoney, minorToDecimalString, parseAmountToMinor } from '../money';

describe('parseAmountToMinor', () => {
  it('разбирает целое число', () => {
    expect(parseAmountToMinor('1200')).toBe(120000);
  });

  it('разбирает десятичную дробь с точкой', () => {
    expect(parseAmountToMinor('12.34')).toBe(1234);
  });

  it('разбирает десятичную дробь с запятой', () => {
    expect(parseAmountToMinor('12,34')).toBe(1234);
  });

  it('игнорирует пробелы-разделители разрядов', () => {
    expect(parseAmountToMinor(' 1 234,56 ')).toBe(123456);
  });

  it('отклоняет значение с тремя знаками после запятой', () => {
    expect(parseAmountToMinor('12,345')).toBeNull();
  });

  it('отклоняет нечисловое значение', () => {
    expect(parseAmountToMinor('abc')).toBeNull();
  });

  it('отклоняет пустую строку', () => {
    expect(parseAmountToMinor('')).toBeNull();
  });
});

describe('formatMoney', () => {
  it('форматирует сумму с валютой', () => {
    expect(formatMoney(123456, 'RUB')).toBe('1 234,56 RUB');
  });

  it('форматирует ноль', () => {
    expect(formatMoney(0, 'RUB')).toBe('0,00 RUB');
  });
});

describe('minorToDecimalString', () => {
  it('возвращает строку с точкой', () => {
    expect(minorToDecimalString(1234)).toBe('12.34');
  });
});
