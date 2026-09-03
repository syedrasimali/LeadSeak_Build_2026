"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { Badge } from "@/components/ui/badge";
import { primaryNav, secondaryNav, type NavItem } from "@/lib/navigation";
import { registerGSAP, useReducedMotion, motionTiming } from "@/lib/motion";
import { DISCOVERY_LEAD_LIMIT } from "@/lib/discovery-constants";
import gsap from "gsap";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({
  item,
  active,
  onNavigate,
  style: inlineStyle,
}: {
  item: NavItem;
  active: boolean;
  onNavigate?: () => void;
  style?: React.CSSProperties;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      style={inlineStyle}
      className={cn(
        "group relative flex items-center gap-3 rounded-md px-3 py-2 text-small font-medium",
        "transition-all duration-200 ease-swift",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-electric-500",
        "hover:translate-x-0.5",
        active
          ? "bg-electric-500/12 text-content"
          : "text-content-secondary hover:bg-white/[0.045] hover:text-content"
      )}
    >
      {/* Active rail — a lit edge rather than a filled block. */}
      <span
        aria-hidden
        className={cn(
          "absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-r-full bg-electric-400 transition-all duration-300",
          active ? "opacity-100 h-5" : "opacity-0"
        )}
      />
      <Icon
        className={cn(
          "size-4 shrink-0 transition-all duration-200",
          active
            ? "text-electric-400 scale-110"
            : "text-content-muted group-hover:text-content-secondary group-hover:scale-105"
        )}
      />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

function Sidebar({ leadCount, onNavigate }: { leadCount: number; onNavigate?: () => void }) {
  const pathname = usePathname();
  const navRef = React.useRef<HTMLElement>(null);
  const secondaryRef = React.useRef<HTMLElement>(null);
  const planRef = React.useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [hasAnimated, setHasAnimated] = React.useState(false);

  React.useEffect(() => {
    if (reduced || hasAnimated) return;
    registerGSAP();

    const tl = gsap.timeline({
      onComplete: () => setHasAnimated(true),
    });

    if (navRef.current) {
      const items = navRef.current.querySelectorAll("a");
      if (items.length) {
        tl.fromTo(
          items,
          { opacity: 0, x: -16 },
          {
            opacity: 1,
            x: 0,
            duration: 0.4,
            stagger: 0.06,
            ease: "power3.out",
          },
          0.2
        );
      }
    }

    if (planRef.current) {
      tl.fromTo(
        planRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
        0.4
      );
    }

    if (secondaryRef.current) {
      const items = secondaryRef.current.querySelectorAll("a");
      if (items.length) {
        tl.fromTo(
          items,
          { opacity: 0, x: -12 },
          {
            opacity: 1,
            x: 0,
            duration: 0.35,
            stagger: 0.05,
            ease: "power2.out",
          },
          0.5
        );
      }
    }

    return () => {
      tl.kill();
    };
  }, [reduced, hasAnimated]);

  const hideStyle = reduced ? undefined : { opacity: 0 };

  return (
    <div className="flex h-full flex-col bg-canvas/80 backdrop-blur-xl">
      <div className="flex h-15 shrink-0 items-center gap-2 border-b border-line px-5">
        <Link
          href="/"
          onClick={onNavigate}
          aria-label="LeadSeak home"
          className="rounded-md transition-transform duration-300 hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-electric-500"
        >
          <Logo className="logo-entrance" />
        </Link>
      </div>

      <nav
        ref={navRef}
        aria-label="Primary"
        className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4"
      >
        <p className="px-3 pb-2 text-overline uppercase text-content-muted">
          Workspace
        </p>
        {primaryNav.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            active={isActive(pathname, item.href)}
            onNavigate={onNavigate}
            style={hideStyle}
          />
        ))}
      </nav>

      <div className="shrink-0 px-3 pb-3">
        <div
          ref={planRef}
          className="mb-3 rounded-lg border border-line bg-surface p-3.5 transition-all duration-300 hover:border-electric-500/20 hover:shadow-[0_0_16px_-4px_rgba(52,120,255,0.12)]"
          style={hideStyle}
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-caption font-medium text-content">Free plan</p>
            <Badge variant="electric" size="sm">
              {leadCount}/{DISCOVERY_LEAD_LIMIT}
            </Badge>
          </div>
          <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-electric-500 to-indigo-blue-500 transition-all duration-500"
              style={{
                width: `${Math.min(Math.round((leadCount / DISCOVERY_LEAD_LIMIT) * 100), 100)}%`,
              }}
            />
          </div>
          <p className="mt-2 text-caption text-content-muted">
            {leadCount} of {DISCOVERY_LEAD_LIMIT} leads used (24h window)
          </p>
        </div>

        {/* Divider between workspace and account navigation */}
        <div aria-hidden className="mx-1 h-px bg-line" />

        <nav
          ref={secondaryRef}
          aria-label="Account"
          className="flex flex-col gap-1 pt-3"
        >
          {secondaryNav.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              active={isActive(pathname, item.href)}
              onNavigate={onNavigate}
              style={hideStyle}
            />
          ))}
        </nav>
      </div>
    </div>
  );
}

export { Sidebar };
