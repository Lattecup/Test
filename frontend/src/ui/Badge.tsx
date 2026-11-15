import type { ReactNode } from 'react';

export type BadgeVariant = 'income' | 'expense' | 'transfer' | 'neutral';

interface BadgeProps {
  variant: BadgeVariant;
  children: ReactNode;
  title?: string;
}

/** Плашка вида операции: цветная подпись дохода, расхода или перевода. */
export function Badge({ variant, children, title }: BadgeProps) {
  return (
    <span className={`badge badge--${variant}`} title={title}>
      {children}
    </span>
  );
}
