"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const avatarVariants = cva(
  "relative flex shrink-0 overflow-hidden rounded-full border border-line bg-surface-elevated",
  {
    variants: {
      size: {
        xs: "size-6",
        sm: "size-8",
        md: "size-9.5",
        lg: "size-12",
        xl: "size-16",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

const fallbackTextSize: Record<string, string> = {
  xs: "text-[0.625rem]",
  sm: "text-[0.6875rem]",
  md: "text-caption",
  lg: "text-small",
  xl: "text-body",
};

export interface AvatarProps
  extends React.ComponentProps<typeof AvatarPrimitive.Root>,
    VariantProps<typeof avatarVariants> {}

function Avatar({ className, size, ...props }: AvatarProps) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={size ?? "md"}
      className={cn(avatarVariants({ size }), className)}
      {...props}
    />
  );
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      className={cn("aspect-square size-full object-cover", className)}
      {...props}
    />
  );
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      className={cn(
        "flex size-full items-center justify-center bg-gradient-to-br from-electric-600/35 to-indigo-blue-600/35",
        "font-medium uppercase tracking-wide text-electric-100",
        className
      )}
      {...props}
    />
  );
}

function initialsFrom(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("");
}

/* Convenience wrapper: renders image with automatic initials fallback. */
interface UserAvatarProps extends VariantProps<typeof avatarVariants> {
  name: string;
  src?: string;
  className?: string;
}

function UserAvatar({ name, src, size = "md", className }: UserAvatarProps) {
  return (
    <Avatar size={size} className={className}>
      {src && <AvatarImage src={src} alt={name} />}
      <AvatarFallback className={fallbackTextSize[size ?? "md"]}>
        {initialsFrom(name)}
      </AvatarFallback>
    </Avatar>
  );
}

export { Avatar, AvatarImage, AvatarFallback, UserAvatar, avatarVariants };
