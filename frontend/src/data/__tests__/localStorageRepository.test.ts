import { beforeEach, describe, expect, it } from 'vitest';
import type { Operation } from '../../domain/types';
import { LocalStorageRepository } from '../localStorageRepository';

function createFakeStorage(): Storage {
  const data = new Map<string, string>();
  return {
    get length() {
      return data.size;
    },
    clear: () => data.clear(),
    getItem: (key: string) => data.get(key) ?? null,
    key: (index: number) => [...data.keys()][index] ?? null,
    removeItem: (key: string) => {
      data.delete(key);
    },
    setItem: (key: string, value: string) => {
      data.set(key, value);
    },
  } as Storage;
}

function operation(partial: Partial<Operation>): Operation {
  return {
    id: 'op-1',
    type: 'expense',
    amount: 1000,
    date: '2026-03-10',
    accountId: 'acc-1',
    targetAccountId: null,
    categoryId: 'cat-1',
    comment: '',
    createdAt: '2026-03-10T10:00:00Z',
    updatedAt: '2026-03-10T10:00:00Z',
    ...partial,
  };
}

describe('LocalStorageRepository', () => {
  let repository: LocalStorageRepository;

  beforeEach(() => {
    (globalThis as unknown as { window: { localStorage: Storage } }).window = {
      localStorage: createFakeStorage(),
    };
    repository = new LocalStorageRepository();
  });

  it('создаёт стартовый набор категорий при первом обращении', () => {
    const categories = repository.listCategories();
    expect(categories.length).toBeGreaterThan(0);
    expect(categories.every((category) => category.isSeed)).toBe(true);
    expect(categories.some((category) => category.kind === 'income')).toBe(true);
    expect(categories.some((category) => category.kind === 'expense')).toBe(true);
  });

  it('не пересоздаёт категории при повторном обращении', () => {
    const first = repository.listCategories();
    const second = repository.listCategories();
    expect(second).toHaveLength(first.length);
  });

  it('сохраняет и читает счёт', () => {
    repository.saveAccount({
      id: 'acc-1',
      name: 'Наличные',
      type: 'Наличные',
      initialBalance: 5000,
      createdAt: '2026-01-01T00:00:00Z',
    });
    expect(repository.listAccounts()).toHaveLength(1);
    expect(repository.listAccounts()[0].name).toBe('Наличные');
  });

  it('удаляет счёт, но сохраняет историю операций без привязки', () => {
    repository.saveOperation(operation({}));
    repository.removeAccount('acc-1');
    const operations = repository.listOperations();
    expect(operations).toHaveLength(1);
    expect(operations[0].accountId).toBeNull();
  });

  it('удаляет категорию, но сохраняет историю операций без привязки', () => {
    repository.saveOperation(operation({}));
    repository.removeCategory('cat-1');
    const operations = repository.listOperations();
    expect(operations).toHaveLength(1);
    expect(operations[0].categoryId).toBeNull();
  });

  it('отвязывает обе стороны перевода при удалении одного из счетов', () => {
    repository.saveOperation(
      operation({ id: 'op-2', type: 'transfer', targetAccountId: 'acc-2', categoryId: null }),
    );
    repository.removeAccount('acc-2');
    const operations = repository.listOperations();
    expect(operations[0].targetAccountId).toBeNull();
    expect(operations[0].accountId).toBeNull();
  });

  it('перезаписывает операцию с тем же идентификатором', () => {
    repository.saveOperation(operation({ amount: 1000 }));
    repository.saveOperation(operation({ amount: 2500 }));
    const operations = repository.listOperations();
    expect(operations).toHaveLength(1);
    expect(operations[0].amount).toBe(2500);
  });

  it('возвращает настройки по умолчанию', () => {
    expect(repository.getSettings()).toEqual({ currency: 'RUB', version: 1 });
  });
});
