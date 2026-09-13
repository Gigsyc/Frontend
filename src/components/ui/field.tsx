import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  optional?: boolean;
  className?: string;
  /** Render-prop so the control gets the generated id and aria wiring. */
  children: (props: { id: string; "aria-describedby"?: string; "aria-invalid"?: boolean; required?: boolean }) => ReactNode;
}

export function Field({ label, hint, error, required, optional, className, children }: FieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="flex items-baseline justify-between text-sm font-medium text-fg">
        <span>{label}{required ? <span className="text-danger-500"> *</span> : null}</span>
        {optional ? <span className="text-xs font-normal text-fg-subtle">Optional</span> : null}
      </label>
      {children({ id, "aria-describedby": [hintId, errorId].filter(Boolean).join(" ") || undefined, "aria-invalid": error ? true : undefined, required })}
      {error ? (
        <p id={errorId} role="alert" className="text-[13px] text-danger-600">{error}</p>
      ) : hint ? (
        <p id={hintId} className="text-[13px] text-fg-muted">{hint}</p>
      ) : null}
    </div>
  );
}
