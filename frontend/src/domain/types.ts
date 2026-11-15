export type CategoryKind = 'income' | 'expense';

export type OperationType = 'income' | 'expense' | 'transfer';

export interface Account {
  id: string;
  name: string;
  /** Свободный справочник: «Наличные», «Карта», «Вклад» */
  type: string;
  /** Минорные единицы (копейки/центы) */
  initialBalance: number;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  kind: CategoryKind;
  /** true — из стартового набора */
  isSeed: boolean;
  createdAt: string;
}

export interface Operation {
  id: string;
  type: OperationType;
  /** Минорные единицы, всегда > 0 */
  amount: number;
  /** Дата в формате YYYY-MM-DD */
  date: string;
  /** null — счёт удалён, операция осталась в истории */
  accountId: string | null;
  /** Заполняется только для переводов */
  targetAccountId: string | null;
  /** null — категория удалена, операция осталась в истории */
  categoryId: string | null;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

/** Тема оформления интерфейса. */
export type ThemeName = 'light' | 'dark';

export interface Settings {
  /** Код валюты, по умолчанию RUB */
  currency: string;
  /** Выбранная тема оформления */
  theme: ThemeName;
  /** Версия формата хранимых данных — для будущих миграций */
  version: number;
}
