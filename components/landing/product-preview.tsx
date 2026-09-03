"use client";

import * as React from "react";
import {
  BarChart3,
  Flame,
  LayoutDashboard,
  Search,
  Snowflake,
  Sun,
  Target,
  Users,
} from "lucide-react";
import {
  registerGSAP,
  useReducedMotion,
  animateCounter,
  motionTiming,
} from "@/lib/motion";
import gsap from "gsap";

const DEMO_NAV = [
  { label: "Overview", icon: LayoutDashboard, active: true },
  { label: "Campaigns", icon: Target, active: false },
  { label: "Leads", icon: Users, active: false },
  { label: "Analytics", icon: BarChart3, active: false },
];

const DEMO_STATS = [
  { label: "Discovered", value: 2481, display: "2,481" },
  { label: "Qualified", value: 614, display: "614" },
  { label: "Hot", value: 87, display: "87" },
];

const DEMO_LEADS = [
  { initials: "NO", name: "Nadia O.", company: "Vertex Labs", score: 92, temp: "hot" },
  { initials: "TA", name: "Tom A.", company: "Northwind", score: 88, temp: "hot" },
  { initials: "PR", name: "Priya R.", company: "Cobalt Freight", score: 71, temp: "warm" },
  { initials: "EL", name: "Erik L.", company: "Halden Systems", score: 64, temp: "warm" },
  { initials: "MT", name: "Mei T.", company: "Orbit Retail", score: 41, temp: "cold" },
];

const TEMP_STYLES = {
  hot: { icon: Flame, className: "border-danger/28 bg-danger/12 text-danger-soft" },
  warm: { icon: Sun, className: "border-warning/28 bg-warning/12 text-warning-soft" },
  cold: {
    icon: Snowflake,
    className: "border-electric-500/28 bg-electric-500/12 text-electric-300",
  },
} as const;

const DEMO_BARS = [34, 48, 41, 62, 55, 74, 68, 85, 78, 92, 84, 100];

function ProductPreview() {
  const containerRef = React.useRef<HTMLElement>(null);
  const statsRef = React.useRef<(HTMLParagraphElement | null)[]>([]);
  const barsRef = React.useRef<HTMLDivElement[]>([]);
  const leadsRef = React.useRef<HTMLDivElement[]>([]);
  const reduced = useReducedMotion();
  const [hasAnimated, setHasAnimated] = React.useState(false);

  React.useEffect(() => {
    if (reduced || hasAnimated || !containerRef.current) return;

    registerGSAP();
    const container = containerRef.current;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: "top 80%",
        end: "top 40%",
        toggleActions: "play none none none",
      },
    });

    tl.fromTo(
      container,
      { opacity: 0, y: 80, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: motionTiming.cinematic, ease: "power4.out" }
    );

    tl.fromTo(
      statsRef.current.filter(Boolean),
      { opacity: 0, y: 30, scale: 0.8 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: motionTiming.normal,
        stagger: 0.12,
        ease: "back.out(1.7)",
      },
      "-=0.4"
    );

    tl.fromTo(
      barsRef.current.filter(Boolean),
      { scaleY: 0, transformOrigin: "bottom" },
      {
        scaleY: 1,
        duration: motionTiming.slow,
        stagger: 0.04,
        ease: "power3.out",
      },
      "-=0.3"
    );

    tl.fromTo(
      leadsRef.current.filter(Boolean),
      { opacity: 0, x: 40 },
      {
        opacity: 1,
        x: 0,
        duration: motionTiming.normal,
        stagger: 0.1,
        ease: "power3.out",
      },
      "-=0.5"
    );

    setHasAnimated(true);

    return () => {
      tl.kill();
    };
  }, [reduced, hasAnimated]);

  React.useEffect(() => {
    if (reduced || hasAnimated) return;

    statsRef.current.forEach((el, i) => {
      if (!el) return;
      const target = DEMO_STATS[i]?.value ?? 0;
      setTimeout(() => {
        animateCounter(el, target, {
          duration: motionTiming.cinematic,
          format: (v) => v.toLocaleString(),
        });
      }, 600 + i * 150);
    });
  }, [reduced, hasAnimated]);

  return (
    <figure ref={containerRef} className="m-0">
      <div className="relative overflow-hidden rounded-2xl border border-line bg-surface shadow-overlay">
        <div aria-hidden className="pointer-events-none absolute inset-0 surface-sheen" />

        {/* Window chrome */}
        <div className="relative flex h-10 items-center gap-2 border-b border-line bg-canvas-subtle px-4">
          <span className="flex gap-1.5" aria-hidden>
            <span className="size-2.5 rounded-full bg-white/12" />
            <span className="size-2.5 rounded-full bg-white/12" />
            <span className="size-2.5 rounded-full bg-white/12" />
          </span>
          <span className="mx-auto hidden items-center gap-2 rounded-md border border-line bg-surface px-3 py-1 font-mono text-[0.625rem] text-content-muted sm:flex">
            app.leadseak.com/dashboard
          </span>
        </div>

        <div className="relative flex">
          {/* Sidebar */}
          <div className="hidden w-44 shrink-0 flex-col gap-1 border-r border-line bg-canvas-subtle p-3 md:flex">
            <p className="px-2 pb-2 text-overline uppercase text-content-muted">
              Workspace
            </p>
            {DEMO_NAV.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className={
                    item.active
                      ? "flex items-center gap-2.5 rounded-md bg-electric-500/12 px-2.5 py-1.5 text-caption font-medium text-content"
                      : "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-caption text-content-muted"
                  }
                >
                  <Icon
                    className={
                      item.active
                        ? "size-3.5 text-electric-400"
                        : "size-3.5 text-content-disabled"
                    }
                  />
                  {item.label}
                </div>
              );
            })}
          </div>

          {/* Main panel */}
          <div className="min-w-0 flex-1 p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-7 flex-1 items-center gap-2 rounded-md border border-line bg-canvas-subtle px-2.5">
                <Search className="size-3 shrink-0 text-content-disabled" />
                <span className="truncate text-[0.6875rem] text-content-disabled">
                  B2B SaaS · 20–80 staff · EU
                </span>
              </div>
              <span className="hidden shrink-0 rounded-full border border-success/28 bg-success/12 px-2 py-0.5 text-[0.625rem] font-medium text-success-soft sm:inline">
                Live
              </span>
            </div>

            {/* Stats */}
            <div className="mt-4 grid grid-cols-3 gap-2.5">
              {DEMO_STATS.map((stat, i) => (
                <div
                  key={stat.label}
                  className="rounded-lg border border-line bg-surface-elevated p-2.5"
                >
                  <p className="text-[0.625rem] text-content-muted">{stat.label}</p>
                  <p
                    ref={(el) => { statsRef.current[i] = el; }}
                    className="mt-0.5 font-mono text-body text-content sm:text-h3"
                  >
                    {reduced ? stat.display : "0"}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-3 grid gap-3 lg:grid-cols-5">
              {/* Chart */}
              <div className="rounded-lg border border-line bg-surface-elevated p-3 lg:col-span-3">
                <p className="text-[0.6875rem] font-medium text-content-secondary">
                  Discovery volume
                </p>
                <div className="mt-3 flex h-24 items-end gap-1" aria-hidden>
                  {DEMO_BARS.map((height, i) => (
                    <div
                      key={i}
                      ref={(el) => { if (el) barsRef.current[i] = el; }}
                      style={{
                        height: reduced ? `${height}%` : undefined,
                        transform: reduced ? undefined : `scaleY(${height / 100})`,
                        transformOrigin: "bottom",
                      }}
                      className="flex-1 rounded-t-sm bg-gradient-to-t from-electric-700/45 to-electric-400"
                    />
                  ))}
                </div>
              </div>

              {/* Lead list */}
              <div className="rounded-lg border border-line bg-surface-elevated p-3 lg:col-span-2">
                <p className="text-[0.6875rem] font-medium text-content-secondary">
                  Recent leads
                </p>
                <div className="mt-2.5 flex flex-col gap-1.5">
                  {DEMO_LEADS.map((lead, i) => {
                    const temp = TEMP_STYLES[lead.temp as keyof typeof TEMP_STYLES];
                    const TempIcon = temp.icon;
                    return (
                      <div
                        key={lead.name}
                        ref={(el) => { if (el) leadsRef.current[i] = el; }}
                        className="flex items-center gap-2"
                      >
                        <span className="grid size-5 shrink-0 place-items-center rounded-full bg-gradient-to-br from-electric-600/35 to-indigo-blue-600/35 text-[0.5rem] font-medium text-electric-100">
                          {lead.initials}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-[0.6875rem] text-content">
                          {lead.name}
                          <span className="ml-1 text-content-muted">
                            {lead.company}
                          </span>
                        </span>
                        <span className="shrink-0 font-mono text-[0.625rem] text-content-secondary">
                          {lead.score}
                        </span>
                        <span
                          className={`grid size-4 shrink-0 place-items-center rounded-full border ${temp.className}`}
                        >
                          <TempIcon className="size-2" />
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <figcaption className="mt-3 text-center text-caption text-content-muted">
        Interface preview with demo data for illustration only — not a real
        account or measured result.
      </figcaption>
    </figure>
  );
}

export { ProductPreview };
