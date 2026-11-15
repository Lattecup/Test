import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AppProvider } from './state/AppProvider';
import { readStoredTheme } from './data/localStorageRepository';
import { applyTheme } from './ui/theme';
import './styles.css';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Не найден корневой элемент #root');
}

// Тема из сохранённых настроек применяется до рендера — иначе тёмный интерфейс мигает светлым
applyTheme(document.documentElement, readStoredTheme());

createRoot(container).render(
  <StrictMode>
    <BrowserRouter>
      <AppProvider>
        <App />
      </AppProvider>
    </BrowserRouter>
  </StrictMode>,
);
