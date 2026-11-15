import { formatMoney } from '../domain/money';

export type AmountTone = 'income' | 'expense' | 'transfer' | 'neutral';

interface AmountProps {
  minor: number;
  currency: string;
  tone?: AmountTone;
  /** Знак перед суммой: «+», «−» или «→». Смысл операции не должен читаться только цветом. */
  prefix?: '+' | '−' | '→';
  className?: string;
}

/**
 * Денежная сумма: полный формат, цифры не переносятся, табличные цифры выравнивают разряды.
 * Если сумма не помещается в отведённое место, кегль уменьшается — за это отвечает
 * контейнерный запрос на родителе (см. .stat в styles.css).
 */
export function Amount({ minor, currency, tone = 'neutral', prefix, className }: AmountProps) {
  const classes = ['amount', `amount--${tone}`, className].filter(Boolean).join(' ');

  return (
    <span className={classes}>
      {prefix ? (
        <span className="amount__sign" aria-hidden="true">
          {prefix}
        </span>
      ) : null}
      <span className="amount__value">{formatMoney(minor, currency)}</span>
    </span>
  );
}
