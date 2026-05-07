"use client";

import { motion } from "framer-motion";

export default function Hero() {
  const line1 = "UMESH KEKRE".split("");
  const line2 = "& ASSOCIATES".split("");

  const ctn = {
    hidden: { opacity: 0 },
    show:   { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.3 } },
  };
  const itm = {
    hidden: { opacity: 0 as number, y: 50 as number },
    show:   { opacity: 1 as number, y: 0 as number, transition: { duration: 0.8, ease: "easeOut" as const } },
  };

  return (
    <div
      id="intro"
      className="relative w-screen h-screen bg-black flex items-center justify-center overflow-hidden"
    >
      {/* ── hero text ── */}
      <div className="relative z-10 w-full flex flex-col items-center justify-center pointer-events-none px-4">
        <motion.div variants={ctn} initial="hidden" animate="show" className="text-center w-full">
          <div className="flex justify-center overflow-hidden w-full">
            {line1.map((char, i) => (
              <motion.span key={i} variants={itm}
                className="font-serif text-[8vw] md:text-[10vw] leading-[0.8] tracking-tighter">
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
          </div>
          <div className="flex justify-center overflow-hidden w-full mt-4">
            {line2.map((char, i) => (
              <motion.span key={i} variants={itm}
                className="font-serif text-[8vw] md:text-[10vw] leading-[0.8] tracking-tighter">
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 0.8 }}
          transition={{ duration: 1.5, delay: 2 }}
          className="font-sans uppercase text-sm md:text-xl mt-8 md:mt-12"
        >
          Architect
        </motion.p>
      </div>

      {/* ── scroll indicator ── */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2.5 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 text-sm font-sans uppercase tracking-widest"
      >
        <span>Scroll</span>
        <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
          ↓
        </motion.div>
      </motion.div>
    </div>
  );
}
