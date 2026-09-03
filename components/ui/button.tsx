import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "relative inline-flex shrink-0 select-none items-center justify-center gap-2 whitespace-nowrap",
    "font-medium transition-all duration-200 ease-swift",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-electric-500",
    "disabled:pointer-events-none disabled:opacity-45",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        primary: [
          "bg-electric-500 text-white shadow-raised",
          "hover:bg-electric-400 hover:shadow-[0_2px_16px_-2px_rgba(52,120,255,0.45)]",
          "active:bg-electric-600 active:shadow-subtle",
        ],
        secondary: [
          "bg-surface-elevated text-content border border-line",
          "hover:bg-surface-hover hover:border-line-strong",
          "active:bg-surface-elevated",
        ],
        outline: [
          "border border-line-strong bg-transparent text-content",
          "hover:bg-white/[0.04] hover:border-electric-500/45",
          "active:bg-white/[0.02]",
        ],
        ghost: [
          "bg-transparent text-content-secondary",
          "hover:bg-white/[0.05] hover:text-content",
          "active:bg-white/[0.03]",
        ],
        accent: [
          "bg-indigo-blue-500 text-white shadow-raised",
          "hover:bg-indigo-blue-400",
          "active:bg-indigo-blue-600",
        ],
        danger: [
          "bg-danger text-white shadow-raised",
          "hover:bg-danger-soft",
          "active:bg-danger",
        ],
        link: [
          "bg-transparent text-electric-400 underline-offset-4",
          "hover:text-electric-300 hover:underline",
        ],
      },
      size: {
        sm: "h-8 rounded-sm px-3 text-caption [&_svg]:size-3.5",
        md: "h-9.5 rounded-md px-4 text-small [&_svg]:size-4",
        lg: "h-11 rounded-lg px-5 text-body [&_svg]:size-4.5",
        icon: "size-9.5 rounded-md [&_svg]:size-4",
        "icon-sm": "size-8 rounded-sm [&_svg]:size-3.5",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

function Button({
  className,
  variant,
  size,
  fullWidth,
  asChild = false,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, fullWidth }), className)}
      disabled={disabled ?? loading}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="animate-spin" aria-hidden />
          <span className="sr-only">Loading</span>
          {children}
        </>
      ) : (
        children
      )}
    </Comp>
  );
}

export { Button, buttonVariants };
