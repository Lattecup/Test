import type { Account, Category, Operation, Settings } from '../domain/types';

export interface DataRepository {
  listAccounts(): Account[];
  listCategories(): Category[];
  listOperations(): Operation[];
  getSettings(): Settings;

  saveAccount(account: Account): void;
  removeAccount(id: string): void;

  saveCategory(category: Category): void;
  removeCategory(id: string): void;

  saveOperation(operation: Operation): void;
  removeOperation(id: string): void;

  saveSettings(settings: Settings): void;
}

/** Ошибка доступа к хранилищу: недоступно или повреждено. */
export class StorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StorageError';
  }
}
