"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/landing/reveal";
import { ProductPreview } from "@/components/landing/product-preview";
import { registerGSAP, useReducedMotion } from "@/lib/motion";
import gsap from "gsap";

/* ------------------------------------------------------------------ */
/* Star-field — animated floating particles (wope-style)               */
/* ------------------------------------------------------------------ */
function StarField() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  React.useEffect(() => {
    if (reduced || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const stars: { x: number; y: number; r: number; speed: number; opacity: number; pulse: number }[] = [];

    function resize() {
      canvas!.width = canvas!.offsetWidth * devicePixelRatio;
      canvas!.height = canvas!.offsetHeight * devicePixelRatio;
      ctx!.scale(devicePixelRatio, devicePixelRatio);
    }

    function init() {
      resize();
      const w = canvas!.offsetWidth;
      const h = canvas!.offsetHeight;
      stars.length = 0;
      const count = Math.floor((w * h) / 8000);
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.4 + 0.3,
          speed: Math.random() * 0.15 + 0.02,
          opacity: Math.random() * 0.6 + 0.1,
          pulse: Math.random() * Math.PI * 2,
        });
      }
    }

    function draw() {
      const w = canvas!.offsetWidth;
      const h = canvas!.offsetHeight;
      ctx!.clearRect(0, 0, w, h);

      for (const s of stars) {
        s.pulse += 0.008;
        s.y -= s.speed;
        if (s.y < -4) {
          s.y = h + 4;
          s.x = Math.random() * w;
        }
        const flicker = s.opacity + Math.sin(s.pulse) * 0.15;
        ctx!.beginPath();
        ctx!.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(52, 120, 255, ${Math.max(0, flicker)})`;
        ctx!.fill();
      }
      animId = requestAnimationFrame(draw);
    }

    init();
    draw();
    window.addEventListener("resize", init);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", init);
    };
  }, [reduced]);

  if (reduced) return null;
  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 size-full"
      style={{ zIndex: 8 }}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Animated vertical light lines (wope-style)                          */
/* ------------------------------------------------------------------ */
function LightLines() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [hasAnimated, setHasAnimated] = React.useState(false);

  React.useEffect(() => {
    if (reduced || hasAnimated || !containerRef.current) return;
    registerGSAP();
    const lines = containerRef.current.querySelectorAll(".light-line");
    if (!lines.length) return;

    gsap.fromTo(
      lines,
      { scaleY: 0, transformOrigin: "top" },
      {
        scaleY: 1,
        duration: 2.5,
        stagger: { each: 0.3, from: "random" },
        ease: "power2.inOut",
        onComplete: () => setHasAnimated(true),
      }
    );

    return () => { gsap.killTweensOf(lines); };
  }, [reduced, hasAnimated]);

  return (
    <div
      ref={containerRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ zIndex: 1 }}
    >
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="light-line absolute top-0 h-full"
          style={{
            left: `${12 + i * 11}%`,
            width: "1px",
            background: `linear-gradient(180deg, rgba(52,120,255,${0.06 + (i % 3) * 0.02}) 0%, rgba(52,120,255,0.02) 40%, transparent 70%)`,
            transform: reduced ? undefined : "scaleY(0)",
            transformOrigin: "top",
          }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Hero                                                                 */
/* ------------------------------------------------------------------ */
function Hero() {
  const sectionRef = React.useRef<HTMLElement>(null);
  const parallaxRef = React.useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  React.useEffect(() => {
    if (reduced || !sectionRef.current || !parallaxRef.current) return;
    registerGSAP();

    const onScroll = () => {
      if (!sectionRef.current || !parallaxRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const scrollProgress = Math.max(0, -rect.top / rect.height);
      const translateY = scrollProgress * 80;
      parallaxRef.current.style.transform = `translateY(${translateY}px)`;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [reduced]);

  return (
    <section
      id="product"
      ref={sectionRef}
      className="relative overflow-hidden"
      style={{ minHeight: "100vh" }}
    >
      {/* Parallax background wrapper */}
      <div ref={parallaxRef} className="absolute inset-0 will-change-transform">
        {/* Radial gradient glow — wope-style */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(38% 24% at 50% 12%, rgba(52,120,255,0.10) 0%, transparent 100%),
              radial-gradient(24% 22% at 50% 0%, rgba(90,108,255,0.06) 0%, transparent 100%)
            `,
            zIndex: 0,
          }}
        />

        {/* Star particles */}
        <StarField />

        {/* Animated vertical light lines */}
        <LightLines />

        {/* Bottom fade grid */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)",
            backgroundSize: "4rem 4rem",
            maskImage: "linear-gradient(180deg, transparent 50%, #000 100%)",
            zIndex: 2,
          }}
        />
      </div>

      {/* Content */}
      <div
        className="relative mx-auto flex w-full max-w-5xl flex-col items-center px-6 pb-20 pt-36 sm:px-10 sm:pb-28 sm:pt-44"
        style={{ zIndex: 100 }}
      >
        <div className="flex max-w-3xl flex-col items-center text-center">
          <Reveal load delay={100}>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-1.5 text-caption font-medium text-content-secondary backdrop-blur-md transition-all duration-300 hover:border-white/[0.14]">
              <span className="size-1.5 rounded-full bg-electric-400 animate-pulse" />
              AI-Powered Prospect Intelligence
            </span>
          </Reveal>

          <Reveal load delay={280}>
            <h1
              className="mt-8 text-h1 font-bold tracking-tight sm:text-display"
              style={{
                background: "linear-gradient(180deg, #eaeff8 22%, rgba(234,239,248,0.7) 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              The New Era of
              <br />
              Prospect Research
            </h1>
          </Reveal>

          <Reveal load delay={420}>
            <p className="mt-6 max-w-xl text-body-lg" style={{ color: "rgb(154, 166, 189)" }}>
              Let our AI do the heavy lifting. Discover qualified prospects,
              find hidden opportunities, and get clear actionable insights —
              all in one platform.
            </p>
          </Reveal>

          <Reveal load delay={560} className="mt-10">
            <Link
              href="/signup"
              className="group relative inline-flex items-center gap-2 rounded-full border border-white/[0.1] px-6 py-3 text-small font-medium text-content transition-all duration-500 hover:border-white/[0.18] shimmer-btn focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-electric-500"
              style={{
                background:
                  "radial-gradient(107% 107% at 50% 215%, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 100%), rgba(255,255,255,0.04)",
              }}
            >
              Unlimited trial for 14 days
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
          </Reveal>

          <Reveal load delay={660}>
            <p className="mt-5 text-caption text-content-muted">
              No credit card required
            </p>
          </Reveal>
        </div>

        {/* Product preview */}
        <Reveal load delay={900} className="mt-20 w-full max-w-5xl">
          <ProductPreview />
        </Reveal>
      </div>
    </section>
  );
}

export { Hero };
