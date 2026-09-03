"use client";

import * as React from "react";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { ThreeBackground } from "@/components/three-background";
import { useReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface AuthShellProps {
  title: string;
  description: string;
  footer: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

function AuthShell({
  title,
  description,
  footer,
  children,
  className,
}: AuthShellProps) {
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden">
      <div aria-hidden className="absolute inset-0 field-electric" />
      <div aria-hidden className="absolute inset-0 grid-technical mask-fade-b" />
      <ThreeBackground className="absolute inset-0" />

      <div
        ref={wrapperRef}
        className={cn(
          "relative flex flex-1 flex-col items-center justify-center px-5 py-12",
          !reduced && mounted && "auth-entrance"
        )}
      >
        <Link
          href="/"
          className="auth-el-1 rounded-md transition-transform duration-300 hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-electric-500"
        >
          <Logo className="logo-entrance" />
        </Link>

        <div
          className={cn(
            "auth-el-2 mt-8 w-full max-w-md rounded-xl border border-line bg-surface-elevated p-6 shadow-overlay surface-sheen",
            "transition-shadow duration-300 hover:shadow-[0_8px_32px_-4px_rgba(52,120,255,0.12),0_24px_48px_-12px_rgba(0,0,0,0.7)]",
            className
          )}
        >
          <div className="flex flex-col gap-1.5">
            <h1 className="auth-el-3 text-h3 text-content">{title}</h1>
            <p className="auth-el-4 text-small text-content-secondary">
              {description}
            </p>
          </div>

          <div className="mt-6">{children}</div>
        </div>

        <p className="auth-el-6 mt-6 text-small text-content-secondary">
          {footer}
        </p>
      </div>
    </main>
  );
}

export { AuthShell };
