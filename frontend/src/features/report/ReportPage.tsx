import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatMoney } from '../../domain/money';
import {
  buildComparison,
  buildReport,
  currentMonthPeriod,
  formatDate,
  formatMonth,
} from '../../domain/report';
import { useApp } from '../../state/appContext';
import { EmptyState } from '../../ui/EmptyState';
import { Field } from '../../ui/Field';
import { exportReportToCsv, exportReportToExcel } from './export';

const CHART_COLORS = ['#1f6f8b', '#2e7d5b', '#b4463c', '#7a6ba8', '#c08a2e', '#4b6bb5', '#8a8f93'];

export function ReportPage() {
  const { operations, categories, accounts, settings } = useApp();
  const month = currentMonthPeriod();
  const [from, setFrom] = useState(month.from);
  const [to, setTo] = useState(month.to);

  const period = useMemo(() => ({ from, to }), [from, to]);
  const report = useMemo(
    () => buildReport(operations, period, categories, accounts),
    [operations, period, categories, accounts],
  );
  const comparison = useMemo(() => buildComparison(operations, period), [operations, period]);

  const expenseByCategory = report.byCategory
    .filter((row) => row.expense > 0)
    .map((row) => ({ name: row.name, value: row.expense / 100 }));

  const monthlyChart = report.monthly.map((row) => ({
    name: formatMonth(row.month),
    Доходы: row.income / 100,
    Расходы: row.expense / 100,
  }));

  return (
    <>
      <div className="page-header">
        <h2>Отчёт</h2>
        <div className="actions">
          <button onClick={() => exportReportToCsv(report)}>Экспорт CSV</button>
          <button className="primary" onClick={() => exportReportToExcel(report, comparison)}>
            Экспорт Excel
          </button>
        </div>
      </div>

      <div className="card">
        <div className="row">
          <Field label="Период с">
            <input type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
          </Field>
          <Field label="по">
            <input type="date" value={to} onChange={(event) => setTo(event.target.value)} />
          </Field>
          <button
            onClick={() => {
              const current = currentMonthPeriod();
              setFrom(current.from);
              setTo(current.to);
            }}
          >
            Текущий месяц
          </button>
        </div>
      </div>

      <div className="grid four" style={{ marginBottom: 18 }}>
        <div className="stat">
          <div className="label">Доходы</div>
          <div className="value amount-income">
            {formatMoney(report.totals.income, settings.currency)}
          </div>
        </div>
        <div className="stat">
          <div className="label">Расходы</div>
          <div className="value amount-expense">
            {formatMoney(report.totals.expense, settings.currency)}
          </div>
        </div>
        <div className="stat">
          <div className="label">Переводы</div>
          <div className="value amount-transfer">
            {formatMoney(report.totals.transfers, settings.currency)}
          </div>
        </div>
        <div className="stat">
          <div className="label">Итог</div>
          <div className="value">{formatMoney(report.totals.net, settings.currency)}</div>
        </div>
      </div>

      <div className="card">
        <h3>Сравнение с предыдущими периодами</h3>
        <table>
          <thead>
            <tr>
              <th>Период</th>
              <th className="num">Доходы</th>
              <th className="num">Расходы</th>
              <th className="num">Переводы</th>
              <th className="num">Итог</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                Выбранный период ({formatDate(report.period.from)} — {formatDate(report.period.to)})
              </td>
              <td className="num">{formatMoney(report.totals.income, settings.currency)}</td>
              <td className="num">{formatMoney(report.totals.expense, settings.currency)}</td>
              <td className="num">{formatMoney(report.totals.transfers, settings.currency)}</td>
              <td className="num">{formatMoney(report.totals.net, settings.currency)}</td>
            </tr>
            <tr>
              <td>
                Предыдущий месяц ({formatDate(comparison.previousMonthPeriod.from)} —{' '}
                {formatDate(comparison.previousMonthPeriod.to)})
              </td>
              <td className="num">
                {formatMoney(comparison.previousMonth.income, settings.currency)}
              </td>
              <td className="num">
                {formatMoney(comparison.previousMonth.expense, settings.currency)}
              </td>
              <td className="num">
                {formatMoney(comparison.previousMonth.transfers, settings.currency)}
              </td>
              <td className="num">{formatMoney(comparison.previousMonth.net, settings.currency)}</td>
            </tr>
            <tr>
              <td>
                Предыдущий период той же длины ({formatDate(comparison.previousSameLengthPeriod.from)}{' '}
                — {formatDate(comparison.previousSameLengthPeriod.to)})
              </td>
              <td className="num">
                {formatMoney(comparison.previousSameLength.income, settings.currency)}
              </td>
              <td className="num">
                {formatMoney(comparison.previousSameLength.expense, settings.currency)}
              </td>
              <td className="num">
                {formatMoney(comparison.previousSameLength.transfers, settings.currency)}
              </td>
              <td className="num">
                {formatMoney(comparison.previousSameLength.net, settings.currency)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="grid two">
        <div className="card">
          <h3>По категориям</h3>
          {report.byCategory.length === 0 ? (
            <EmptyState message="За выбранный период операций нет." />
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Категория</th>
                  <th className="num">Доходы</th>
                  <th className="num">Расходы</th>
                  <th className="num">Итог</th>
                </tr>
              </thead>
              <tbody>
                {report.byCategory.map((row) => (
                  <tr key={row.categoryId ?? 'none'}>
                    <td>{row.name}</td>
                    <td className="num">{formatMoney(row.income, settings.currency)}</td>
                    <td className="num">{formatMoney(row.expense, settings.currency)}</td>
                    <td className="num">{formatMoney(row.net, settings.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <h3>По счетам</h3>
          {report.byAccount.length === 0 ? (
            <EmptyState message="За выбранный период операций нет." />
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Счёт</th>
                  <th className="num">Доходы</th>
                  <th className="num">Расходы</th>
                  <th className="num">Переводы в</th>
                  <th className="num">Переводы из</th>
                  <th className="num">Итог</th>
                </tr>
              </thead>
              <tbody>
                {report.byAccount.map((row) => (
                  <tr key={row.accountId ?? 'none'}>
                    <td>{row.name}</td>
                    <td className="num">{formatMoney(row.income, settings.currency)}</td>
                    <td className="num">{formatMoney(row.expense, settings.currency)}</td>
                    <td className="num">{formatMoney(row.transfersIn, settings.currency)}</td>
                    <td className="num">{formatMoney(row.transfersOut, settings.currency)}</td>
                    <td className="num">{formatMoney(row.net, settings.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="card">
        <h3>Динамика по месяцам</h3>
        {monthlyChart.length === 0 ? (
          <EmptyState message="За выбранный период операций нет." />
        ) : (
          <table>
            <thead>
              <tr>
                <th>Месяц</th>
                <th className="num">Доходы</th>
                <th className="num">Расходы</th>
                <th className="num">Переводы</th>
                <th className="num">Итог</th>
              </tr>
            </thead>
            <tbody>
              {report.monthly.map((row) => (
                <tr key={row.month}>
                  <td>{formatMonth(row.month)}</td>
                  <td className="num">{formatMoney(row.income, settings.currency)}</td>
                  <td className="num">{formatMoney(row.expense, settings.currency)}</td>
                  <td className="num">{formatMoney(row.transfers, settings.currency)}</td>
                  <td className="num">{formatMoney(row.net, settings.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {monthlyChart.length > 0 || expenseByCategory.length > 0 ? (
        <div className="charts" style={{ marginBottom: 18 }}>
          {monthlyChart.length > 0 ? (
            <div className="card">
              <h3>Доходы и расходы по месяцам</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={monthlyChart}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Доходы" fill="#2e7d5b" />
                  <Bar dataKey="Расходы" fill="#b4463c" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : null}

          {expenseByCategory.length > 0 ? (
            <div className="card">
              <h3>Топ расходных категорий</h3>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={expenseByCategory}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={90}
                  >
                    {expenseByCategory.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
