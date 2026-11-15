import { useApp } from '../state/appContext';

/** Кнопка переключения темы оформления: применяет тему сразу и сохраняет выбор. */
export function ThemeToggle() {
  const { settings, toggleTheme } = useApp();
  const dark = settings.theme === 'dark';
  const label = dark ? 'Включить светлую тему' : 'Включить тёмную тему';

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-pressed={dark}
      aria-label={label}
      title={label}
    >
      {dark ? '☀' : '☾'}
    </button>
  );
}
