import { useState } from 'react';
import type { Category, CategoryKind } from '../../domain/types';
import { useApp } from '../../state/appContext';
import { EmptyState } from '../../ui/EmptyState';
import { Field } from '../../ui/Field';
import { Modal } from '../../ui/Modal';

interface CategoryForm {
  id: string | null;
  name: string;
  kind: CategoryKind;
}

const KIND_LABELS: Record<CategoryKind, string> = {
  income: 'Доходы',
  expense: 'Расходы',
};

export function CategoriesPage() {
  const { categories, saveCategory, removeCategory } = useApp();
  const [form, setForm] = useState<CategoryForm | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingRemoval, setPendingRemoval] = useState<Category | null>(null);

  const openCreate = (kind: CategoryKind) => {
    setError(null);
    setForm({ id: null, name: '', kind });
  };

  const openEdit = (category: Category) => {
    setError(null);
    setForm({ id: category.id, name: category.name, kind: category.kind });
  };

  const submit = () => {
    if (!form) {
      return;
    }
    const name = form.name.trim();
    if (!name) {
      setError('Укажите название категории');
      return;
    }
    const existing = categories.find((category) => category.id === form.id);
    saveCategory({
      id: form.id ?? crypto.randomUUID(),
      name,
      kind: form.kind,
      isSeed: existing?.isSeed ?? false,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    });
    setForm(null);
  };

  const renderTable = (kind: CategoryKind) => {
    const rows = categories.filter((category) => category.kind === kind);
    if (rows.length === 0) {
      return <EmptyState message="Категорий пока нет." />;
    }
    return (
      <table>
        <thead>
          <tr>
            <th>Название</th>
            <th>Происхождение</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.map((category) => (
            <tr key={category.id}>
              <td>{category.name}</td>
              <td>
                <span className="tag">{category.isSeed ? 'Стартовый набор' : 'Своя'}</span>
              </td>
              <td className="num">
                <div className="actions" style={{ justifyContent: 'flex-end' }}>
                  <button className="link" onClick={() => openEdit(category)}>
                    Переименовать
                  </button>
                  <button className="link" onClick={() => setPendingRemoval(category)}>
                    Удалить
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <>
      <div className="page-header">
        <h2>Категории</h2>
      </div>

      <div className="card">
        <div className="page-header">
          <h3>Доходы</h3>
          <button onClick={() => openCreate('income')}>Добавить категорию</button>
        </div>
        {renderTable('income')}
      </div>

      <div className="card">
        <div className="page-header">
          <h3>Расходы</h3>
          <button onClick={() => openCreate('expense')}>Добавить категорию</button>
        </div>
        {renderTable('expense')}
      </div>

      {form ? (
        <Modal title={form.id ? 'Категория' : 'Новая категория'} onClose={() => setForm(null)}>
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
              <select
                value={form.kind}
                disabled={Boolean(form.id)}
                onChange={(event) =>
                  setForm({ ...form, kind: event.target.value as CategoryKind })
                }
              >
                {Object.entries(KIND_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
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
        <Modal title="Удалить категорию?" onClose={() => setPendingRemoval(null)}>
          <p>
            Категория «{pendingRemoval.name}» будет удалена. Операции останутся в истории, но потеряют
            привязку к категории и будут показаны как «Без категории».
          </p>
          <div className="actions">
            <button
              className="danger"
              onClick={() => {
                removeCategory(pendingRemoval.id);
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
