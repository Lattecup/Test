import { createContext, useContext } from 'react';
import type { Account, Category, Operation, Settings } from '../domain/types';

export interface AppState {
  accounts: Account[];
  categories: Category[];
  operations: Operation[];
  settings: Settings;
  /** Сообщение об ошибке хранилища */
  storageError: string | null;
}

export interface AppApi extends AppState {
  saveAccount(account: Account): void;
  removeAccount(id: string): void;
  saveCategory(category: Category): void;
  removeCategory(id: string): void;
  saveOperation(operation: Operation): void;
  removeOperation(id: string): void;
  saveSettings(settings: Settings): void;
  dismissStorageError(): void;
}

export const AppContext = createContext<AppApi | null>(null);

export function useApp(): AppApi {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp используется вне AppProvider');
  }
  return context;
}
