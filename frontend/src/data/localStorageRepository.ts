import type { Account, Category, Operation, Settings } from '../domain/types';
import type { DataRepository } from './repository';
import { readJson, removeKey, writeJson } from './storage';
import seedCategories from './seedCategories.json';

const KEYS = {
  accounts: 'finance.accounts',
  categories: 'finance.categories',
  operations: 'finance.operations',
  settings: 'finance.settings',
} as const;

const DEFAULT_SETTINGS: Settings = { currency: 'RUB', version: 1 };

interface SeedCategory {
  name: string;
  kind: 'income' | 'expense';
}

export class LocalStorageRepository implements DataRepository {
  private readonly seed: SeedCategory[] = seedCategories as SeedCategory[];

  listAccounts(): Account[] {
    return readJson<Account[]>(KEYS.accounts, []);
  }

  listCategories(): Category[] {
    const stored = readJson<Category[] | null>(KEYS.categories, null);
    if (stored !== null) {
      return stored;
    }
    const createdAt = new Date().toISOString();
    const categories = this.seed.map((category, index) => ({
      id: `seed-${index}-${category.kind}`,
      name: category.name,
      kind: category.kind,
      isSeed: true,
      createdAt,
    }));
    writeJson(KEYS.categories, categories);
    return categories;
  }

  listOperations(): Operation[] {
    return readJson<Operation[]>(KEYS.operations, []);
  }

  getSettings(): Settings {
    return readJson<Settings>(KEYS.settings, DEFAULT_SETTINGS);
  }

  saveAccount(account: Account): void {
    const accounts = this.listAccounts();
    const index = accounts.findIndex((item) => item.id === account.id);
    if (index >= 0) {
      accounts[index] = account;
    } else {
      accounts.push(account);
    }
    writeJson(KEYS.accounts, accounts);
  }

  removeAccount(id: string): void {
    const accounts = this.listAccounts().filter((account) => account.id !== id);
    writeJson(KEYS.accounts, accounts);

    // История операций сохраняется, но теряет привязку к удалённому счёту
    const operations = this.listOperations().map((operation) => ({
      ...operation,
      accountId: operation.accountId === id ? null : operation.accountId,
      targetAccountId: operation.targetAccountId === id ? null : operation.targetAccountId,
    }));
    writeJson(KEYS.operations, operations);
  }

  saveCategory(category: Category): void {
    const categories = this.listCategories();
    const index = categories.findIndex((item) => item.id === category.id);
    if (index >= 0) {
      categories[index] = category;
    } else {
      categories.push(category);
    }
    writeJson(KEYS.categories, categories);
  }

  removeCategory(id: string): void {
    const categories = this.listCategories().filter((category) => category.id !== id);
    writeJson(KEYS.categories, categories);

    // История операций сохраняется, но теряет привязку к удалённой категории
    const operations = this.listOperations().map((operation) =>
      operation.categoryId === id ? { ...operation, categoryId: null } : operation,
    );
    writeJson(KEYS.operations, operations);
  }

  saveOperation(operation: Operation): void {
    const operations = this.listOperations();
    const index = operations.findIndex((item) => item.id === operation.id);
    if (index >= 0) {
      operations[index] = operation;
    } else {
      operations.push(operation);
    }
    writeJson(KEYS.operations, operations);
  }

  removeOperation(id: string): void {
    const operations = this.listOperations().filter((operation) => operation.id !== id);
    writeJson(KEYS.operations, operations);
  }

  saveSettings(settings: Settings): void {
    writeJson(KEYS.settings, settings);
  }

  /** Полный сброс — используется в настройках. */
  clearAll(): void {
    removeKey(KEYS.accounts);
    removeKey(KEYS.categories);
    removeKey(KEYS.operations);
    removeKey(KEYS.settings);
  }
}
