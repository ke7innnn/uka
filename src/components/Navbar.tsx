"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLenis } from "lenis/react";

const navLinks = [
  { id: "intro", num: "", title: "Home" },
  { id: "concert-organist", num: "1.", title: "The Architect" },
  { id: "recording-artist", num: "2.", title: "Architect" },
  { id: "titular-organist", num: "3.", title: "Projects" },
  { id: "organ-professor", num: "4.", title: "About Umesh Kekre" },
  { id: "author-composer", num: "5.", title: "Architect & Designer" },
  { id: "goodies-contact", num: "6.", title: "Resources & Contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const lenis = useLenis();

  const handleNavClick = (id: string) => {
    setIsOpen(false);
    
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        lenis?.scrollTo(el, { duration: 1.5, offset: 0 });
      }
    }, 500);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-8 right-8 z-50 text-white font-sans text-sm uppercase tracking-widest hover:opacity-70 transition-opacity"
      >
        Menu
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 z-[60] bg-black text-white flex flex-col justify-center px-12 md:px-32"
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-8 right-8 text-sm uppercase tracking-widest hover:opacity-70 transition-opacity"
            >
              Close
            </button>

            <ul className="flex flex-col gap-6 md:gap-10">
              {navLinks.map((link, i) => (
                <div key={link.id} className="overflow-hidden">
                  <motion.li
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{
                      duration: 0.8,
                      ease: [0.76, 0, 0.24, 1],
                      delay: isOpen ? 0.4 + i * 0.05 : 0,
                    }}
                    className="flex items-baseline gap-4 cursor-pointer group"
                    onClick={() => handleNavClick(link.id)}
                  >
                    <span className="text-sm md:text-lg font-sans opacity-50 group-hover:opacity-100 transition-opacity">
                      {link.num}
                    </span>
                    <span className="font-serif text-4xl md:text-6xl group-hover:ml-4 transition-all duration-300">
                      {link.title}
                    </span>
                  </motion.li>
                </div>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
