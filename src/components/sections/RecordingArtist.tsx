"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

export default function ArchitectGrid() {
  const containerRef = useRef<HTMLDivElement>(null);
  const lettersRef = useRef<HTMLSpanElement[]>([]);
  
  const word = "ARCHITECT".split("");

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    if (!containerRef.current || lettersRef.current.length === 0) return;

    // Use deterministic random values to avoid hydration mismatch
    lettersRef.current.forEach((letter, i) => {
      const randomX = (i % 3 - 1) * 500 + (i * 50 % 200) * (i % 2 === 0 ? 1 : -1);
      const randomY = (i % 2 - 0.5) * 800 + (i * 30 % 200) * (i % 3 === 0 ? 1 : -1);
      const randomRotate = (i * 45) % 360 - 180;
      const randomScale = (i % 3) * 0.5 + 0.5;

      gsap.set(letter, {
        x: randomX,
        y: randomY,
        rotation: randomRotate,
        scale: randomScale,
        opacity: 0,
      });
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top bottom",
        end: "center center",
        scrub: 1,
      }
    });

    tl.to(lettersRef.current, {
      x: 0,
      y: 0,
      rotation: 0,
      scale: 1,
      opacity: 1,
      stagger: {
        amount: 0.5,
        from: "random"
      },
      ease: "power2.out"
    });

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <div 
      id="recording-artist" 
      ref={containerRef}
      className="horizontal-section w-full min-h-screen flex-shrink-0 relative flex items-center justify-center bg-black text-white overflow-hidden"
    >
      <div className="absolute top-8 left-8 text-white/50 font-sans tracking-widest text-sm z-10">
        2.
      </div>

      <div className="z-10 grid grid-cols-3 gap-x-12 gap-y-8 md:gap-x-24 md:gap-y-16">
        {word.map((char, i) => (
          <span
            key={i}
            ref={(el) => {
              if (el) lettersRef.current[i] = el;
            }}
            className="font-serif text-7xl md:text-9xl lg:text-[12rem] uppercase inline-block text-center tracking-tight mix-blend-difference"
          >
            {char}
          </span>
        ))}
      </div>
    </div>
  );
}
