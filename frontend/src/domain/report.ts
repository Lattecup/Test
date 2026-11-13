import type { Account, Category, Operation } from './types';

export interface Period {
  /** YYYY-MM-DD, включительно */
  from: string;
  /** YYYY-MM-DD, включительно */
  to: string;
}

export interface Totals {
  income: number;
  expense: number;
  transfers: number;
  /** Доходы минус расходы; переводы не влияют */
  net: number;
}

export interface CategoryRow {
  categoryId: string | null;
  name: string;
  income: number;
  expense: number;
  net: number;
}

export interface AccountRow {
  accountId: string | null;
  name: string;
  income: number;
  expense: number;
  transfersIn: number;
  transfersOut: number;
  net: number;
}

export interface MonthlyRow {
  /** YYYY-MM */
  month: string;
  income: number;
  expense: number;
  transfers: number;
  net: number;
}

export interface Report {
  period: Period;
  totals: Totals;
  byCategory: CategoryRow[];
  byAccount: AccountRow[];
  monthly: MonthlyRow[];
}

export interface Comparison {
  previousMonth: Totals;
  previousSameLength: Totals;
  previousMonthPeriod: Period;
  previousSameLengthPeriod: Period;
}

const DAY_MS = 24 * 60 * 60 * 1000;

export function parseIsoDate(iso: string): Date {
  return new Date(`${iso}T00:00:00Z`);
}

export function formatIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addDays(iso: string, days: number): string {
  const date = parseIsoDate(iso);
  return formatIsoDate(new Date(date.getTime() + days * DAY_MS));
}

/** Количество дней в периоде включительно. */
export function daysInPeriod(period: Period): number {
  const diff = parseIsoDate(period.to).getTime() - parseIsoDate(period.from).getTime();
  return Math.floor(diff / DAY_MS) + 1;
}

export function currentMonthPeriod(reference: Date = new Date()): Period {
  const year = reference.getUTCFullYear();
  const month = reference.getUTCMonth();
  const from = formatIsoDate(new Date(Date.UTC(year, month, 1)));
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const to = formatIsoDate(new Date(Date.UTC(year, month, lastDay)));
  return { from, to };
}

/** Предыдущий период той же длины, непосредственно перед выбранным. */
export function previousSameLengthPeriod(period: Period): Period {
  const length = daysInPeriod(period);
  return {
    from: addDays(period.from, -length),
    to: addDays(period.from, -1),
  };
}

/** Полный предыдущий календарный месяц перед месяцем начала периода. */
export function previousCalendarMonthPeriod(period: Period): Period {
  const start = parseIsoDate(period.from);
  const previous = new Date(
    Date.UTC(start.getUTCFullYear(), start.getUTCMonth() - 1, 1),
  );
  const year = previous.getUTCFullYear();
  const month = previous.getUTCMonth();
  const from = formatIsoDate(new Date(Date.UTC(year, month, 1)));
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const to = formatIsoDate(new Date(Date.UTC(year, month, lastDay)));
  return { from, to };
}

export function isWithinPeriod(operation: Operation, period: Period): boolean {
  return operation.date >= period.from && operation.date <= period.to;
}

export function formatMonth(month: string): string {
  const [year, monthNumber] = month.split('-');
  const names = [
    'январь',
    'февраль',
    'март',
    'апрель',
    'май',
    'июнь',
    'июль',
    'август',
    'сентябрь',
    'октябрь',
    'ноябрь',
    'декабрь',
  ];
  return `${names[Number(monthNumber) - 1]} ${year}`;
}

export function formatDate(iso: string): string {
  const [year, month, day] = iso.split('-');
  return `${day}.${month}.${year}`;
}

export function emptyTotals(): Totals {
  return { income: 0, expense: 0, transfers: 0, net: 0 };
}

export function calculateTotals(operations: Operation[]): Totals {
  const totals = emptyTotals();
  for (const operation of operations) {
    if (operation.type === 'income') {
      totals.income += operation.amount;
    } else if (operation.type === 'expense') {
      totals.expense += operation.amount;
    } else {
      totals.transfers += operation.amount;
    }
  }
  totals.net = totals.income - totals.expense;
  return totals;
}

export function buildReport(
  operations: Operation[],
  period: Period,
  categories: Category[],
  accounts: Account[],
): Report {
  const inPeriod = operations.filter((operation) => isWithinPeriod(operation, period));

  const categoryName = new Map(categories.map((category) => [category.id, category.name]));
  const accountName = new Map(accounts.map((account) => [account.id, account.name]));

  const categoryMap = new Map<string, CategoryRow>();
  const accountMap = new Map<string, AccountRow>();
  const monthMap = new Map<string, MonthlyRow>();

  const categoryRow = (id: string | null): CategoryRow => {
    const key = id ?? 'none';
    let row = categoryMap.get(key);
    if (!row) {
      row = {
        categoryId: id,
        name: id ? (categoryName.get(id) ?? 'Без категории') : 'Без категории',
        income: 0,
        expense: 0,
        net: 0,
      };
      categoryMap.set(key, row);
    }
    return row;
  };

  const accountRow = (id: string | null): AccountRow => {
    const key = id ?? 'none';
    let row = accountMap.get(key);
    if (!row) {
      row = {
        accountId: id,
        name: id ? (accountName.get(id) ?? 'Без счёта') : 'Без счёта',
        income: 0,
        expense: 0,
        transfersIn: 0,
        transfersOut: 0,
        net: 0,
      };
      accountMap.set(key, row);
    }
    return row;
  };

  const monthRow = (month: string): MonthlyRow => {
    let row = monthMap.get(month);
    if (!row) {
      row = { month, income: 0, expense: 0, transfers: 0, net: 0 };
      monthMap.set(month, row);
    }
    return row;
  };

  for (const operation of inPeriod) {
    const month = operation.date.slice(0, 7);
    const monthLine = monthRow(month);

    if (operation.type === 'income' || operation.type === 'expense') {
      const category = categoryRow(operation.categoryId);
      const account = accountRow(operation.accountId);
      if (operation.type === 'income') {
        category.income += operation.amount;
        category.net += operation.amount;
        account.income += operation.amount;
        account.net += operation.amount;
        monthLine.income += operation.amount;
        monthLine.net += operation.amount;
      } else {
        category.expense += operation.amount;
        category.net -= operation.amount;
        account.expense += operation.amount;
        account.net -= operation.amount;
        monthLine.expense += operation.amount;
        monthLine.net -= operation.amount;
      }
    } else {
      monthLine.transfers += operation.amount;
      const source = accountRow(operation.accountId);
      source.transfersOut += operation.amount;
      const target = accountRow(operation.targetAccountId);
      target.transfersIn += operation.amount;
    }
  }

  const byCategory = [...categoryMap.values()].sort(
    (left, right) => right.expense - left.expense || right.income - left.income,
  );
  const byAccount = [...accountMap.values()].sort(
    (left, right) => Math.abs(right.net) - Math.abs(left.net),
  );
  const monthly = [...monthMap.values()].sort((left, right) =>
    left.month.localeCompare(right.month),
  );

  return {
    period,
    totals: calculateTotals(inPeriod),
    byCategory,
    byAccount,
    monthly,
  };
}

export function buildComparison(
  operations: Operation[],
  period: Period,
): Comparison {
  const previousMonthRange = previousCalendarMonthPeriod(period);
  const previousSameLengthRange = previousSameLengthPeriod(period);

  const totalsFor = (range: Period): Totals =>
    calculateTotals(operations.filter((operation) => isWithinPeriod(operation, range)));

  return {
    previousMonth: totalsFor(previousMonthRange),
    previousSameLength: totalsFor(previousSameLengthRange),
    previousMonthPeriod: previousMonthRange,
    previousSameLengthPeriod: previousSameLengthRange,
  };
}
