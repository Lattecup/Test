import * as XLSX from 'xlsx';
import { minorToDecimalString } from '../../domain/money';
import { formatDate, formatMonth, type Comparison, type Report } from '../../domain/report';

function download(content: BlobPart, fileName: string, type: string): void {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

function fileBaseName(report: Report): string {
  return `otchet_${report.period.from}_${report.period.to}`;
}

export function exportReportToCsv(report: Report): void {
  const lines: string[] = [];
  lines.push(`Отчёт за период;${report.period.from} - ${report.period.to}`);
  lines.push('');
  lines.push('Итоги;Сумма');
  lines.push(`Доходы;${minorToDecimalString(report.totals.income)}`);
  lines.push(`Расходы;${minorToDecimalString(report.totals.expense)}`);
  lines.push(`Переводы;${minorToDecimalString(report.totals.transfers)}`);
  lines.push(`Итог;${minorToDecimalString(report.totals.net)}`);
  lines.push('');
  lines.push('По категориям;Доходы;Расходы;Итог');
  for (const row of report.byCategory) {
    lines.push(
      [
        row.name,
        minorToDecimalString(row.income),
        minorToDecimalString(row.expense),
        minorToDecimalString(row.net),
      ].join(';'),
    );
  }
  lines.push('');
  lines.push('По счетам;Доходы;Расходы;Переводы в;Переводы из;Итог');
  for (const row of report.byAccount) {
    lines.push(
      [
        row.name,
        minorToDecimalString(row.income),
        minorToDecimalString(row.expense),
        minorToDecimalString(row.transfersIn),
        minorToDecimalString(row.transfersOut),
        minorToDecimalString(row.net),
      ].join(';'),
    );
  }
  lines.push('');
  lines.push('По месяцам;Доходы;Расходы;Переводы;Итог');
  for (const row of report.monthly) {
    lines.push(
      [
        formatMonth(row.month),
        minorToDecimalString(row.income),
        minorToDecimalString(row.expense),
        minorToDecimalString(row.transfers),
        minorToDecimalString(row.net),
      ].join(';'),
    );
  }

  const content = `\uFEFF${lines.join('\r\n')}`;
  download(content, `${fileBaseName(report)}.csv`, 'text/csv;charset=utf-8');
}

export function exportReportToExcel(report: Report, comparison: Comparison): void {
  const workbook = XLSX.utils.book_new();

  const summary = XLSX.utils.aoa_to_sheet([
    ['Отчёт за период', `${formatDate(report.period.from)} — ${formatDate(report.period.to)}`],
    [],
    ['Показатель', 'Сумма'],
    ['Доходы', minorToDecimalString(report.totals.income)],
    ['Расходы', minorToDecimalString(report.totals.expense)],
    ['Переводы', minorToDecimalString(report.totals.transfers)],
    ['Итог', minorToDecimalString(report.totals.net)],
    [],
    ['Сравнение', 'Доходы', 'Расходы', 'Переводы', 'Итог'],
    [
      `Предыдущий месяц (${formatDate(comparison.previousMonthPeriod.from)} — ${formatDate(comparison.previousMonthPeriod.to)})`,
      minorToDecimalString(comparison.previousMonth.income),
      minorToDecimalString(comparison.previousMonth.expense),
      minorToDecimalString(comparison.previousMonth.transfers),
      minorToDecimalString(comparison.previousMonth.net),
    ],
    [
      `Предыдущий период той же длины (${formatDate(comparison.previousSameLengthPeriod.from)} — ${formatDate(comparison.previousSameLengthPeriod.to)})`,
      minorToDecimalString(comparison.previousSameLength.income),
      minorToDecimalString(comparison.previousSameLength.expense),
      minorToDecimalString(comparison.previousSameLength.transfers),
      minorToDecimalString(comparison.previousSameLength.net),
    ],
  ]);
  XLSX.utils.book_append_sheet(workbook, summary, 'Итоги');

  const categories = XLSX.utils.aoa_to_sheet([
    ['Категория', 'Доходы', 'Расходы', 'Итог'],
    ...report.byCategory.map((row) => [
      row.name,
      minorToDecimalString(row.income),
      minorToDecimalString(row.expense),
      minorToDecimalString(row.net),
    ]),
  ]);
  XLSX.utils.book_append_sheet(workbook, categories, 'По категориям');

  const accounts = XLSX.utils.aoa_to_sheet([
    ['Счёт', 'Доходы', 'Расходы', 'Переводы в', 'Переводы из', 'Итог'],
    ...report.byAccount.map((row) => [
      row.name,
      minorToDecimalString(row.income),
      minorToDecimalString(row.expense),
      minorToDecimalString(row.transfersIn),
      minorToDecimalString(row.transfersOut),
      minorToDecimalString(row.net),
    ]),
  ]);
  XLSX.utils.book_append_sheet(workbook, accounts, 'По счетам');

  const monthly = XLSX.utils.aoa_to_sheet([
    ['Месяц', 'Доходы', 'Расходы', 'Переводы', 'Итог'],
    ...report.monthly.map((row) => [
      formatMonth(row.month),
      minorToDecimalString(row.income),
      minorToDecimalString(row.expense),
      minorToDecimalString(row.transfers),
      minorToDecimalString(row.net),
    ]),
  ]);
  XLSX.utils.book_append_sheet(workbook, monthly, 'По месяцам');

  XLSX.writeFile(workbook, `${fileBaseName(report)}.xlsx`);
}
