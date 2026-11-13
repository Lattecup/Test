import { useState } from 'react';
import { useApp } from '../../state/appContext';
import { Field } from '../../ui/Field';

export function SettingsPage() {
  const { settings, saveSettings } = useApp();
  const [currency, setCurrency] = useState(settings.currency);
  const [saved, setSaved] = useState(false);

  return (
    <>
      <div className="page-header">
        <h2>Настройки</h2>
      </div>

      <div className="card" style={{ maxWidth: 420 }}>
        <form
          className="stack"
          onSubmit={(event) => {
            event.preventDefault();
            saveSettings({ ...settings, currency: currency.trim() || 'RUB' });
            setSaved(true);
          }}
        >
          <Field label="Валюта">
            <input
              value={currency}
              autoFocus
              placeholder="RUB"
              onChange={(event) => {
                setCurrency(event.target.value);
                setSaved(false);
              }}
            />
          </Field>
          <div className="actions">
            <button type="submit" className="primary">
              Сохранить
            </button>
            {saved ? <span className="tag">Сохранено</span> : null}
          </div>
        </form>
      </div>

      <div className="card" style={{ maxWidth: 620 }}>
        <h3>Где хранятся данные</h3>
        <p>
          Данные хранятся в этом браузере и не отправляются на сервер. Очистка данных сайта в
          браузере удалит всю историю операций. Чтобы сохранить отчёт, выгрузите его в CSV или Excel.
        </p>
      </div>
    </>
  );
}
