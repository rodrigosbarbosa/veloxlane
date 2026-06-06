import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: ReactNode;
};

export const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
  { label, error, hint, id, ...props },
  ref,
) {
  const fieldId = id ?? props.name;

  return (
    <label className="flex flex-col gap-2 text-sm" htmlFor={fieldId}>
      <span className="auth-field-label">{label}</span>
      <input
        ref={ref}
        id={fieldId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        className="auth-field-input"
        {...props}
      />
      {hint}
      {error ? (
        <span id={`${fieldId}-error`} className="auth-field-error" role="alert">
          {error}
        </span>
      ) : null}
    </label>
  );
});
