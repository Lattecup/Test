import { describe, expect, it } from 'vitest';
import { calculateAccountBalance, validateOperation } from '../operations';
import type { Account, Category, Operation } from '../types';

const accounts: Account[] = [
  {
    id: 'cash',
    name: 'Наличные',
    type: 'Наличные',
    initialBalance: 100000,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'card',
    name: 'Карта',
    type: 'Карта',
    initialBalance: 50000,
    createdAt: '2026-01-01T00:00:00Z',
  },
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

describe('calculateAccountBalance', () => {
  it('возвращает начальный баланс без операций', () => {
    expect(calculateAccountBalance(accounts[0], [])).toBe(100000);
  });

  it('учитывает расход со знаком минус', () => {
    const operations = [operation({ amount: 25000 })];
    expect(calculateAccountBalance(accounts[0], operations)).toBe(75000);
  });

  it('учитывает доход со знаком плюс', () => {
    const operations = [
      operation({ type: 'income', amount: 5000, categoryId: 'salary' }),
    ];
    expect(calculateAccountBalance(accounts[0], operations)).toBe(105000);
  });

  it('списывает сумму перевода с источника и зачисляет получателю', () => {
    const operations = [
      operation({ type: 'transfer', amount: 30000, categoryId: null, targetAccountId: 'card' }),
    ];
    expect(calculateAccountBalance(accounts[0], operations)).toBe(70000);
    expect(calculateAccountBalance(accounts[1], operations)).toBe(80000);
  });
});

describe('validateOperation', () => {
  it('принимает корректный расход', () => {
    expect(validateOperation(operation({}), accounts, categories, [])).toBeNull();
  });

  it('отклоняет неположительную сумму', () => {
    expect(validateOperation(operation({ amount: 0 }), accounts, categories, [])).toBe(
      'Сумма должна быть больше нуля',
    );
  });

  it('отклоняет некорректную дату', () => {
    expect(validateOperation(operation({ date: '10.03.2026' }), accounts, categories, [])).toBe(
      'Укажите корректную дату',
    );
  });

  it('отклоняет расход, превышающий остаток счёта', () => {
    const error = validateOperation(
      operation({ amount: 200000 }),
      accounts,
      categories,
      [],
    );
    expect(error).toBe('Недостаточно средств на счёте «Наличные»');
  });

  it('при редактировании не учитывает саму операцию при проверке остатка', () => {
    const existing = operation({ id: 'op-1', amount: 90000 });
    const error = validateOperation(
      operation({ id: 'op-1', amount: 90000 }),
      accounts,
      categories,
      [existing],
      { excludeOperationId: 'op-1' },
    );
    expect(error).toBeNull();
  });

  it('отклоняет категорию другого типа', () => {
    const error = validateOperation(
      operation({ type: 'income', categoryId: 'food' }),
      accounts,
      categories,
      [],
    );
    expect(error).toBe('Категория не соответствует типу операции');
  });

  it('отклоняет перевод в тот же счёт', () => {
    const error = validateOperation(
      operation({ type: 'transfer', categoryId: null, targetAccountId: 'cash' }),
      accounts,
      categories,
      [],
    );
    expect(error).toBe('Укажите два разных счёта');
  });

  it('отклоняет перевод, превышающий остаток счёта-источника', () => {
    const error = validateOperation(
      operation({ type: 'transfer', categoryId: null, amount: 500000, targetAccountId: 'card' }),
      accounts,
      categories,
      [],
    );
    expect(error).toBe('Недостаточно средств на счёте «Наличные»');
  });

  it('отклоняет операцию без счёта', () => {
    const error = validateOperation(operation({ accountId: null }), accounts, categories, []);
    expect(error).toBe('Выберите счёт');
  });
});
