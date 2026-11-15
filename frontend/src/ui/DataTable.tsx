import type { ReactNode } from 'react';

interface DataTableProps {
  children: ReactNode;
}

/**
 * Таблица с прокруткой по горизонтали внутри блока.
 *
 * Числовые ячейки не переносятся, поэтому таблица может оказаться шире карточки — в этом случае
 * прокручивается содержимое карточки, а сама карточка и её границы остаются на месте.
 */
export function DataTable({ children }: DataTableProps) {
  return (
    <div className="table-scroll">
      <table>{children}</table>
    </div>
  );
}
