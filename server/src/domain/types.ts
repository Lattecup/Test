export type CategoryKind = 'income' | 'expense';

export type OperationType = 'income' | 'expense' | 'transfer';

export interface Account {
  id: string;
  name: string;
  type: string;
  /** Минорные единицы */
  initialBalance: number;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  kind: CategoryKind;
  isSeed: boolean;
  createdAt: string;
}

export interface Operation {
  id: string;
  type: OperationType;
  amount: number;
  date: string;
  accountId: string | null;
  targetAccountId: string | null;
  categoryId: string | null;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  currency: string;
  version: number;
}
