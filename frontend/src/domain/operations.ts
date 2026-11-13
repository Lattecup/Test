import type { Account, Category, Operation } from './types';

/** Изменение остатка счёта от одной операции. */
export function effectOnAccount(operation: Operation, accountId: string): number {
  if (operation.type === 'income') {
    return operation.accountId === accountId ? operation.amount : 0;
  }
  if (operation.type === 'expense') {
    return operation.accountId === accountId ? -operation.amount : 0;
  }
  // Перевод без одной из сторон потерял привязку к счетам и не влияет на остатки
  if (!operation.accountId || !operation.targetAccountId) {
    return 0;
  }
  if (operation.accountId === accountId) {
    return -operation.amount;
  }
  if (operation.targetAccountId === accountId) {
    return operation.amount;
  }
  return 0;
}

/** Текущий остаток счёта: начальный баланс плюс все операции по счёту. */
export function calculateAccountBalance(
  account: Account,
  operations: Operation[],
): number {
  return operations.reduce(
    (balance, operation) => balance + effectOnAccount(operation, account.id),
    account.initialBalance,
  );
}

/** Остаток счёта без учёта редактируемой операции. */
export function calculateBalanceExcluding(
  account: Account,
  operations: Operation[],
  excludedOperationId: string,
): number {
  return calculateAccountBalance(
    account,
    operations.filter((operation) => operation.id !== excludedOperationId),
  );
}

export interface ValidationOptions {
  /** Операция, которую редактируют — не учитывается при проверке остатка */
  excludeOperationId?: string;
}

/**
 * Проверка операции. Возвращает текст ошибки или null, если всё в порядке.
 */
export function validateOperation(
  operation: Operation,
  accounts: Account[],
  categories: Category[],
  operations: Operation[],
  options: ValidationOptions = {},
): string | null {
  if (!Number.isFinite(operation.amount) || operation.amount <= 0) {
    return 'Сумма должна быть больше нуля';
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(operation.date)) {
    return 'Укажите корректную дату';
  }

  const accountById = new Map(accounts.map((account) => [account.id, account]));

  if (operation.type === 'transfer') {
    const source = operation.accountId ? accountById.get(operation.accountId) : undefined;
    const target = operation.targetAccountId
      ? accountById.get(operation.targetAccountId)
      : undefined;
    if (!source) {
      return 'Выберите счёт, с которого списываются деньги';
    }
    if (!target) {
      return 'Выберите счёт, на который поступают деньги';
    }
    if (source.id === target.id) {
      return 'Укажите два разных счёта';
    }
    const balance = calculateBalanceExcluding(
      source,
      operations,
      options.excludeOperationId ?? '',
    );
    if (balance - operation.amount < 0) {
      return `Недостаточно средств на счёте «${source.name}»`;
    }
    return null;
  }

  const account = operation.accountId ? accountById.get(operation.accountId) : undefined;
  if (!account) {
    return 'Выберите счёт';
  }

  const category = operation.categoryId
    ? categories.find((item) => item.id === operation.categoryId)
    : undefined;
  if (!category) {
    return 'Выберите категорию';
  }
  const expectedKind = operation.type === 'income' ? 'income' : 'expense';
  if (category.kind !== expectedKind) {
    return 'Категория не соответствует типу операции';
  }

  if (operation.type === 'expense') {
    const balance = calculateBalanceExcluding(
      account,
      operations,
      options.excludeOperationId ?? '',
    );
    if (balance - operation.amount < 0) {
      return `Недостаточно средств на счёте «${account.name}»`;
    }
  }

  return null;
}
