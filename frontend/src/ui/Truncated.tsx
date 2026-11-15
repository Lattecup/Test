interface TruncatedProps {
  value: string;
  /** Предельная ширина текста, после которой он обрезается. */
  maxWidth?: number;
}

/**
 * Длинное название счёта или категории: обрезается, чтобы не растягивать таблицу,
 * полное значение остаётся в подсказке при наведении.
 */
export function Truncated({ value, maxWidth }: TruncatedProps) {
  return (
    <span className="truncate" style={maxWidth ? { maxWidth: `${maxWidth}px` } : undefined} title={value}>
      {value}
    </span>
  );
}
