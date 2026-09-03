"use client";

import * as React from "react";
import { Building2, Rocket, Users2, Zap } from "lucide-react";
import { Reveal } from "@/components/landing/reveal";
import { cn } from "@/lib/utils";
import { registerGSAP, useReducedMotion, motionTiming } from "@/lib/motion";
import gsap from "gsap";

const pillars = [
  {
    icon: Zap,
    title: "Fast discovery",
    body: "Go from a description of your ideal customer to a working list in one pass, instead of a week of tab-switching.",
  },
  {
    icon: Users2,
    title: "Organized prospecting",
    body: "Every prospect lands in a campaign with its criteria attached, so you always know why it is in your pipeline.",
  },
  {
    icon: Rocket,
    title: "AI-assisted qualification",
    body: "Scoring is transparent and tunable. You keep the judgement; LeadSeak handles the sorting.",
  },
];

const audiences = [
  "Agencies",
  "Freelancers",
  "Sales teams",
  "Startup founders",
  "Solo entrepreneurs",
  "Consultants",
];

function TrustSection() {
  const sectionRef = React.useRef<HTMLElement>(null);
  const cardsRef = React.useRef<HTMLDivElement[]>([]);
  const iconsRef = React.useRef<HTMLSpanElement[]>([]);
  const chipsRef = React.useRef<HTMLSpanElement[]>([]);
  const reduced = useReducedMotion();
  const [hasAnimated, setHasAnimated] = React.useState(false);

  React.useEffect(() => {
    if (reduced || hasAnimated || !sectionRef.current) return;
    registerGSAP();

    const cards = cardsRef.current.filter(Boolean);
    const icons = iconsRef.current.filter(Boolean);
    const chips = chipsRef.current.filter(Boolean);

    if (!cards.length) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 75%",
        toggleActions: "play none none none",
      },
    });

    tl.fromTo(
      cards,
      { opacity: 0, y: 50, rotationY: -15 },
      {
        opacity: 1,
        y: 0,
        rotationY: 0,
        duration: motionTiming.normal,
        stagger: 0.15,
        ease: "power3.out",
      }
    )
      .fromTo(
        icons,
        { opacity: 0, scale: 0, rotation: -180 },
        {
          opacity: 1,
          scale: 1,
          rotation: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "back.out(2)",
        },
        "-=0.4"
      )
      .fromTo(
        chips,
        { opacity: 0, scale: 0.5, y: 20 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.08,
          ease: "back.out(1.8)",
        },
        "-=0.3"
      );

    return () => {
      tl.kill();
      gsap.killTweensOf([...cards, ...icons, ...chips]);
    };
  }, [reduced, hasAnimated]);

  return (
    <section
      id="solutions"
      ref={sectionRef}
      className="border-t border-line"
    >
      <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-overline uppercase text-electric-400">Solutions</p>
          <h2 className="mt-3 text-h2 text-content">
            Designed around how prospecting actually works.
          </h2>
          <p className="mt-4 text-body text-content-secondary">
            LeadSeak is built for small teams who need pipeline this quarter and
            do not have a research department to lean on.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {pillars.map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                ref={(el) => {
                  if (el) cardsRef.current[i] = el;
                }}
                style={{ opacity: reduced ? 1 : undefined }}
                className="group h-full"
              >
                <div className="tilt-card h-full rounded-xl border border-line bg-surface p-6 transition-all duration-300 ease-premium hover:border-electric-500/28 hover:bg-surface-hover">
                  <span
                    ref={(el) => {
                      if (el) iconsRef.current[i] = el;
                    }}
                    style={{ opacity: reduced ? 1 : undefined }}
                    className="grid size-10 place-items-center rounded-lg border border-electric-500/24 bg-electric-500/10 text-electric-400 transition-all duration-300 group-hover:bg-electric-500/16 group-hover:float-animation"
                  >
                    <Icon className="size-4.5" />
                  </span>
                  <h3 className="mt-4 text-h3 text-content">{pillar.title}</h3>
                  <p className="mt-2 text-small text-content-secondary">
                    {pillar.body}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <Reveal delay={120} className="mt-12">
          <div className="rounded-xl border border-line bg-canvas-subtle p-6 sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-line bg-surface text-content-muted transition-all duration-300 hover:float-animation">
                  <Building2 className="size-4" />
                </span>
                <div>
                  <p className="text-body font-medium text-content">
                    Who LeadSeak is built for
                  </p>
                  <p className="mt-1 text-small text-content-secondary">
                    Teams that own their own pipeline, end to end.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 sm:justify-end">
                {audiences.map((audience, i) => (
                  <span
                    key={audience}
                    ref={(el) => {
                      if (el) chipsRef.current[i] = el;
                    }}
                    style={{ opacity: reduced ? 1 : undefined }}
                    className="rounded-full border border-line bg-surface px-3 py-1.5 text-caption text-content-secondary transition-all duration-300 hover:border-electric-500/24 hover:text-content hover:float-animation"
                  >
                    {audience}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export { TrustSection };
