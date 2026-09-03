"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

const Select = SelectPrimitive.Root;
const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;

function SelectTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(
        "flex h-9.5 w-full items-center justify-between gap-2 rounded-md border border-line bg-surface px-3",
        "text-small text-content outline-none transition-colors duration-200 ease-swift",
        "data-[placeholder]:text-content-muted",
        "hover:border-line-strong",
        "focus:border-electric-500/70 focus:ring-3 focus:ring-electric-500/16",
        "disabled:cursor-not-allowed disabled:bg-canvas-subtle disabled:text-content-disabled",
        "aria-invalid:border-danger/70",
        "[&>span]:truncate",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown className="size-4 shrink-0 text-content-muted transition-transform duration-200" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

function SelectContent({
  className,
  children,
  position = "popper",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        position={position}
        className={cn(
          "relative z-50 max-h-72 min-w-[8rem] overflow-hidden rounded-lg border border-line",
          "bg-surface-elevated shadow-overlay surface-sheen",
          "data-[state=open]:animate-fade-in",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1.5 data-[side=top]:-translate-y-1.5",
          className
        )}
        {...props}
      >
        <SelectPrimitive.ScrollUpButton className="flex h-6 items-center justify-center text-content-muted">
          <ChevronUp className="size-3.5" />
        </SelectPrimitive.ScrollUpButton>
        <SelectPrimitive.Viewport
          className={cn(
            "p-1.5",
            position === "popper" &&
              "h-(--radix-select-trigger-height) w-full min-w-(--radix-select-trigger-width)"
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectPrimitive.ScrollDownButton className="flex h-6 items-center justify-center text-content-muted">
          <ChevronDown className="size-3.5" />
        </SelectPrimitive.ScrollDownButton>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      className={cn(
        "px-2 py-1.5 text-overline uppercase text-content-muted",
        className
      )}
      {...props}
    />
  );
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "relative flex w-full cursor-default select-none items-center gap-2 rounded-sm py-1.5 pl-2 pr-8",
        "text-small text-content-secondary outline-none transition-colors duration-150",
        "focus:bg-white/[0.06] focus:text-content",
        "data-[state=checked]:text-content",
        "data-[disabled]:pointer-events-none data-[disabled]:text-content-disabled",
        className
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <span className="absolute right-2 flex size-4 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check className="size-3.5 text-electric-400" />
        </SelectPrimitive.ItemIndicator>
      </span>
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      className={cn("-mx-1.5 my-1.5 h-px bg-line", className)}
      {...props}
    />
  );
}

export interface SelectOption {
  value: string;
  label: string;
}

/* Radix resolves the trigger label from its mounted items, which do not exist
   during server rendering — leaving the trigger visibly blank until hydration.
   Rendering the label ourselves as SelectValue children fixes that. Supports
   both controlled (value prop) and uncontrolled (defaultValue prop) usage. */
function LabeledSelect({
  options,
  value,
  defaultValue,
  name,
  id,
  "aria-label": ariaLabel,
  className,
  onValueChange,
}: {
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  name?: string;
  id?: string;
  "aria-label"?: string;
  className?: string;
  onValueChange?: (value: string) => void;
}) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = React.useState(
    defaultValue ?? options[0]?.value ?? ""
  );
  const currentValue = isControlled ? value : internal;
  const current = options.find((option) => option.value === currentValue);

  return (
    <>
      <Select
        value={currentValue}
        onValueChange={(next) => {
          if (!isControlled) setInternal(next);
          onValueChange?.(next);
        }}
      >
        <SelectTrigger id={id} aria-label={ariaLabel} className={className}>
          <SelectValue>{current?.label}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {name && (
        <input type="hidden" name={name} value={currentValue} />
      )}
    </>
  );
}

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  LabeledSelect,
};
