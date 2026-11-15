import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  buildComparison,
  buildReport,
  currentMonthPeriod,
  formatDate,
  formatMonth,
} from '../../domain/report';
import { useApp } from '../../state/appContext';
import { Amount } from '../../ui/Amount';
import { Badge } from '../../ui/Badge';
import { DataTable } from '../../ui/DataTable';
import { Field } from '../../ui/Field';
import { Truncated } from '../../ui/Truncated';
import { chartColor, palette, shadows } from '../../ui/theme';
import { exportReportToCsv, exportReportToExcel } from './export';

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

  /** Подложка денежной ячейки — по смыслу движения денег, только для ненулевых значений. */
  const moneyClass = (value: number, tone: 'income' | 'expense' | 'transfer'): string =>
    value === 0 ? '' : `money-cell--${tone}`;

  const tooltipStyle = {
    background: palette.surface,
    border: `1px solid ${palette.border}`,
    borderRadius: '10px',
    boxShadow: shadows.md,
  };

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
        <div className="row filters">
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
        <div className="stat stat--income">
          <div className="label">
            <Badge variant="income">Доходы</Badge>
          </div>
          <div className="value">
            <Amount minor={report.totals.income} currency={settings.currency} tone="income" showTitle />
          </div>
        </div>
        <div className="stat stat--expense">
          <div className="label">
            <Badge variant="expense">Расходы</Badge>
          </div>
          <div className="value">
            <Amount minor={report.totals.expense} currency={settings.currency} tone="expense" showTitle />
          </div>
        </div>
        <div className="stat stat--transfer">
          <div className="label">
            <Badge variant="transfer">Переводы</Badge>
          </div>
          <div className="value">
            <Amount minor={report.totals.transfers} currency={settings.currency} tone="transfer" showTitle />
          </div>
        </div>
        <div className="stat">
          <div className="label">
            <Badge variant="neutral">Итог</Badge>
          </div>
          <div className="value">
            <Amount minor={report.totals.net} currency={settings.currency} showTitle />
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Сравнение с предыдущими периодами</h3>
        <DataTable>
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
              <td className={`num ${moneyClass(report.totals.income, 'income')}`.trim()}>
                <Amount
                  minor={report.totals.income}
                  currency={settings.currency}
                  tone="income"
                />
              </td>
              <td className={`num ${moneyClass(report.totals.expense, 'expense')}`.trim()}>
                <Amount
                  minor={report.totals.expense}
                  currency={settings.currency}
                  tone="expense"
                />
              </td>
              <td className={`num ${moneyClass(report.totals.transfers, 'transfer')}`.trim()}>
                <Amount
                  minor={report.totals.transfers}
                  currency={settings.currency}
                  tone="transfer"
                />
              </td>
              <td className="num">
                <Amount minor={report.totals.net} currency={settings.currency} showTitle />
              </td>
            </tr>
            <tr>
              <td>
                Предыдущий месяц ({formatDate(comparison.previousMonthPeriod.from)} —{' '}
                {formatDate(comparison.previousMonthPeriod.to)})
              </td>
              <td className={`num ${moneyClass(comparison.previousMonth.income, 'income')}`.trim()}>
                <Amount
                  minor={comparison.previousMonth.income}
                  currency={settings.currency}
                  tone="income"
                />
              </td>
              <td className={`num ${moneyClass(comparison.previousMonth.expense, 'expense')}`.trim()}>
                <Amount
                  minor={comparison.previousMonth.expense}
                  currency={settings.currency}
                  tone="expense"
                />
              </td>
              <td className={`num ${moneyClass(comparison.previousMonth.transfers, 'transfer')}`.trim()}>
                <Amount
                  minor={comparison.previousMonth.transfers}
                  currency={settings.currency}
                  tone="transfer"
                />
              </td>
              <td className="num">
                <Amount minor={comparison.previousMonth.net} currency={settings.currency} />
              </td>
            </tr>
            <tr>
              <td>
                Предыдущий период той же длины ({formatDate(comparison.previousSameLengthPeriod.from)}{' '}
                — {formatDate(comparison.previousSameLengthPeriod.to)})
              </td>
              <td className={`num ${moneyClass(comparison.previousSameLength.income, 'income')}`.trim()}>
                <Amount
                  minor={comparison.previousSameLength.income}
                  currency={settings.currency}
                  tone="income"
                />
              </td>
              <td className={`num ${moneyClass(comparison.previousSameLength.expense, 'expense')}`.trim()}>
                <Amount
                  minor={comparison.previousSameLength.expense}
                  currency={settings.currency}
                  tone="expense"
                />
              </td>
              <td className={`num ${moneyClass(comparison.previousSameLength.transfers, 'transfer')}`.trim()}>
                <Amount
                  minor={comparison.previousSameLength.transfers}
                  currency={settings.currency}
                  tone="transfer"
                />
              </td>
              <td className="num">
                <Amount minor={comparison.previousSameLength.net} currency={settings.currency} />
              </td>
            </tr>
          </tbody>
        </DataTable>
      </div>

      <div className="grid two">
        <div className="card">
          <h3>По категориям</h3>
          <DataTable emptyMessage="За выбранный период операций нет.">
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
                  <td>
                    <Truncated value={row.name} maxWidth={160} />
                  </td>
                  <td className={`num ${moneyClass(row.income, 'income')}`.trim()}>
                    <Amount
                      minor={row.income}
                      currency={settings.currency}
                      tone="income"
                    />
                  </td>
                  <td className={`num ${moneyClass(row.expense, 'expense')}`.trim()}>
                    <Amount
                      minor={row.expense}
                      currency={settings.currency}
                      tone="expense"
                    />
                  </td>
                  <td className="num">
                    <Amount minor={row.net} currency={settings.currency} />
                  </td>
                </tr>
              ))}
            </tbody>
            </DataTable>
        </div>

        <div className="card">
          <h3>По счетам</h3>
          <DataTable emptyMessage="За выбранный период операций нет.">
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
                  <td>
                    <Truncated value={row.name} maxWidth={140} />
                  </td>
                  <td className={`num ${moneyClass(row.income, 'income')}`.trim()}>
                    <Amount
                      minor={row.income}
                      currency={settings.currency}
                      tone="income"
                    />
                  </td>
                  <td className={`num ${moneyClass(row.expense, 'expense')}`.trim()}>
                    <Amount
                      minor={row.expense}
                      currency={settings.currency}
                      tone="expense"
                    />
                  </td>
                  <td className={`num ${moneyClass(row.transfersIn, 'transfer')}`.trim()}>
                    <Amount
                      minor={row.transfersIn}
                      currency={settings.currency}
                      tone="transfer"
                    />
                  </td>
                  <td className={`num ${moneyClass(row.transfersOut, 'transfer')}`.trim()}>
                    <Amount
                      minor={row.transfersOut}
                      currency={settings.currency}
                      tone="transfer"
                    />
                  </td>
                  <td className="num">
                    <Amount minor={row.net} currency={settings.currency} />
                  </td>
                </tr>
              ))}
            </tbody>
            </DataTable>
        </div>
      </div>

      <div className="card">
        <h3>Динамика по месяцам</h3>
        <DataTable emptyMessage="За выбранный период операций нет.">
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
                <td className={`num ${moneyClass(row.income, 'income')}`.trim()}>
                  <Amount
                    minor={row.income}
                    currency={settings.currency}
                    tone="income"
                  />
                </td>
                <td className={`num ${moneyClass(row.expense, 'expense')}`.trim()}>
                  <Amount
                    minor={row.expense}
                    currency={settings.currency}
                    tone="expense"
                  />
                </td>
                <td className={`num ${moneyClass(row.transfers, 'transfer')}`.trim()}>
                  <Amount
                    minor={row.transfers}
                    currency={settings.currency}
                    tone="transfer"
                  />
                </td>
                <td className="num">
                  <Amount minor={row.net} currency={settings.currency} />
                </td>
              </tr>
            ))}
          </tbody>
          </DataTable>
      </div>

      {monthlyChart.length > 0 || expenseByCategory.length > 0 ? (
        <div className="charts" style={{ marginBottom: 18 }}>
          {monthlyChart.length > 0 ? (
            <div className="card">
              <h3>Доходы и расходы по месяцам</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={monthlyChart}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={palette.border} />
                  <XAxis dataKey="name" fontSize={12} stroke={palette.muted} />
                  <YAxis fontSize={12} stroke={palette.muted} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="Доходы" fill={palette.income} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Расходы" fill={palette.expense} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="legend">
                <span className="legend-item">
                  <span className="legend-dot" style={{ background: palette.income }} />
                  Доходы
                </span>
                <span className="legend-item">
                  <span className="legend-dot" style={{ background: palette.expense }} />
                  Расходы
                </span>
              </div>
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
                    stroke={palette.surface}
                    strokeWidth={2}
                  >
                    {expenseByCategory.map((entry, index) => (
                      <Cell key={entry.name} fill={chartColor(index)} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="legend">
                {expenseByCategory.map((entry, index) => (
                  <span className="legend-item" key={entry.name}>
                    <span
                      className="legend-dot"
                      style={{ background: chartColor(index) }}
                    />
                    {entry.name}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
