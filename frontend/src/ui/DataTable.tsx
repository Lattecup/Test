import { Children, isValidElement, type ReactNode } from 'react';
import { EmptyState } from './EmptyState';

interface DataTableProps {
  children: ReactNode;
  /** Сообщение, если в таблице нет ни одной строки. */
  emptyMessage?: string;
}

/** Число строк в теле таблицы — чтобы отличить пустую таблицу от непустой. */
function countRows(node: ReactNode): number {
  let count = 0;

  Children.forEach(node, (child) => {
    if (!isValidElement(child)) {
      return;
    }
    const children = (child.props as { children?: ReactNode }).children;
    if (child.type === 'tbody') {
      count += Children.toArray(children).filter((row) => isValidElement(row)).length;
    } else {
      count += countRows(children);
    }
  });

  return count;
}

/**
 * Таблица с прокруткой по горизонтали внутри блока.
 *
 * Числовые ячейки не переносятся, поэтому таблица может оказаться шире карточки — в этом случае
 * прокручивается содержимое карточки, а сама карточка и её границы остаются на месте.
 *
 * Пустое состояние таблицы тоже обрабатывается здесь: вместо пустой таблицы показывается
 * сообщение (`emptyMessage`), чтобы экраны не повторяли одну и ту же проверку.
 */
export function DataTable({ children, emptyMessage }: DataTableProps) {
  const isEmpty = emptyMessage !== undefined && countRows(children) === 0;

  return (
    <div className="table-scroll">
      {isEmpty ? <EmptyState message={emptyMessage} /> : <table>{children}</table>}
    </div>
  );
}
