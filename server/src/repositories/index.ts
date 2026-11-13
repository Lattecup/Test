import type { Account, Category, Operation, Settings } from '../domain/types.js';

export interface AccountRepository {
  list(): Promise<Account[]>;
  get(id: string): Promise<Account | null>;
  save(account: Account): Promise<void>;
  remove(id: string): Promise<void>;
}

export interface CategoryRepository {
  list(): Promise<Category[]>;
  get(id: string): Promise<Category | null>;
  save(category: Category): Promise<void>;
  remove(id: string): Promise<void>;
}

export interface OperationRepository {
  list(): Promise<Operation[]>;
  get(id: string): Promise<Operation | null>;
  save(operation: Operation): Promise<void>;
  remove(id: string): Promise<void>;
}

export interface SettingsRepository {
  get(): Promise<Settings>;
  save(settings: Settings): Promise<void>;
}
