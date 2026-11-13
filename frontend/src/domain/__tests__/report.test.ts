import { describe, expect, it } from 'vitest';
import {
  buildComparison,
  buildReport,
  daysInPeriod,
  previousCalendarMonthPeriod,
  previousSameLengthPeriod,
} from '../report';
import type { Account, Category, Operation } from '../types';

const accounts: Account[] = [
  { id: 'cash', name: 'Наличные', type: '', initialBalance: 0, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'card', name: 'Карта', type: '', initialBalance: 0, createdAt: '2026-01-01T00:00:00Z' },
];

const categories: Category[] = [
  { id: 'salary', name: 'Зарплата', kind: 'income', isSeed: true, createdAt: '2026-01-01T00:00:00Z' },
  { id: 'food', name: 'Продукты', kind: 'expense', isSeed: true, createdAt: '2026-01-01T00:00:00Z' },
];

function operation(partial: Partial<Operation>): Operation {
  return {
    id: 'op-1',
    type: 'expense',
    amount: 1000,
    date: '2026-03-10',
    accountId: 'cash',
    targetAccountId: null,
    categoryId: 'food',
    comment: '',
    createdAt: '2026-03-10T10:00:00Z',
    updatedAt: '2026-03-10T10:00:00Z',
    ...partial,
  };
}

const period = { from: '2026-03-01', to: '2026-03-31' };

describe('buildReport', () => {
  it('разводит доходы, расходы и переводы', () => {
    const operations = [
      operation({ id: '1', type: 'income', amount: 50000, categoryId: 'salary' }),
      operation({ id: '2', type: 'expense', amount: 20000 }),
      operation({ id: '3', type: 'transfer', amount: 10000, categoryId: null, targetAccountId: 'card' }),
    ];
    const report = buildReport(operations, period, categories, accounts);

    expect(report.totals.income).toBe(50000);
    expect(report.totals.expense).toBe(20000);
    expect(report.totals.transfers).toBe(10000);
    expect(report.totals.net).toBe(30000);
  });

  it('не учитывает операции вне периода', () => {
    const operations = [operation({ id: '1', date: '2026-04-01' })];
    const report = buildReport(operations, period, categories, accounts);
    expect(report.totals.expense).toBe(0);
  });

  it('собирает разбивку по категориям', () => {
    const operations = [
      operation({ id: '1', amount: 3000 }),
      operation({ id: '2', amount: 7000 }),
    ];
    const report = buildReport(operations, period, categories, accounts);
    const food = report.byCategory.find((row) => row.categoryId === 'food');
    expect(food?.expense).toBe(10000);
  });

  it('показывает операции без категории и без счёта', () => {
    const operations = [operation({ id: '1', categoryId: null, accountId: null })];
    const report = buildReport(operations, period, categories, accounts);
    expect(report.byCategory[0].name).toBe('Без категории');
    expect(report.byAccount[0].name).toBe('Без счёта');
  });

  it('разбивает операции по месяцам периода', () => {
    const operations = [
      operation({ id: '1', date: '2026-03-05' }),
      operation({ id: '2', date: '2026-03-20' }),
    ];
    const report = buildReport(operations, period, categories, accounts);
    expect(report.monthly).toHaveLength(1);
    expect(report.monthly[0].month).toBe('2026-03');
    expect(report.monthly[0].expense).toBe(2000);
  });

  it('считает переводы по счетам отдельно входящими и исходящими', () => {
    const operations = [
      operation({ id: '1', type: 'transfer', amount: 10000, categoryId: null, targetAccountId: 'card' }),
    ];
    const report = buildReport(operations, period, categories, accounts);
    const source = report.byAccount.find((row) => row.accountId === 'cash');
    const target = report.byAccount.find((row) => row.accountId === 'card');
    expect(source?.transfersOut).toBe(10000);
    expect(target?.transfersIn).toBe(10000);
  });

  it('не относит перевод без одной из сторон ни к одному счёту', () => {
    const operations = [
      operation({
        id: '1',
        type: 'transfer',
        amount: 10000,
        categoryId: null,
        accountId: null,
        targetAccountId: 'card',
      }),
    ];
    const report = buildReport(operations, period, categories, accounts);
    expect(report.byAccount.find((row) => row.accountId === 'card')?.transfersIn).toBeUndefined();
    expect(report.totals.transfers).toBe(10000);
  });
});

describe('периоды сравнения', () => {
  it('считает длину периода включительно', () => {
    expect(daysInPeriod(period)).toBe(31);
  });

  it('предыдущий период той же длины идёт непосредственно перед выбранным', () => {
    const previous = previousSameLengthPeriod(period);
    expect(previous.from).toBe('2026-01-29');
    expect(previous.to).toBe('2026-02-28');
  });

  it('предыдущий календарный месяц — полный месяц перед месяцем начала', () => {
    const previous = previousCalendarMonthPeriod(period);
    expect(previous.from).toBe('2026-02-01');
    expect(previous.to).toBe('2026-02-28');
  });

  it('сравнение считает итоги обоих предыдущих периодов', () => {
    const operations = [
      operation({ id: '1', type: 'income', amount: 50000, categoryId: 'salary', date: '2026-02-10' }),
      operation({ id: '2', amount: 1000, date: '2026-03-10' }),
    ];
    const comparison = buildComparison(operations, period);
    expect(comparison.previousMonth.income).toBe(50000);
    expect(comparison.previousSameLength.income).toBe(50000);
  });
});
