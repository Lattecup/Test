import { useMemo, useState } from 'react';
import type { Operation, OperationType } from '../../domain/types';
import { validateOperation } from '../../domain/operations';
import { formatMoney, parseAmountToMinor } from '../../domain/money';
import { currentMonthPeriod, formatDate } from '../../domain/report';
import { useApp } from '../../state/appContext';
import { EmptyState } from '../../ui/EmptyState';
import { Field } from '../../ui/Field';
import { Modal } from '../../ui/Modal';

const TYPE_LABELS: Record<OperationType, string> = {
  income: 'Доход',
  expense: 'Расход',
  transfer: 'Перевод',
};

const TYPE_CLASSES: Record<OperationType, string> = {
  income: 'amount-income',
  expense: 'amount-expense',
  transfer: 'amount-transfer',
};

interface OperationForm {
  id: string | null;
  type: OperationType;
  amount: string;
  date: string;
  accountId: string;
  targetAccountId: string;
  categoryId: string;
  comment: string;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function emptyForm(): OperationForm {
  return {
    id: null,
    type: 'expense',
    amount: '',
    date: today(),
    accountId: '',
    targetAccountId: '',
    categoryId: '',
    comment: '',
  };
}

export function OperationsPage() {
  const { accounts, categories, operations, settings, saveOperation, removeOperation } = useApp();

  const month = currentMonthPeriod();
  const [filterFrom, setFilterFrom] = useState(month.from);
  const [filterTo, setFilterTo] = useState(month.to);
  const [filterAccount, setFilterAccount] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterType, setFilterType] = useState('');

  const [form, setForm] = useState<OperationForm | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [amountError, setAmountError] = useState<string | null>(null);
  const [pendingRemoval, setPendingRemoval] = useState<Operation | null>(null);

  const accountName = useMemo(
    () => new Map(accounts.map((account) => [account.id, account.name])),
    [accounts],
  );
  const categoryName = useMemo(
    () => new Map(categories.map((category) => [category.id, category.name])),
    [categories],
  );

  const filtered = useMemo(() => {
    return operations
      .filter((operation) => operation.date >= filterFrom && operation.date <= filterTo)
      .filter(
        (operation) =>
          !filterAccount ||
          operation.accountId === filterAccount ||
          operation.targetAccountId === filterAccount,
      )
      .filter((operation) => !filterCategory || operation.categoryId === filterCategory)
      .filter((operation) => !filterType || operation.type === filterType)
      .sort((left, right) =>
        left.date === right.date
          ? right.createdAt.localeCompare(left.createdAt)
          : right.date.localeCompare(left.date),
      );
  }, [operations, filterFrom, filterTo, filterAccount, filterCategory, filterType]);

  const availableCategories = useMemo(
    () =>
      categories.filter((category) =>
        form?.type === 'income' ? category.kind === 'income' : category.kind === 'expense',
      ),
    [categories, form?.type],
  );

  const openCreate = (type: OperationType) => {
    setError(null);
    setAmountError(null);
    setForm({ ...emptyForm(), type });
  };

  const openEdit = (operation: Operation) => {
    setError(null);
    setAmountError(null);
    setForm({
      id: operation.id,
      type: operation.type,
      amount: String(operation.amount / 100),
      date: operation.date,
      accountId: operation.accountId ?? '',
      targetAccountId: operation.targetAccountId ?? '',
      categoryId: operation.categoryId ?? '',
      comment: operation.comment,
    });
  };

  const submit = () => {
    if (!form) {
      return;
    }
    const amount = parseAmountToMinor(form.amount);
    if (amount === null) {
      setAmountError('Введите сумму числом, например 1 234,56');
      return;
    }
    const now = new Date().toISOString();
    const existing = operations.find((operation) => operation.id === form.id);
    const candidate: Operation = {
      id: form.id ?? crypto.randomUUID(),
      type: form.type,
      amount,
      date: form.date,
      accountId: form.accountId || null,
      targetAccountId: form.type === 'transfer' ? form.targetAccountId || null : null,
      categoryId: form.type === 'transfer' ? null : form.categoryId || null,
      comment: form.comment.trim(),
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    const validationError = validateOperation(candidate, accounts, categories, operations, {
      excludeOperationId: candidate.id,
    });
    if (validationError) {
      setError(validationError);
      setAmountError(
        validationError.startsWith('Недостаточно средств') ? validationError : null,
      );
      return;
    }

    saveOperation(candidate);
    setForm(null);
  };

  return (
    <>
      <div className="page-header">
        <h2>Операции</h2>
        <div className="actions">
          <button onClick={() => openCreate('income')}>Добавить доход</button>
          <button onClick={() => openCreate('expense')}>Добавить расход</button>
          <button className="primary" onClick={() => openCreate('transfer')}>
            Добавить перевод
          </button>
        </div>
      </div>

      <div className="card">
        <div className="row">
          <Field label="Период с">
            <input
              type="date"
              value={filterFrom}
              onChange={(event) => setFilterFrom(event.target.value)}
            />
          </Field>
          <Field label="по">
            <input
              type="date"
              value={filterTo}
              onChange={(event) => setFilterTo(event.target.value)}
            />
          </Field>
          <Field label="Счёт">
            <select
              value={filterAccount}
              onChange={(event) => setFilterAccount(event.target.value)}
            >
              <option value="">Все счета</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Категория">
            <select
              value={filterCategory}
              onChange={(event) => setFilterCategory(event.target.value)}
            >
              <option value="">Все категории</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Тип">
            <select value={filterType} onChange={(event) => setFilterType(event.target.value)}>
              <option value="">Все типы</option>
              {Object.entries(TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </div>

      <div className="card">
        {filtered.length === 0 ? (
          <EmptyState message="За выбранный период операций нет." />
        ) : (
          <table>
            <thead>
              <tr>
                <th>Дата</th>
                <th>Тип</th>
                <th>Сумма</th>
                <th>Счёт</th>
                <th>Категория</th>
                <th>Комментарий</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((operation) => (
                <tr key={operation.id}>
                  <td>{formatDate(operation.date)}</td>
                  <td>{TYPE_LABELS[operation.type]}</td>
                  <td className={`num ${TYPE_CLASSES[operation.type]}`}>
                    {operation.type === 'expense' ? '−' : operation.type === 'income' ? '+' : '→'}{' '}
                    {formatMoney(operation.amount, settings.currency)}
                  </td>
                  <td>
                    {operation.accountId
                      ? (accountName.get(operation.accountId) ?? 'Без счёта')
                      : 'Без счёта'}
                    {operation.type === 'transfer' && operation.targetAccountId ? (
                      <span> → {accountName.get(operation.targetAccountId) ?? 'Без счёта'}</span>
                    ) : null}
                  </td>
                  <td>
                    {operation.categoryId
                      ? (categoryName.get(operation.categoryId) ?? 'Без категории')
                      : 'Без категории'}
                  </td>
                  <td>{operation.comment}</td>
                  <td className="num">
                    <div className="actions" style={{ justifyContent: 'flex-end' }}>
                      <button className="link" onClick={() => openEdit(operation)}>
                        Изменить
                      </button>
                      <button className="link" onClick={() => setPendingRemoval(operation)}>
                        Удалить
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {form ? (
        <Modal
          title={
            form.id
              ? 'Операция'
              : `Новая операция — ${TYPE_LABELS[form.type].toLowerCase()}`
          }
          onClose={() => setForm(null)}
        >
          <form
            className="stack"
            onSubmit={(event) => {
              event.preventDefault();
              submit();
            }}
          >
            {error && !amountError ? <div className="banner">{error}</div> : null}

            <Field label="Тип операции">
              <select
                value={form.type}
                onChange={(event) => {
                  const type = event.target.value as OperationType;
                  const selected = categories.find(
                    (category) => category.id === form.categoryId,
                  );
                  const kind = type === 'income' ? 'income' : 'expense';
                  const fits = type !== 'transfer' && selected?.kind === kind;
                  setForm({ ...form, type, categoryId: fits ? form.categoryId : '' });
                }}
              >
                {Object.entries(TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>

            <div className="row">
              <Field label="Сумма" error={amountError}>
                <input
                  value={form.amount}
                  autoFocus
                  inputMode="decimal"
                  placeholder="0,00"
                  onChange={(event) => setForm({ ...form, amount: event.target.value })}
                />
              </Field>
              <Field label="Дата">
                <input
                  type="date"
                  value={form.date}
                  onChange={(event) => setForm({ ...form, date: event.target.value })}
                />
              </Field>
            </div>

            {form.type === 'transfer' ? (
              <div className="row">
                <Field label="Счёт-источник">
                  <select
                    value={form.accountId}
                    onChange={(event) => setForm({ ...form, accountId: event.target.value })}
                  >
                    <option value="">Выберите счёт</option>
                    {accounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Счёт-получатель">
                  <select
                    value={form.targetAccountId}
                    onChange={(event) => setForm({ ...form, targetAccountId: event.target.value })}
                  >
                    <option value="">Выберите счёт</option>
                    {accounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.name}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            ) : (
              <div className="row">
                <Field label="Счёт">
                  <select
                    value={form.accountId}
                    onChange={(event) => setForm({ ...form, accountId: event.target.value })}
                  >
                    <option value="">Выберите счёт</option>
                    {accounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Категория">
                  <select
                    value={form.categoryId}
                    onChange={(event) => setForm({ ...form, categoryId: event.target.value })}
                  >
                    <option value="">Выберите категорию</option>
                    {availableCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            )}

            <Field label="Комментарий">
              <input
                value={form.comment}
                onChange={(event) => setForm({ ...form, comment: event.target.value })}
              />
            </Field>

            <div className="actions">
              <button type="submit" className="primary">
                Сохранить
              </button>
              <button type="button" onClick={() => setForm(null)}>
                Отмена
              </button>
            </div>
          </form>
        </Modal>
      ) : null}

      {pendingRemoval ? (
        <Modal title="Удалить операцию?" onClose={() => setPendingRemoval(null)}>
          <p>Операция от {formatDate(pendingRemoval.date)} будет удалена.</p>
          <div className="actions">
            <button
              className="danger"
              onClick={() => {
                removeOperation(pendingRemoval.id);
                setPendingRemoval(null);
              }}
            >
              Удалить
            </button>
            <button onClick={() => setPendingRemoval(null)}>Отмена</button>
          </div>
        </Modal>
      ) : null}
    </>
  );
}
