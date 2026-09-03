import * as React from "react";
import { cn } from "@/lib/utils";

function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn(
        "text-label text-content-secondary select-none",
        "peer-disabled:text-content-disabled",
        className
      )}
      {...props}
    />
  );
}

interface FieldProps extends React.ComponentProps<"div"> {
  label?: string;
  hint?: string;
  error?: string;
  htmlFor?: string;
  required?: boolean;
}

function Field({
  className,
  label,
  hint,
  error,
  htmlFor,
  required,
  children,
  ...props
}: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)} {...props}>
      {label && (
        <Label htmlFor={htmlFor}>
          {label}
          {required && <span className="ml-0.5 text-danger">*</span>}
        </Label>
      )}
      {children}
      {error ? (
        <p className="text-caption text-danger-soft">{error}</p>
      ) : (
        hint && <p className="text-caption text-content-muted">{hint}</p>
      )}
    </div>
  );
}

export { Label, Field };
