import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border font-medium transition-colors duration-200 [&_svg]:size-3",
  {
    variants: {
      variant: {
        neutral: "border-line bg-white/[0.04] text-content-secondary",
        electric:
          "border-electric-500/28 bg-electric-500/12 text-electric-300",
        indigo:
          "border-indigo-blue-500/28 bg-indigo-blue-500/12 text-indigo-blue-300",
        success: "border-success/28 bg-success/12 text-success-soft",
        warning: "border-warning/28 bg-warning/12 text-warning-soft",
        danger: "border-danger/28 bg-danger/12 text-danger-soft",
        outline: "border-line-strong bg-transparent text-content-secondary",
      },
      size: {
        sm: "h-5 px-2 text-[0.6875rem]",
        md: "h-6 px-2.5 text-caption",
      },
    },
    defaultVariants: {
      variant: "neutral",
      size: "md",
    },
  }
);

export interface BadgeProps
  extends React.ComponentProps<"span">,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

function Badge({ className, variant, size, dot, children, ...props }: BadgeProps) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    >
      {dot && (
        <span className="size-1.5 rounded-full bg-current" aria-hidden />
      )}
      {children}
    </span>
  );
}

export { Badge, badgeVariants };
