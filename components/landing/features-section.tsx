"use client";

import * as React from "react";
import {
  BarChart3,
  Flame,
  Gauge,
  type LucideIcon,
  Search,
  Snowflake,
  Sparkles,
  Sun,
  Target,
  Users,
} from "lucide-react";
import { Reveal } from "@/components/landing/reveal";
import { cn } from "@/lib/utils";
import { registerGSAP, useReducedMotion, motionTiming } from "@/lib/motion";
import gsap from "gsap";

/* ------------------------------------------------------------------ */
/* Mouse-tracking glow + tilt hook                                     */
/* ------------------------------------------------------------------ */
function useMouseGlowWithTilt() {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      el.style.setProperty("--mouse-x", `${x}px`);
      el.style.setProperty("--mouse-y", `${y}px`);

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const tiltX = ((y - centerY) / centerY) * -5;
      const tiltY = ((x - centerX) / centerX) * 5;
      el.style.setProperty("--tilt-x", `${tiltX}deg`);
      el.style.setProperty("--tilt-y", `${tiltY}deg`);
    };
    const onLeave = () => {
      el.style.setProperty("--tilt-x", "0deg");
      el.style.setProperty("--tilt-y", "0deg");
    };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return ref;
}

/* ------------------------------------------------------------------ */
/* Feature card with mouse glow + conic border + 3D tilt               */
/* ------------------------------------------------------------------ */
function GlowCard({
  icon: Icon,
  title,
  body,
  className,
  children,
  large,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  className?: string;
  children?: React.ReactNode;
  large?: boolean;
}) {
  const glowRef = useMouseGlowWithTilt();

  return (
    <div
      ref={glowRef}
      className={cn(
        "group relative overflow-hidden rounded-2xl card-glow tilt-card",
        "glass-card transition-all duration-500 ease-premium",
        "hover:border-electric-500/20",
        large ? "lg:col-span-2" : "",
        className
      )}
    >
      <div className="relative z-10 p-6 sm:p-8">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-electric-500/24 bg-electric-500/10 text-electric-400 transition-all duration-300 group-hover:bg-electric-500/16 group-hover:float-animation">
          <Icon className="size-5" />
        </span>
        <h3 className="mt-5 text-h3 text-content">{title}</h3>
        <p className="mt-2.5 text-small text-content-secondary">{body}</p>
        {children && <div className="mt-6">{children}</div>}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Visuals                                                             */
/* ------------------------------------------------------------------ */
function DiscoveryVisual() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const matchesRef = React.useRef<HTMLDivElement[]>([]);
  const reduced = useReducedMotion();
  const [hasAnimated, setHasAnimated] = React.useState(false);

  const matches = [
    { name: "Vertex Labs", meta: "B2B SaaS · 42 staff · Berlin", score: 92 },
    { name: "Northwind Studio", meta: "Agency · 28 staff · Dublin", score: 88 },
    { name: "Cobalt Freight", meta: "Logistics · 61 staff · Rotterdam", score: 74 },
  ];

  React.useEffect(() => {
    if (reduced || hasAnimated || !containerRef.current) return;
    registerGSAP();
    const els = matchesRef.current.filter(Boolean);
    if (!els.length) return;
    gsap.fromTo(els, { opacity: 0, y: 24 }, {
      opacity: 1, y: 0, duration: motionTiming.normal, stagger: 0.1,
      ease: "back.out(1.4)",
      scrollTrigger: { trigger: containerRef.current, start: "top 85%", toggleActions: "play none none none" },
      onComplete: () => setHasAnimated(true),
    });
    return () => { gsap.killTweensOf(els); };
  }, [reduced, hasAnimated]);

  return (
    <div ref={containerRef} className="flex flex-col gap-2.5">
      <div className="flex items-center gap-2 rounded-lg border border-line bg-canvas-subtle/80 px-3 py-2.5 backdrop-blur-sm">
        <Search className="size-3.5 shrink-0 text-electric-400" />
        <span className="truncate text-caption text-content-secondary">
          "EU SaaS companies, 20-80 staff, hiring sales"
        </span>
      </div>
      {matches.map((match, i) => (
        <div
          key={match.name}
          ref={(el) => { if (el) matchesRef.current[i] = el; }}
          style={{ opacity: reduced ? 1 : undefined }}
          className="flex items-center gap-3 rounded-lg border border-line bg-surface-elevated/60 px-3 py-2.5 backdrop-blur-sm transition-colors duration-300 group-hover:border-electric-500/22"
        >
          <span className="grid size-6 shrink-0 place-items-center rounded-md bg-gradient-to-br from-electric-600/35 to-indigo-blue-600/35 text-[0.5625rem] font-medium text-electric-100">
            {match.name.slice(0, 2).toUpperCase()}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-caption font-medium text-content">{match.name}</span>
            <span className="block truncate text-[0.6875rem] text-content-muted">{match.meta}</span>
          </span>
          <span className="shrink-0 font-mono text-caption text-electric-300">{match.score}</span>
        </div>
      ))}
    </div>
  );
}

function TargetingVisual() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const chipsRef = React.useRef<HTMLSpanElement[]>([]);
  const reduced = useReducedMotion();
  const [hasAnimated, setHasAnimated] = React.useState(false);

  const criteria = ["B2B SaaS", "20-80 staff", "EU", "Series A", "Hiring sales", "Uses HubSpot"];

  React.useEffect(() => {
    if (reduced || hasAnimated || !containerRef.current) return;
    registerGSAP();
    const els = chipsRef.current.filter(Boolean);
    if (!els.length) return;
    gsap.fromTo(els, { opacity: 0, scale: 0.7 }, {
      opacity: 1, scale: 1, duration: motionTiming.normal, stagger: 0.06,
      ease: "back.out(2)",
      scrollTrigger: { trigger: containerRef.current, start: "top 85%", toggleActions: "play none none none" },
      onComplete: () => setHasAnimated(true),
    });
    return () => { gsap.killTweensOf(els); };
  }, [reduced, hasAnimated]);

  return (
    <div ref={containerRef} className="flex flex-wrap gap-1.5">
      {criteria.map((item, i) => (
        <span
          key={item}
          ref={(el) => { if (el) chipsRef.current[i] = el; }}
          style={{ opacity: reduced ? 1 : undefined }}
          className="rounded-full border border-line bg-canvas-subtle/60 px-2.5 py-1 text-[0.6875rem] text-content-secondary backdrop-blur-sm transition-colors duration-300 group-hover:border-electric-500/24 group-hover:text-content"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function IntelligenceVisual() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const barsRef = React.useRef<HTMLDivElement[]>([]);
  const reduced = useReducedMotion();
  const [hasAnimated, setHasAnimated] = React.useState(false);

  const signals = [
    { label: "Firmographic fit", pct: 94 },
    { label: "Buying signals", pct: 78 },
    { label: "Contact quality", pct: 86 },
  ];

  React.useEffect(() => {
    if (reduced || hasAnimated || !containerRef.current) return;
    registerGSAP();
    const els = barsRef.current.filter(Boolean);
    if (!els.length) return;
    gsap.fromTo(els, { scaleX: 0, transformOrigin: "left" }, {
      scaleX: 1, duration: motionTiming.cinematic, stagger: 0.12, ease: "power4.out",
      scrollTrigger: { trigger: containerRef.current, start: "top 85%", toggleActions: "play none none none" },
      onComplete: () => setHasAnimated(true),
    });
    return () => { gsap.killTweensOf(els); };
  }, [reduced, hasAnimated]);

  return (
    <div ref={containerRef} className="flex flex-col gap-3">
      {signals.map((signal, i) => (
        <div key={signal.label} className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[0.6875rem] text-content-secondary">{signal.label}</span>
            <span className="font-mono text-[0.625rem] text-content-muted">{signal.pct}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
            <div
              ref={(el) => { if (el) barsRef.current[i] = el; }}
              style={{ width: `${signal.pct}%`, transform: reduced ? undefined : "scaleX(0)", transformOrigin: "left" }}
              className="h-full rounded-full bg-gradient-to-r from-electric-500 to-indigo-blue-500"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function TemperatureVisual() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const tiersRef = React.useRef<HTMLDivElement[]>([]);
  const reduced = useReducedMotion();
  const [hasAnimated, setHasAnimated] = React.useState(false);

  const tiers = [
    { label: "Hot", range: "80-100", count: 87, icon: Flame, className: "border-danger/28 bg-danger/10 text-danger-soft" },
    { label: "Warm", range: "50-79", count: 296, icon: Sun, className: "border-warning/28 bg-warning/10 text-warning-soft" },
    { label: "Cold", range: "0-49", count: 231, icon: Snowflake, className: "border-electric-500/28 bg-electric-500/10 text-electric-300" },
  ];

  React.useEffect(() => {
    if (reduced || hasAnimated || !containerRef.current) return;
    registerGSAP();
    const els = tiersRef.current.filter(Boolean);
    if (!els.length) return;
    gsap.fromTo(els, { opacity: 0, x: 30 }, {
      opacity: 1, x: 0, duration: motionTiming.normal, stagger: 0.1, ease: "power3.out",
      scrollTrigger: { trigger: containerRef.current, start: "top 85%", toggleActions: "play none none none" },
      onComplete: () => setHasAnimated(true),
    });
    return () => { gsap.killTweensOf(els); };
  }, [reduced, hasAnimated]);

  return (
    <div ref={containerRef} className="flex flex-col gap-2">
      {tiers.map((tier, i) => {
        const Icon = tier.icon;
        return (
          <div
            key={tier.label}
            ref={(el) => { if (el) tiersRef.current[i] = el; }}
            style={{ opacity: reduced ? 1 : undefined }}
            className="flex items-center gap-2.5 rounded-lg border border-line bg-surface-elevated/60 px-3 py-2 backdrop-blur-sm"
          >
            <span className={cn("grid size-6 shrink-0 place-items-center rounded-md border", tier.className)}>
              <Icon className="size-3" />
            </span>
            <span className="flex-1 text-caption font-medium text-content">{tier.label}</span>
            <span className="font-mono text-[0.625rem] text-content-muted">{tier.range}</span>
            <span className="font-mono text-caption text-content-secondary">{tier.count}</span>
          </div>
        );
      })}
    </div>
  );
}

function CrmVisual() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const colsRef = React.useRef<HTMLDivElement[]>([]);
  const reduced = useReducedMotion();
  const [hasAnimated, setHasAnimated] = React.useState(false);

  const columns = [
    { stage: "New", count: 4 },
    { stage: "Contacted", count: 3 },
    { stage: "Won", count: 2 },
  ];

  React.useEffect(() => {
    if (reduced || hasAnimated || !containerRef.current) return;
    registerGSAP();
    const els = colsRef.current.filter(Boolean);
    if (!els.length) return;
    gsap.fromTo(els, { opacity: 0, y: 30 }, {
      opacity: 1, y: 0, duration: motionTiming.normal, stagger: 0.12, ease: "back.out(1.2)",
      scrollTrigger: { trigger: containerRef.current, start: "top 85%", toggleActions: "play none none none" },
      onComplete: () => setHasAnimated(true),
    });
    return () => { gsap.killTweensOf(els); };
  }, [reduced, hasAnimated]);

  return (
    <div ref={containerRef} className="grid grid-cols-3 gap-2">
      {columns.map((column, i) => (
        <div
          key={column.stage}
          ref={(el) => { if (el) colsRef.current[i] = el; }}
          style={{ opacity: reduced ? 1 : undefined }}
          className="rounded-lg border border-line bg-canvas-subtle/60 p-2 backdrop-blur-sm"
        >
          <p className="mb-1.5 text-[0.625rem] font-medium uppercase tracking-wide text-content-muted">{column.stage}</p>
          <div className="flex flex-col gap-1">
            {Array.from({ length: column.count }).map((_, j) => (
              <div key={j} className="h-4 rounded-sm border border-line bg-surface-elevated/60 transition-colors duration-300 group-hover:border-electric-500/20" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function AnalyticsVisual() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const barsRef = React.useRef<HTMLDivElement[]>([]);
  const reduced = useReducedMotion();
  const [hasAnimated, setHasAnimated] = React.useState(false);

  const funnel = [
    { stage: "Discovered", pct: 100, value: "2,481" },
    { stage: "Processed", pct: 77, value: "1,902" },
    { stage: "Qualified", pct: 25, value: "614" },
    { stage: "Hot", pct: 11, value: "87" },
    { stage: "Won", pct: 4, value: "23" },
  ];

  React.useEffect(() => {
    if (reduced || hasAnimated || !containerRef.current) return;
    registerGSAP();
    const els = barsRef.current.filter(Boolean);
    if (!els.length) return;
    gsap.fromTo(els, { scaleX: 0, transformOrigin: "left" }, {
      scaleX: 1, duration: motionTiming.cinematic, stagger: 0.1, ease: "power4.out",
      scrollTrigger: { trigger: containerRef.current, start: "top 88%", toggleActions: "play none none none" },
      onComplete: () => setHasAnimated(true),
    });
    return () => { gsap.killTweensOf(els); };
  }, [reduced, hasAnimated]);

  return (
    <div ref={containerRef} className="grid gap-4 sm:grid-cols-5">
      {funnel.map((step, i) => (
        <div key={step.stage} className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between gap-2 sm:flex-col sm:items-start sm:gap-0.5">
            <span className="text-[0.6875rem] text-content-muted">{step.stage}</span>
            <span className="font-mono text-body text-content">{step.value}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
            <div
              ref={(el) => { if (el) barsRef.current[i] = el; }}
              style={{ width: `${step.pct}%`, transform: reduced ? undefined : "scaleX(0)", transformOrigin: "left" }}
              className="h-full rounded-full bg-gradient-to-r from-electric-500 to-indigo-blue-500"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Section                                                             */
/* ------------------------------------------------------------------ */
function FeaturesSection() {
  return (
    <section id="features" className="relative overflow-hidden border-t border-line">
      <div aria-hidden className="absolute inset-0 vertical-lines" />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(50rem 30rem at 50% 0%, rgba(52,120,255,0.08) 0%, transparent 60%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-7xl px-6 py-24 sm:px-10 sm:py-32">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-overline uppercase text-electric-400">Features</p>
          <h2 className="mt-3 text-h2 text-content sm:text-h1">
            Meet the full prospect
            <br />
            <span className="text-gradient-electric">research experience.</span>
          </h2>
          <p className="mt-5 text-body text-content-secondary">
            Six capabilities that carry a prospect from an unknown name to a
            forecastable opportunity — all in one workspace.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Reveal className="lg:col-span-2">
            <GlowCard
              icon={Sparkles}
              title="AI Prospect Discovery"
              body="Describe an ideal customer in plain language. LeadSeak interprets the intent and surfaces companies that match the shape of your best accounts."
              large
            >
              <DiscoveryVisual />
            </GlowCard>
          </Reveal>

          <Reveal delay={100}>
            <GlowCard
              icon={Target}
              title="Campaign Targeting"
              body="Lock a campaign to precise criteria — industry, headcount, geography, tech, and hiring signals."
            >
              <TargetingVisual />
            </GlowCard>
          </Reveal>

          <Reveal delay={150}>
            <GlowCard
              icon={Gauge}
              title="Lead Intelligence"
              body="Every prospect carries a transparent score, so you can see why it ranked where it did."
            >
              <IntelligenceVisual />
            </GlowCard>
          </Reveal>

          <Reveal delay={200}>
            <GlowCard
              icon={Flame}
              title="Hot / Warm / Cold"
              body="Automatic tiering puts the conversations most likely to convert at the top of your day."
            >
              <TemperatureVisual />
            </GlowCard>
          </Reveal>

          <Reveal delay={250} className="sm:col-span-2 lg:col-span-2">
            <GlowCard
              icon={Users}
              title="Built-in CRM"
              body="Campaigns, contacts, and stages in one workspace. No exports, no spreadsheet drift."
              large
            >
              <CrmVisual />
            </GlowCard>
          </Reveal>

          <Reveal delay={150} className="sm:col-span-2 lg:col-span-3">
            <GlowCard
              icon={BarChart3}
              title="Analytics"
              body="See which criteria produce revenue — full funnel visibility from discovery to won."
            >
              <AnalyticsVisual />
            </GlowCard>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export { FeaturesSection };
