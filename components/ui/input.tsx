import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.ComponentProps<"input"> {
  invalid?: boolean;
  leadingIcon?: React.ReactNode;
  trailingSlot?: React.ReactNode;
}

function Input({
  className,
  invalid,
  leadingIcon,
  trailingSlot,
  ...props
}: InputProps) {
  const field = (
    <input
      data-slot="input"
      aria-invalid={invalid || undefined}
      className={cn(
        "h-9.5 w-full min-w-0 rounded-md border border-line bg-surface px-3 text-small text-content",
        "transition-colors duration-200 ease-swift outline-none",
        "placeholder:text-content-muted",
        "hover:border-line-strong",
        "focus:border-electric-500/70 focus:ring-3 focus:ring-electric-500/16",
        "disabled:cursor-not-allowed disabled:bg-canvas-subtle disabled:text-content-disabled",
        "file:mr-3 file:border-0 file:bg-transparent file:text-small file:font-medium file:text-content",
        "aria-invalid:border-danger/70 aria-invalid:focus:ring-danger/16",
        leadingIcon && "pl-9",
        trailingSlot && "pr-9",
        className
      )}
      {...props}
    />
  );

  if (!leadingIcon && !trailingSlot) return field;

  return (
    <div className="relative w-full">
      {leadingIcon && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-content-muted [&_svg]:size-4">
          {leadingIcon}
        </span>
      )}
      {field}
      {trailingSlot && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-content-muted [&_svg]:size-4">
          {trailingSlot}
        </span>
      )}
    </div>
  );
}

export { Input };
