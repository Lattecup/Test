import type { Account, Category, Operation, Settings } from '../domain/types.js';

export interface AccountService {
  list(): Promise<Account[]>;
  save(account: Account): Promise<Account>;
  remove(id: string): Promise<void>;
}

export interface CategoryService {
  list(): Promise<Category[]>;
  save(category: Category): Promise<Category>;
  remove(id: string): Promise<void>;
}

export interface OperationService {
  list(filter: OperationFilter): Promise<Operation[]>;
  save(operation: Operation): Promise<Operation>;
  remove(id: string): Promise<void>;
}

export interface OperationFilter {
  from?: string;
  to?: string;
  accountId?: string;
  categoryId?: string;
  type?: Operation['type'];
}

export interface ReportService {
  build(period: { from: string; to: string }): Promise<unknown>;
}

export interface SettingsService {
  get(): Promise<Settings>;
  save(settings: Settings): Promise<Settings>;
}
