import { StorageError } from './repository';

function getStorage(): Storage | null {
  try {
    const storage = window.localStorage;
    const probe = '__finance_probe__';
    storage.setItem(probe, '1');
    storage.removeItem(probe);
    return storage;
  } catch {
    return null;
  }
}

export function readJson<T>(key: string, fallback: T): T {
  const storage = getStorage();
  if (!storage) {
    throw new StorageError(
      'Хранилище браузера недоступно. Откройте приложение в обычном режиме, без приватного окна.',
    );
  }
  const raw = storage.getItem(key);
  if (raw === null) {
    return fallback;
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new StorageError(
      `Повреждены данные в разделе «${key}». Очистите данные сайта в браузере и введите операции заново.`,
    );
  }
}

export function writeJson(key: string, value: unknown): void {
  const storage = getStorage();
  if (!storage) {
    throw new StorageError(
      'Хранилище браузера недоступно. Откройте приложение в обычном режиме, без приватного окна.',
    );
  }
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    throw new StorageError('Не удалось сохранить данные: хранилище браузера переполнено.');
  }
}

export function removeKey(key: string): void {
  const storage = getStorage();
  if (!storage) {
    throw new StorageError('Хранилище браузера недоступно.');
  }
  storage.removeItem(key);
}
