import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextFieldProps extends React.ComponentPropsWithoutRef<"input"> {
  label: string;
  error?: string;
  hint?: string;
}

/** Labelled input with an inline error message; wires aria-invalid / aria-describedby. */
export function TextField({ label, error, hint, id, className, ...props }: TextFieldProps) {
  const autoId = React.useId();
  const inputId = id ?? autoId;
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn("input", error && "border-danger", className)}
        {...props}
      />
      {error ? (
        <p id={`${inputId}-error`} role="alert" className="text-xs text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="text-xs text-foreground-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
