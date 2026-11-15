import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Account, Category, Operation, Settings, ThemeName } from '../domain/types';
import { LocalStorageRepository } from '../data/localStorageRepository';
import { StorageError } from '../data/repository';
import { applyTheme } from '../ui/theme';
import { AppContext, type AppState } from './appContext';

const EMPTY_STATE: AppState = {
  accounts: [],
  categories: [],
  operations: [],
  settings: { currency: 'RUB', theme: 'light', version: 2 },
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

  // Токены темы выставляются в CSS-переменные при смене темы
  useEffect(() => {
    applyTheme(document.documentElement, state.settings.theme);
  }, [state.settings.theme]);

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
      setTheme: (theme: ThemeName) =>
        run(() => repository.saveSettings({ ...state.settings, theme })),
      toggleTheme: () =>
        run(() =>
          repository.saveSettings({
            ...state.settings,
            theme: state.settings.theme === 'dark' ? 'light' : 'dark',
          }),
        ),
      dismissStorageError: () => setState((current) => ({ ...current, storageError: null })),
    }),
    [repository, run, state],
  );

  return <AppContext.Provider value={api}>{children}</AppContext.Provider>;
}
