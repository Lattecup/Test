import { useCallback, useMemo, useState, type ReactNode } from 'react';
import type { Account, Category, Operation, Settings } from '../domain/types';
import { LocalStorageRepository } from '../data/localStorageRepository';
import { StorageError } from '../data/repository';
import { AppContext, type AppState } from './appContext';

const EMPTY_STATE: AppState = {
  accounts: [],
  categories: [],
  operations: [],
  settings: { currency: 'RUB', version: 1 },
  storageError: null,
};

function errorMessage(error: unknown): string {
  if (error instanceof StorageError) {
    return error.message;
  }
  return 'Не удалось прочитать данные из хранилища браузера.';
}

function loadState(repository: LocalStorageRepository): AppState {
  try {
    return {
      accounts: repository.listAccounts(),
      categories: repository.listCategories(),
      operations: repository.listOperations(),
      settings: repository.getSettings(),
      storageError: null,
    };
  } catch (error) {
    return { ...EMPTY_STATE, storageError: errorMessage(error) };
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const repository = useMemo(() => new LocalStorageRepository(), []);
  const [state, setState] = useState<AppState>(() => loadState(repository));

  const reload = useCallback(() => {
    setState(loadState(repository));
  }, [repository]);

  const run = useCallback(
    (action: () => void) => {
      try {
        action();
      } catch (error) {
        setState((current) => ({ ...current, storageError: errorMessage(error) }));
        return;
      }
      reload();
    },
    [reload],
  );

  const api = useMemo(
    () => ({
      ...state,
      saveAccount: (account: Account) => run(() => repository.saveAccount(account)),
      removeAccount: (id: string) => run(() => repository.removeAccount(id)),
      saveCategory: (category: Category) => run(() => repository.saveCategory(category)),
      removeCategory: (id: string) => run(() => repository.removeCategory(id)),
      saveOperation: (operation: Operation) => run(() => repository.saveOperation(operation)),
      removeOperation: (id: string) => run(() => repository.removeOperation(id)),
      saveSettings: (settings: Settings) => run(() => repository.saveSettings(settings)),
      dismissStorageError: () => setState((current) => ({ ...current, storageError: null })),
    }),
    [repository, run, state],
  );

  return <AppContext.Provider value={api}>{children}</AppContext.Provider>;
}
