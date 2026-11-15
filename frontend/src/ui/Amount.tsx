import type { CSSProperties } from 'react';
import { formatMoney } from '../domain/money';
import { relativeWidth } from './theme';

export type AmountTone = 'income' | 'expense' | 'transfer' | 'neutral';

interface AmountProps {
  minor: number;
  currency: string;
  tone?: AmountTone;
  /** Знак перед суммой: «+», «−» или «→». Смысл операции не должен читаться только цветом. */
  prefix?: '+' | '−' | '→';
  className?: string;
  /** Показывать полное значение в подсказке при наведении. */
  showTitle?: boolean;
}

/**
 * Денежная сумма: полный формат, цифры не переносятся, табличные цифры выравнивают разряды.
 *
 * Ширина строки в долях кегля передаётся в CSS-переменную `--amount-width`: по ней карточка
 * итогов (`.stat` — контейнер для контейнерного запроса) подбирает кегль так, чтобы значение
 * поместилось целиком и не обрезалось.
 */
export function Amount({
  minor,
  currency,
  tone = 'neutral',
  prefix,
  className,
  showTitle,
}: AmountProps) {
  const text = formatMoney(minor, currency);
  const classes = ['amount', `amount--${tone}`, className].filter(Boolean).join(' ');
  const width = relativeWidth(text) + (prefix ? relativeWidth(prefix) + 0.25 : 0);
  const style = { '--amount-width': width.toFixed(3) } as CSSProperties;

  return (
    <span className={classes} style={style} title={showTitle ? text : undefined}>
      {prefix ? (
        <span className="amount__sign" aria-hidden="true">
          {prefix}
        </span>
      ) : null}
      <span className="amount__value">{text}</span>
    </span>
  );
}
