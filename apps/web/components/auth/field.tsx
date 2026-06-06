import type { InputHTMLAttributes, ReactNode } from "react";

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: ReactNode;
};

export function Field({ label, error, hint, id, ...props }: FieldProps) {
  const fieldId = id ?? props.name;

  return (
    <label className="flex flex-col gap-2 text-sm" htmlFor={fieldId}>
      <span className="font-medium text-[#F8F6F1]">{label}</span>
      <input
        id={fieldId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        className="h-11 rounded-md border border-[#3D4550] bg-[#0F1D32] px-3 text-[#F8F6F1] outline-none ring-[#E8A03D] focus:ring-2"
        {...props}
      />
      {hint}
      {error ? (
        <span id={`${fieldId}-error`} className="text-sm text-[#E8A03D]">
          {error}
        </span>
      ) : null}
    </label>
  );
}
