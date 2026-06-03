"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

const organs = [
  {
    src: "/project left side images/proj1.jpeg",
    info: "Contemporary Urban Residence — Mumbai (2020)",
  },
  {
    src: "/project left side images/proj2.jpeg",
    info: "Sustainable Commercial Complex — Bangalore (2018)",
  },
  {
    src: "/project left side images/proj3.jpeg",
    info: "Minimalist Coastal Villa — Goa (2021)",
  },
  {
    src: "/project left side images/proj4.jpeg",
    info: "Heritage Restoration Project — Jaipur (2019)",
  },
];

export default function TitularOrganist() {
  const [selectedOrgan, setSelectedOrgan] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const title = "Projects by Umesh Kekre".split(" ");

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (!containerRef.current) return;
    
    const letters = containerRef.current.querySelectorAll('.jumble-letter');
    
    gsap.set(letters, {
      opacity: 0,
      x: () => (Math.random() - 0.5) * 400,
      y: () => (Math.random() - 0.5) * 400,
      rotation: () => (Math.random() - 0.5) * 180,
      scale: () => Math.random() + 0.5,
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 80%",
        end: "center center",
        scrub: 1,
      }
    });

    tl.to(letters, {
      opacity: 1,
      x: 0,
      y: 0,
      rotation: 0,
      scale: 1,
      stagger: 0.02,
      ease: "power2.out"
    });

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <div id="titular-organist" ref={containerRef} className="horizontal-section w-screen h-screen flex-shrink-0 relative flex flex-col md:flex-row bg-black text-white">
      <div className="absolute top-8 left-8 text-white/50 font-sans tracking-widest text-sm z-10">
        3.
      </div>

      <div className="flex-1 flex flex-col justify-center px-8 md:px-32 z-10">
        <h2 className="font-serif text-4xl md:text-7xl mb-12 max-w-xl leading-tight flex flex-wrap gap-x-2 md:gap-x-4">
          {title.map((word, wIdx) => (
            <span key={wIdx} className="inline-block whitespace-nowrap">
              {word.split("").map((char, cIdx) => (
                <span key={cIdx} className="jumble-letter inline-block">
                  {char}
                </span>
              ))}
            </span>
          ))}
        </h2>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          viewport={{ once: true }}
          className="self-start"
        >
          <Link
            href="/projects"
            className="font-sans text-xs uppercase tracking-widest border-b border-white/30 pb-1 hover:border-white transition-colors"
          >
            Visit project page of Umesh →
          </Link>
        </motion.div>
      </div>

      <div className="flex-1 grid grid-cols-2 grid-rows-2 h-1/2 md:h-full mt-12 md:mt-0">
        {organs.map((organ, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: i * 0.1 }}
            viewport={{ once: true }}
            className="relative w-full h-full cursor-pointer group overflow-hidden"
            onClick={() => setSelectedOrgan(organ.info)}
          >
            <Image
              src={organ.src}
              alt="Organ"
              fill
              unoptimized
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
              <span className="text-4xl text-white">→</span>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedOrgan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center px-8"
            onClick={() => setSelectedOrgan(null)}
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="text-center"
            >
              <h3 className="font-serif text-3xl md:text-5xl mb-8">{selectedOrgan}</h3>
              <button className="font-sans text-xs uppercase tracking-widest border border-white/50 rounded-full px-6 py-2 hover:bg-white hover:text-black transition-colors" onClick={() => setSelectedOrgan(null)}>
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
