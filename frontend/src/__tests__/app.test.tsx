import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import App from '../App';
import { AppProvider } from '../state/AppProvider';

function renderApp(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppProvider>
        <App />
      </AppProvider>
    </MemoryRouter>,
  );
}

describe('приложение', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it('показывает основные разделы', () => {
    renderApp('/accounts');
    expect(screen.getByRole('link', { name: 'Операции' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Счета' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Категории' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Отчёт' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Настройки' })).toBeTruthy();
  });

  it('заводит счёт и показывает его остаток', () => {
    renderApp('/accounts');
    fireEvent.click(screen.getByRole('button', { name: 'Добавить счёт' }));

    fireEvent.change(screen.getByLabelText('Название'), { target: { value: 'Карта' } });
    fireEvent.change(screen.getByLabelText('Тип'), { target: { value: 'Банковская карта' } });
    fireEvent.change(screen.getByLabelText('Начальный остаток'), { target: { value: '1000' } });
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }));

    const table = screen.getByRole('table');
    expect(within(table).getByText('Карта')).toBeTruthy();
    const row = within(table).getByText('Карта').closest('tr');
    expect(row).toBeTruthy();
    // Начальный и текущий остаток совпадают
    expect(within(row as HTMLElement).getAllByText(/000,00 RUB/)).toHaveLength(2);
  });

  it('не даёт потратить больше остатка счёта', () => {
    renderApp('/accounts');
    fireEvent.click(screen.getByRole('button', { name: 'Добавить счёт' }));
    fireEvent.change(screen.getByLabelText('Название'), { target: { value: 'Наличные' } });
    fireEvent.change(screen.getByLabelText('Начальный остаток'), { target: { value: '100' } });
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }));

    fireEvent.click(screen.getByRole('link', { name: 'Операции' }));
    fireEvent.click(screen.getByRole('button', { name: 'Добавить расход' }));
    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText('Сумма'), { target: { value: '500' } });

    const accountSelect = within(dialog).getByLabelText('Счёт') as HTMLSelectElement;
    fireEvent.change(accountSelect, { target: { value: accountSelect.options[1].value } });

    const categorySelect = within(dialog).getByLabelText('Категория') as HTMLSelectElement;
    fireEvent.change(categorySelect, { target: { value: categorySelect.options[1].value } });

    fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }));

    expect(screen.getByText(/Недостаточно средств/)).toBeTruthy();
  });
});
