import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { AccountsPage } from './features/accounts/AccountsPage';
import { CategoriesPage } from './features/categories/CategoriesPage';
import { OperationsPage } from './features/operations/OperationsPage';
import { ReportPage } from './features/report/ReportPage';
import { SettingsPage } from './features/settings/SettingsPage';
import { useApp } from './state/appContext';

export default function App() {
  const { storageError, dismissStorageError } = useApp();

  return (
    <div className="app">
      <aside className="sidebar">
        <h1>Учёт денег</h1>
        <nav>
          <NavLink to="/operations">Операции</NavLink>
          <NavLink to="/accounts">Счета</NavLink>
          <NavLink to="/categories">Категории</NavLink>
          <NavLink to="/report">Отчёт</NavLink>
          <NavLink to="/settings">Настройки</NavLink>
        </nav>
      </aside>

      <main className="content">
        {storageError ? (
          <div className="banner">
            <span>{storageError}</span>
            <button className="link" onClick={dismissStorageError}>
              Скрыть
            </button>
          </div>
        ) : null}

        <Routes>
          <Route path="/" element={<Navigate to="/operations" replace />} />
          <Route path="/operations" element={<OperationsPage />} />
          <Route path="/accounts" element={<AccountsPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/operations" replace />} />
        </Routes>
      </main>
    </div>
  );
}
