import { useMemo, useState } from 'react';
import type { Account } from '../../domain/types';
import { calculateAccountBalance } from '../../domain/operations';
import { formatMoney, parseSignedAmountToMinor } from '../../domain/money';
import { useApp } from '../../state/appContext';
import { EmptyState } from '../../ui/EmptyState';
import { Field } from '../../ui/Field';
import { Modal } from '../../ui/Modal';

const ACCOUNT_TYPE_SUGGESTIONS = ['Наличные', 'Карта', 'Вклад', 'Кредитная карта'];

interface AccountForm {
  id: string | null;
  name: string;
  type: string;
  initialBalance: string;
}

const EMPTY_FORM: AccountForm = {
  id: null,
  name: '',
  type: '',
  initialBalance: '',
};

export function AccountsPage() {
  const { accounts, operations, settings, saveAccount, removeAccount } = useApp();
  const [form, setForm] = useState<AccountForm | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingRemoval, setPendingRemoval] = useState<Account | null>(null);

  const balances = useMemo(() => {
    const map = new Map<string, number>();
    for (const account of accounts) {
      map.set(account.id, calculateAccountBalance(account, operations));
    }
    return map;
  }, [accounts, operations]);

  const openCreate = () => {
    setError(null);
    setForm({ ...EMPTY_FORM });
  };

  const openEdit = (account: Account) => {
    setError(null);
    setForm({
      id: account.id,
      name: account.name,
      type: account.type,
      initialBalance: String(account.initialBalance / 100),
    });
  };

  const submit = () => {
    if (!form) {
      return;
    }
    const name = form.name.trim();
    if (!name) {
      setError('Укажите название счёта');
      return;
    }
    const initialBalance =
      form.initialBalance.trim() === ''
        ? 0
        : parseSignedAmountToMinor(form.initialBalance);
    if (initialBalance === null) {
      setError('Начальный остаток должен быть числом');
      return;
    }
    const now = new Date().toISOString();
    const existing = accounts.find((account) => account.id === form.id);
    saveAccount({
      id: form.id ?? crypto.randomUUID(),
      name,
      type: form.type.trim(),
      initialBalance,
      createdAt: existing?.createdAt ?? now,
    });
    setForm(null);
  };

  return (
    <>
      <div className="page-header">
        <h2>Счета</h2>
        <button className="primary" onClick={openCreate}>
          Добавить счёт
        </button>
      </div>

      <div className="card">
        {accounts.length === 0 ? (
          <EmptyState message="Счетов пока нет. Заведите первый счёт — например, «Карта»." />
        ) : (
          <table>
            <thead>
              <tr>
                <th>Название</th>
                <th>Тип</th>
                <th className="num">Начальный остаток</th>
                <th className="num">Текущий остаток</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => (
                <tr key={account.id}>
                  <td>{account.name}</td>
                  <td>{account.type || '—'}</td>
                  <td className="num">{formatMoney(account.initialBalance, settings.currency)}</td>
                  <td className="num">{formatMoney(balances.get(account.id) ?? 0, settings.currency)}</td>
                  <td className="num">
                    <div className="actions" style={{ justifyContent: 'flex-end' }}>
                      <button className="link" onClick={() => openEdit(account)}>
                        Изменить
                      </button>
                      <button className="link" onClick={() => setPendingRemoval(account)}>
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
        <Modal title={form.id ? 'Счёт' : 'Новый счёт'} onClose={() => setForm(null)}>
          <form
            className="stack"
            onSubmit={(event) => {
              event.preventDefault();
              submit();
            }}
          >
            <Field label="Название" error={error}>
              <input
                value={form.name}
                autoFocus
                onChange={(event) => setForm({ ...form, name: event.target.value })}
              />
            </Field>
            <Field label="Тип">
              <input
                value={form.type}
                list="account-types"
                placeholder="Наличные, карта, вклад"
                onChange={(event) => setForm({ ...form, type: event.target.value })}
              />
            </Field>
            <datalist id="account-types">
              {ACCOUNT_TYPE_SUGGESTIONS.map((suggestion) => (
                <option key={suggestion} value={suggestion} />
              ))}
            </datalist>
            <Field label="Начальный остаток">
              <input
                value={form.initialBalance}
                inputMode="decimal"
                placeholder="0,00"
                onChange={(event) => setForm({ ...form, initialBalance: event.target.value })}
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
        <Modal title="Удалить счёт?" onClose={() => setPendingRemoval(null)}>
          <p>
            Счёт «{pendingRemoval.name}» будет удалён. Операции останутся в истории, но потеряют привязку
            к счёту.
          </p>
          <div className="actions">
            <button
              className="danger"
              onClick={() => {
                removeAccount(pendingRemoval.id);
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
