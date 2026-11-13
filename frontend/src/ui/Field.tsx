import { cloneElement, isValidElement, useId, type ReactElement, type ReactNode } from 'react';

interface FieldProps {
  label: string;
  error?: string | null;
  children: ReactNode;
}

export function Field({ label, error, children }: FieldProps) {
  const id = useId();
  const control = isValidElement(children)
    ? cloneElement(children as ReactElement<{ id?: string }>, { id })
    : children;

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {control}
      {error ? <span className="error">{error}</span> : null}
    </div>
  );
}
