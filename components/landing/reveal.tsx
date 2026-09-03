"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  registerGSAP,
  useReducedMotion,
  animateReveal,
  motionTiming,
} from "@/lib/motion";
import gsap from "gsap";

interface RevealProps extends React.ComponentProps<"div"> {
  /** Stagger in ms. Only meaningful with `load`, since scroll-driven
      reveals are keyed to scroll position rather than elapsed time. */
  delay?: number;
  /** Animate once on load instead of on scroll. Use above the fold. */
  load?: boolean;
  /** Animation variant */
  variant?: "fade-up" | "fade-in" | "scale-in" | "slide-left" | "slide-right";
}

const variantConfig = {
  "fade-up": { y: 50, x: 0, scale: undefined },
  "fade-in": { y: 0, x: 0, scale: undefined },
  "scale-in": { y: 0, x: 0, scale: 0.88 },
  "slide-left": { y: 0, x: -60, scale: undefined },
  "slide-right": { y: 0, x: 60, scale: undefined },
} as const;

function Reveal({
  className,
  delay = 0,
  load = false,
  variant = "fade-up",
  style,
  children,
  ...props
}: RevealProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [hasAnimated, setHasAnimated] = React.useState(false);

  const config = variantConfig[variant];

  React.useEffect(() => {
    if (reduced || hasAnimated || !ref.current) return;

    registerGSAP();
    const el = ref.current;

    if (load) {
      const delaySec = delay / 1000;
      gsap.fromTo(
        el,
        {
          opacity: 0,
          y: config.y,
          x: config.x,
          scale: config.scale,
        },
        {
          opacity: 1,
          y: 0,
          x: 0,
          scale: 1,
          duration: motionTiming.cinematic,
          delay: delaySec,
          ease: "power4.out",
          onComplete: () => setHasAnimated(true),
        }
      );
    } else {
      gsap.fromTo(
        el,
        {
          opacity: 0,
          y: config.y,
          x: config.x,
          scale: config.scale,
        },
        {
          opacity: 1,
          y: 0,
          x: 0,
          scale: 1,
          duration: motionTiming.cinematic,
          ease: "power4.out",
          scrollTrigger: {
            trigger: el,
            start: "top 90%",
            end: "top 50%",
            toggleActions: "play none none none",
          },
          onComplete: () => setHasAnimated(true),
        }
      );
    }

    return () => {
      gsap.killTweensOf(el);
    };
  }, [reduced, load, delay, config, hasAnimated]);

  const revealProps = load ? { "data-reveal-load": "" } : { "data-reveal": "" };

  return (
    <div
      ref={ref}
      {...revealProps}
      style={{
        animationDelay: load && delay ? `${delay}ms` : undefined,
        ...style,
      }}
      className={cn(className)}
      {...props}
    >
      {children}
    </div>
  );
}

export { Reveal };
