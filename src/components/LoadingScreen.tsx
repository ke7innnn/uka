"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoadingScreen() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Lock scroll immediately while loader is showing
    document.body.style.overflow = "hidden";

    // Fade out starts at 3.2s, takes 0.9s — unlock scroll after full fade (4.1s)
    const hideTimer = setTimeout(() => setVisible(false), 3200);
    const unlockTimer = setTimeout(() => {
      document.body.style.overflow = "";
    }, 4100); // 3200ms animation + 900ms fade

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
          <div className="flex items-end gap-6 md:gap-10">
            {letters.map(({ char, delay }) => (
              <motion.span
                key={char}
                initial={{ y: -300, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay, duration: 0.65, ease: [0.2, 0, 0.4, 1] }}
                className="font-serif text-[22vw] md:text-[18vw] leading-none text-white uppercase select-none"
                style={{ fontFamily: "var(--font-cormorant), serif" }}
              >
                {char}
              </motion.span>
            ))}
          </div>

          {/* subtle thin horizontal line that draws under the letters */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 2.0, duration: 0.6, ease: "easeOut" }}
            style={{ originX: 0 }}
            className="absolute bottom-[38%] left-1/2 -translate-x-1/2 w-[32vw] md:w-[24vw] h-[1px] bg-white/30"
          />

          {/* UKA & ASSOCIATES sub-label fades in after letters settle */}
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.1, duration: 0.7, ease: "easeOut" }}
            className="absolute bottom-[34%] font-sans text-[2.5vw] md:text-[1.1vw] uppercase tracking-[0.4em] text-white/50"
          >
            Umesh Kekre &amp; Associates
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
