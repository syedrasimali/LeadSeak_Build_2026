"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { Reveal } from "@/components/landing/reveal";
import { cn } from "@/lib/utils";
import { registerGSAP, useReducedMotion, motionTiming } from "@/lib/motion";
import gsap from "gsap";

const faqs = [
  {
    q: "What is LeadSeak and how does it work?",
    a: "LeadSeak is an AI-powered prospect research platform. You describe your ideal customer in plain language, and LeadSeak discovers matching companies, scores each prospect on fit and buying signals, and organizes them into a working pipeline — all in one pass.",
  },
  {
    q: "How is this different from manual research?",
    a: "Manual prospecting means bouncing between search engines, directories, and spreadsheets for every single name. LeadSeak collapses that entire loop into a single flow: define your target once, and the platform handles discovery, qualification, and organization automatically.",
  },
  {
    q: "What does the scoring system look like?",
    a: "Every prospect gets a transparent score based on firmographic fit, buying signals, and contact quality. Prospects are automatically sorted into Hot, Warm, and Cold tiers so you always know which conversations to prioritize.",
  },
  {
    q: "Can I integrate LeadSeak with my existing tools?",
    a: "LeadSeak includes a built-in CRM so you can manage your entire pipeline without exporting data. The platform is designed to be your single workspace for prospect research and pipeline management.",
  },
  {
    q: "Is there a free trial available?",
    a: "Yes. LeadSeak offers a 14-day unlimited trial with full access to all features. No credit card required to get started.",
  },
];

function FaqItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = React.useState(false);
  const itemRef = React.useRef<HTMLDivElement>(null);
  const btnId = `faq-btn-${index}`;
  const panelId = `faq-panel-${index}`;

  return (
    <div
      ref={itemRef}
      className="faq-item"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div
        className={cn(
          "rounded-xl border transition-all duration-500 ease-premium",
          open
            ? "border-electric-500/20 bg-surface-elevated/40 backdrop-blur-sm"
            : "border-line bg-surface/40 backdrop-blur-sm hover:border-line-strong"
        )}
      >
        <button
          id={btnId}
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
          aria-expanded={open}
          aria-controls={panelId}
        >
          <span className="text-body font-medium text-content">{q}</span>
          <ChevronDown
            className={cn(
              "size-4.5 shrink-0 text-content-muted transition-all duration-300",
              open && "rotate-180 text-electric-400"
            )}
          />
        </button>
        <div
          id={panelId}
          role="region"
          aria-labelledby={btnId}
          className={cn(
            "grid transition-[grid-template-rows,opacity] duration-500 ease-premium",
            open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          )}
        >
          <div className="overflow-hidden">
            <p className="px-6 pb-5 text-small text-content-secondary leading-relaxed">
              {a}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FaqSection() {
  const sectionRef = React.useRef<HTMLElement>(null);
  const itemsRef = React.useRef<HTMLDivElement[]>([]);
  const reduced = useReducedMotion();
  const [hasAnimated, setHasAnimated] = React.useState(false);

  React.useEffect(() => {
    if (reduced || hasAnimated || !sectionRef.current) return;
    registerGSAP();

    const items = itemsRef.current.filter(Boolean);
    if (!items.length) return;

    gsap.fromTo(
      items,
      { opacity: 0, x: -40, rotationY: -10 },
      {
        opacity: 1,
        x: 0,
        rotationY: 0,
        duration: motionTiming.normal,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
          toggleActions: "play none none none",
        },
        onComplete: () => setHasAnimated(true),
      }
    );

    return () => {
      gsap.killTweensOf(items);
    };
  }, [reduced, hasAnimated]);

  return (
    <section
      id="faq"
      ref={sectionRef}
      className="relative overflow-hidden border-t border-line"
    >
      <div aria-hidden className="absolute inset-0 floating-particles opacity-50" />

      <div className="relative mx-auto w-full max-w-3xl px-6 py-24 sm:px-10 sm:py-32">
        <Reveal className="text-center">
          <p className="text-overline uppercase text-electric-400">FAQ</p>
          <h2 className="mt-3 text-h2 text-content sm:text-h1">
            Frequently asked questions
          </h2>
          <p className="mt-4 text-body text-content-secondary">
            Everything you need to know about LeadSeak.
          </p>
        </Reveal>

        <div className="mt-14 flex flex-col gap-3">
          {faqs.map((faq, i) => (
            <div
              key={faq.q}
              ref={(el) => {
                if (el) itemsRef.current[i] = el;
              }}
              style={{ opacity: reduced ? 1 : undefined }}
            >
              <FaqItem q={faq.q} a={faq.a} index={i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export { FaqSection };
