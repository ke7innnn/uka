"use client";

import { motion } from "framer-motion";

interface ArchitecturalTransitionProps {
  mode: "enter" | "exit";
  title: string;
}

export default function ArchitecturalTransition({ mode, title }: ArchitecturalTransitionProps) {
  // 5 Vertical Louver Panels
  const cols = [0, 1, 2, 3, 4];
  
  // Alternating directions: even columns slide from top, odd columns slide from bottom
  const getInitialY = (i: number) => {
    if (mode === "exit") {
      return i % 2 === 0 ? "-100%" : "100%";
    }
    return "0%"; // Starts fully covered on enter mode
  };

  const getTargetY = (i: number) => {
    if (mode === "exit") {
      return "0%"; // Covers screen on exit mode
    }
    return i % 2 === 0 ? "-100%" : "100%"; // Slides out to uncover screen
  };

  return (
    <div 
      className="fixed inset-0 z-[999] pointer-events-none w-screen h-screen overflow-hidden"
      style={{ mixBlendMode: "normal" }}
    >
      {/* 5 Vertical Louver Panels */}
      {cols.map((i) => (
        <motion.div
          key={i}
          initial={{ y: getInitialY(i) }}
          animate={{ y: getTargetY(i) }}
          transition={{
            duration: 0.65,
            delay: i * 0.05,
            ease: [0.76, 0, 0.24, 1],
          }}
          className="absolute top-0 h-full bg-[#fbfbfb] shadow-[0_0_40px_rgba(0,0,0,0.08)]"
          style={{
            left: `${i * 20}vw`,
            width: "20.5vw", // Overlap slightly to prevent subpixel gaps
            borderRight: "1px solid rgba(245, 158, 11, 0.08)", // subtle warm amber drafting line
          }}
        />
      ))}

      {/* Central Content (Project Title & Info) */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-[1000] pointer-events-none">
        <motion.div
          initial={{ 
            opacity: mode === "exit" ? 0 : 1, 
            y: mode === "exit" ? 30 : 0 
          }}
          animate={{ 
            opacity: mode === "exit" ? 1 : 0, 
            y: mode === "exit" ? 0 : -30 
          }}
          transition={{ 
            duration: 0.45, 
            delay: mode === "exit" ? 0.35 : 0.0,
            ease: [0.25, 1, 0.5, 1]
          }}
          className="flex flex-col items-center text-center px-4"
        >
          {/* Subtle architectural prefix */}
          <span className="text-[10px] md:text-[11px] font-sans tracking-[0.45em] uppercase text-black/40 mb-3">
            UKA ARCHITECTS
          </span>
          
          {/* Project Title in premium serif */}
          <h2 
            className="text-4xl md:text-5xl lg:text-6xl font-light tracking-[0.25em] uppercase text-black font-serif my-2 max-w-4xl leading-tight"
            style={{ fontFamily: "var(--font-cormorant), serif" }}
          >
            {title}
          </h2>
          
          {/* Gold drafting underline */}
          <motion.div 
            initial={{ scaleX: mode === "exit" ? 0 : 1 }}
            animate={{ scaleX: mode === "exit" ? 1 : 0 }}
            transition={{ 
              duration: 0.55, 
              delay: mode === "exit" ? 0.45 : 0,
              ease: "easeInOut"
            }}
            className="w-28 h-[1px] bg-[#F59E0B] mt-5 origin-center"
          />
        </motion.div>
      </div>
    </div>
  );
}
