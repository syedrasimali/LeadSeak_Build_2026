"use client";

import * as React from "react";
import { ArrowRight, Database, Filter, Sparkles, Users } from "lucide-react";
import { Reveal } from "@/components/landing/reveal";
import { cn } from "@/lib/utils";
import { registerGSAP, useReducedMotion, motionTiming } from "@/lib/motion";
import gsap from "gsap";

const stages = [
  {
    label: "Campaign",
    icon: Filter,
    body: "Describe who you want. Industry, size, region, signals.",
  },
  {
    label: "Discovery",
    icon: Sparkles,
    body: "LeadSeak surfaces matching companies and the people inside them.",
  },
  {
    label: "Qualification",
    icon: Database,
    body: "Each prospect is scored and sorted into hot, warm, or cold.",
  },
  {
    label: "CRM",
    icon: Users,
    body: "Everything lands in a pipeline you can actually work from.",
  },
];

function SolutionSection() {
  const sectionRef = React.useRef<HTMLElement>(null);
  const cardsRef = React.useRef<HTMLDivElement[]>([]);
  const connectorsRef = React.useRef<HTMLDivElement[]>([]);
  const numbersRef = React.useRef<HTMLSpanElement[]>([]);
  const reduced = useReducedMotion();
  const [hasAnimated, setHasAnimated] = React.useState(false);

  React.useEffect(() => {
    if (reduced || hasAnimated || !sectionRef.current) return;
    registerGSAP();

    const cards = cardsRef.current.filter(Boolean);
    const connectors = connectorsRef.current.filter(Boolean);
    const numbers = numbersRef.current.filter(Boolean);

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
      { opacity: 0, y: 60, scale: 0.9 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: motionTiming.normal,
        stagger: 0.15,
        ease: "back.out(1.4)",
      }
    )
      .fromTo(
        connectors,
        { opacity: 0, scale: 0 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.4,
          stagger: 0.1,
          ease: "back.out(2)",
        },
        "-=0.3"
      )
      .fromTo(
        numbers,
        { opacity: 0, scale: 0, rotation: -180 },
        {
          opacity: 1,
          scale: 1,
          rotation: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "back.out(2)",
        },
        "-=0.8"
      );

    return () => {
      tl.kill();
      gsap.killTweensOf([...cards, ...connectors, ...numbers]);
    };
  }, [reduced, hasAnimated]);

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="relative overflow-hidden"
    >
      <div aria-hidden className="absolute inset-0 field-electric opacity-60" />

      <div className="relative mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-overline uppercase text-electric-400">
            How it works
          </p>
          <h2 className="mt-3 text-h2 text-content">
            One pass, start to pipeline.
          </h2>
          <p className="mt-4 text-body text-content-secondary">
            LeadSeak collapses the whole loop into a single flow. You define the
            target once — the platform handles the rest.
          </p>
        </Reveal>

        <div className="mt-14 grid items-stretch gap-2 lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] lg:gap-0">
          {stages.map((stage, i) => {
            const Icon = stage.icon;
            const isLast = i === stages.length - 1;

            return (
              <React.Fragment key={stage.label}>
                <div
                  ref={(el) => {
                    if (el) cardsRef.current[i] = el;
                  }}
                  style={{ opacity: reduced ? 1 : undefined }}
                  className="group relative h-full"
                >
                  <div className="tilt-card relative h-full rounded-xl border border-line bg-surface p-5 transition-all duration-300 ease-premium hover:border-electric-500/32 hover:bg-surface-hover">
                    <span className="grid size-10 place-items-center rounded-lg border border-electric-500/24 bg-electric-500/10 text-electric-400 transition-all duration-300 group-hover:bg-electric-500/16 group-hover:float-animation">
                      <Icon className="size-4.5" />
                    </span>
                    <p className="mt-4 text-body font-semibold text-content">
                      {stage.label}
                    </p>
                    <p className="mt-1.5 text-small text-content-secondary">
                      {stage.body}
                    </p>
                    <span
                      ref={(el) => {
                        if (el) numbersRef.current[i] = el;
                      }}
                      style={{ opacity: reduced ? 1 : undefined }}
                      className="absolute right-4 top-5 font-mono text-caption text-content-disabled"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                </div>

                {!isLast && (
                  <div
                    ref={(el) => {
                      if (el) connectorsRef.current[i] = el;
                    }}
                    style={{ opacity: reduced ? 1 : undefined }}
                    aria-hidden
                    className="flex items-center justify-center py-0.5 lg:px-3 lg:py-0"
                  >
                    <ArrowRight className="size-4 rotate-90 text-electric-400/60 transition-colors duration-300 lg:rotate-0" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export { SolutionSection };
