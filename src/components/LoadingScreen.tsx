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
    document.body.style.overflow = "hidden";
 
    const hideTimer = setTimeout(() => setVisible(false), 6500);
    const unlockTimer = setTimeout(() => {
      document.body.style.overflow = "";
    }, 7400);
 
    if (penRef.current && lineRef.current && glowLineRef.current) {
      const tl = gsap.timeline({ delay: 0.5 });

      // Use stable vw-based offsets instead of vh to ensure the pen tip aligns perfectly
      // across all mobile/desktop aspect ratios without drifting.
      const isMobile = window.innerWidth < 768;
      const penTop = isMobile
        ? "calc(100% + 24.6vw)"
        : "calc(100% + 19.4vw)";

      tl.set(penRef.current, {
        left: "-17%",
        top: penTop,
        yPercent: -100, y: 0,
        rotation: -18,
        opacity: 0,
      });
 
      tl.to(penRef.current, { opacity: 1, duration: 0.2, ease: "power1.out" });
 
      tl.to(penRef.current, {
        left: "83%",
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
 
      tl.to({}, { duration: 0.2 });
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
          className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center"
        >
          <div ref={containerRef} className="flex items-end gap-[5vw] md:gap-[2vw] relative">
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
              <line
                x1="0" y1="50%" x2="100%" y2="50%"
                stroke="#ffffff" strokeWidth="6" strokeOpacity="0.15"
                strokeLinecap="round" pathLength="100"
                strokeDasharray="100" strokeDashoffset="100"
                ref={glowLineRef}
              />
              <line
                x1="0" y1="50%" x2="100%" y2="50%"
                stroke="#ffffff" strokeWidth="2.5"
                strokeLinecap="round" pathLength="100"
                strokeDasharray="100" strokeDashoffset="100"
                ref={lineRef}
              />
            </svg>
 
            {letters.map(({ char, delay }) => (
              <motion.span
                key={char}
                initial={{ y: -300, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay, duration: 0.65, ease: [0.2, 0, 0.4, 1] }}
                className="font-serif text-[23vw] md:text-[18vw] leading-none text-white uppercase select-none relative z-[3]"
                style={{ fontFamily: "var(--font-cormorant), serif" }}
              >
                {char}
              </motion.span>
            ))}
 
            <img
              ref={penRef}
              src="/pen/pen.png"
              alt="Pen"
              className="absolute h-[56vw] md:h-[44vw] w-auto object-contain drop-shadow-xl z-10"
              style={{
                transformOrigin: "left bottom",
                opacity: 0,
                pointerEvents: "none",
              }}
            />
          </div>
 
          {/* Sub-label */}
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.1, duration: 0.7, ease: "easeOut" }}
            className="font-sans text-[3.2vw] md:text-[1.1vw] uppercase tracking-[0.38em] text-white/50 whitespace-nowrap mt-[5vw] md:mt-[2.5vw]"
          >
            Umesh Kekre &amp; Associates
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
