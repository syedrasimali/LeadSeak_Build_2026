"use client";

import * as React from "react";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/landing/reveal";
import { SmartCtaLink } from "@/components/landing/smart-cta-link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { registerGSAP, useReducedMotion, motionTiming } from "@/lib/motion";
import gsap from "gsap";

function FinalCta() {
  const sectionRef = React.useRef<HTMLElement>(null);
  const headingRef = React.useRef<HTMLHeadingElement>(null);
  const reduced = useReducedMotion();
  const [hasAnimated, setHasAnimated] = React.useState(false);

  React.useEffect(() => {
    if (reduced || hasAnimated || !sectionRef.current || !headingRef.current) return;
    registerGSAP();

    const heading = headingRef.current;
    const words = heading.querySelectorAll(".cta-word");

    if (!words.length) return;

    gsap.fromTo(
      words,
      { opacity: 0, y: 40, rotationX: -90 },
      {
        opacity: 1,
        y: 0,
        rotationX: 0,
        duration: motionTiming.normal,
        stagger: 0.12,
        ease: "back.out(1.7)",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          toggleActions: "play none none none",
        },
        onComplete: () => setHasAnimated(true),
      }
    );

    return () => {
      gsap.killTweensOf(words);
    };
  }, [reduced, hasAnimated]);

  return (
    <section
      id="pricing"
      ref={sectionRef}
      className="relative overflow-hidden border-t border-line"
    >
      {/* Background effects */}
      <div aria-hidden className="absolute inset-0 floating-particles opacity-40" />
      <div aria-hidden className="absolute inset-0 light-rays" />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(50rem 30rem at 50% 100%, rgba(52,120,255,0.12) 0%, transparent 60%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-4xl px-6 py-28 sm:px-10 sm:py-36">
        <Reveal className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <h2
            ref={headingRef}
            className="text-h2 text-content sm:text-display"
          >
            <span className="cta-word inline-block" style={{ opacity: reduced ? 1 : undefined }}>
              Outrank Everyone.
            </span>
            <br />
            <span className="cta-word inline-block text-gradient-electric" style={{ opacity: reduced ? 1 : undefined }}>
              Starting Now.
            </span>
          </h2>

          <p className="mt-6 text-body-lg text-content-secondary">
            Set up your first campaign and let LeadSeak build the list while you
            focus on the conversations that matter.
          </p>

          <div className="mt-10 flex w-full max-w-md flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Input
                type="email"
                placeholder="Enter your work email"
                className="h-12 rounded-xl border-line bg-surface/60 backdrop-blur-sm pr-4 text-body placeholder:text-content-muted focus:border-electric-500/40 focus:ring-1 focus:ring-electric-500/20"
              />
            </div>
            <Button
              asChild
              size="lg"
              className="glow-border shimmer-btn pulse-glow h-12 shrink-0"
            >
              <SmartCtaLink>
                Try Demo
                <ArrowRight />
              </SmartCtaLink>
            </Button>
          </div>

          <p className="mt-4 text-caption text-content-muted">
            No credit card required · 14-day unlimited trial
          </p>
        </Reveal>
      </div>
    </section>
  );
}

export { FinalCta };
