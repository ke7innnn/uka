"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

export default function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 2,
    });

    // ── KEY FIX: keep GSAP ScrollTrigger in sync with Lenis ──────────────
    lenis.on("scroll", ScrollTrigger.update);
    // Expose Lenis-smoothed scroll position globally so any page's rAF
    // loop can read it without needing to import the Lenis instance.
    lenis.on("scroll", ({ scroll }: { scroll: number }) => {
      (window as typeof window & { __lenisScrollY: number }).__lenisScrollY = scroll;
    });

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    // Prevent GSAP ticker from also calling RAF (Lenis owns the RAF loop)
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove((time) => lenis.raf(time * 1000));
    };
  }, []);

  return <>{children}</>;
}
