import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.ComponentProps<"textarea"> {
  invalid?: boolean;
}

function Textarea({ className, invalid, ...props }: TextareaProps) {
  return (
    <textarea
      data-slot="textarea"
      aria-invalid={invalid || undefined}
      className={cn(
        "min-h-24 w-full resize-y rounded-md border border-line bg-surface px-3 py-2.5",
        "text-small text-content leading-relaxed",
        "transition-colors duration-200 ease-swift outline-none",
        "placeholder:text-content-muted",
        "hover:border-line-strong",
        "focus:border-electric-500/70 focus:ring-3 focus:ring-electric-500/16",
        "disabled:cursor-not-allowed disabled:bg-canvas-subtle disabled:text-content-disabled",
        "aria-invalid:border-danger/70 aria-invalid:focus:ring-danger/16",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
