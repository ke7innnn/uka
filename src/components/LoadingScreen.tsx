"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
 
export default function LoadingScreen() {
  const [visible, setVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const penRef = useRef<HTMLImageElement>(null);
  const lineRef = useRef<SVGLineElement>(null);
  const glowLineRef = useRef<SVGLineElement>(null);
 
  useEffect(() => {
    // Lock scroll immediately while loader is showing
    document.body.style.overflow = "hidden";
 
    // Fade out starts at 6.5s (3.0s pen completion + 3.5s hold), takes 0.9s — unlock scroll after full fade (7.4s)
    const hideTimer = setTimeout(() => setVisible(false), 6500);
    const unlockTimer = setTimeout(() => {
      document.body.style.overflow = "";
    }, 7400); // 6500ms animation + 900ms fade
 
    // GSAP Underline & Pen Animation Timeline
    if (penRef.current && lineRef.current && glowLineRef.current) {
      const tl = gsap.timeline({ delay: 0.5 });
 
      // 1. Position pen at the far left end of the underline
      // and set rotation to a natural writing angle (-18 degrees)
      tl.set(penRef.current, {
        left: "0%",
        top: "100%",
        yPercent: -100, y: "0.95vw", // perfectly align nib with the underline
        rotation: -18,
        opacity: 0,
      });
 
      // Fade the pen in at the start of the line
      tl.to(penRef.current, {
        opacity: 1,
        duration: 0.2,
        ease: "power1.out",
      });
 
      // 2. Pen travels right + line draws (perfectly in sync)
      tl.to(penRef.current, {
        left: "100%",
        duration: 1.3,
        ease: "power1.inOut",
      }, "draw");
 
      tl.to(lineRef.current, {
        strokeDashoffset: 0,
        duration: 1.3,
        ease: "power1.inOut",
      }, "draw");
 
      tl.to(glowLineRef.current, {
        strokeDashoffset: 0,
        duration: 1.3,
        ease: "power1.inOut",
      }, "draw");
 
      // 3. Brief pause at the end of the line
      tl.to({}, { duration: 0.2 });
 
      // 4. Pen lifts (Y translation moves up ~8px) and rotates slightly back
      tl.to(penRef.current, {
        yPercent: -100, y: "0.58vw",
        rotation: -10,
        duration: 0.15,
        ease: "power1.out",
      });
 
      // 5. Pen glides back to its original resting position top-right of UKA letters
      tl.to(penRef.current, {
        left: "80%",
        top: "100%",
        x: "0",
        yPercent: -100, y: "0vw",
        rotation: 0,
        duration: 0.6,
        ease: "power2.inOut",
      });
    }
 
    return () => {
      clearTimeout(hideTimer);
      clearTimeout(unlockTimer);
      document.body.style.overflow = "";
    };
  }, []);
 
  const letters = [
    { char: "U", delay: 0 },
    { char: "K", delay: 0.55 },
    { char: "A", delay: 1.1 },
  ];
 
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
        >
          <div ref={containerRef} className="flex items-end gap-[3vw] md:gap-[5vw] relative pb-[8vw] md:pb-[6vw]">
            {/* Underline SVG */}
            <svg
              className="absolute left-0 right-0 pointer-events-none -z-10 overflow-visible"
              style={{
                top: "100%",
                marginTop: "0.8vw",
                width: "100%",
                height: "0.3vw",
              }}
            >
              {/* Glow line */}
              <line
                x1="0"
                y1="50%"
                x2="100%"
                y2="50%"
                stroke="#ffffff"
                strokeWidth="6"
                strokeOpacity="0.15"
                strokeLinecap="round"
                pathLength="100"
                strokeDasharray="100"
                strokeDashoffset="100"
                ref={glowLineRef}
              />
              {/* Solid core line */}
              <line
                x1="0"
                y1="50%"
                x2="100%"
                y2="50%"
                stroke="#ffffff"
                strokeWidth="2.5"
                strokeLinecap="round"
                pathLength="100"
                strokeDasharray="100"
                strokeDashoffset="100"
                ref={lineRef}
              />
            </svg>
 
            {letters.map(({ char, delay }) => (
              <motion.span
                key={char}
                initial={{ y: -300, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay, duration: 0.65, ease: [0.2, 0, 0.4, 1] }}
                className="font-serif text-[18vw] md:text-[18vw] leading-none text-white uppercase select-none relative z-[3]"
                style={{ fontFamily: "var(--font-cormorant), serif" }}
              >
                {char}
              </motion.span>
            ))}
 
            {/* Fountain Pen */}
            <img
              ref={penRef}
              src="/pen/pen.png"
              alt="Pen"
              className="absolute h-[52vw] md:h-[44vw] w-auto object-contain drop-shadow-xl z-10"
              style={{
                transform: "translateY(-100%)",
                transformOrigin: "left bottom",
                opacity: 0,
                pointerEvents: "none",
              }}
            />

            {/* UKA & ASSOCIATES sub-label fades in after letters settle */}
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.1, duration: 0.7, ease: "easeOut" }}
              className="absolute left-1/2 -translate-x-1/2 top-[100%] mt-[6vw] md:mt-[4vw] font-sans text-[3.2vw] md:text-[1.1vw] uppercase tracking-[0.4em] text-white/50 whitespace-nowrap"
            >
              Umesh Kekre &amp; Associates
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
