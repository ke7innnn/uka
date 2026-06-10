"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import ParallaxImage from "../ParallaxImage";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.032,
    }
  }
};

const wordVariants = {
  hidden: {
    opacity: 0,
    y: 18,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.25, 1, 0.5, 1] as const,
    }
  }
};

export default function AuthorComposer() {
  const words = "Architect and Designer".split(" ");
  const containerRef = useRef<HTMLDivElement>(null);

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
      stagger: 0.05,
      ease: "power2.out"
    });

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <div id="author-composer" ref={containerRef} className="horizontal-section w-screen min-h-screen h-auto md:h-screen flex-shrink-0 relative flex flex-col md:flex-row bg-black text-white py-12 md:py-0">
      {/* Floating Rotating Circle SVG */}
      <motion.img
        src="https://benjaminrighetti.netlify.app/img/cercle.svg"
        alt="Circle decoration"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
        className="absolute top-[10%] left-[45%] w-32 h-32 md:w-64 md:h-64 invert opacity-20 z-0 mix-blend-difference pointer-events-none hidden md:block"
      />

      <div className="w-full md:flex-1 flex flex-col justify-center px-6 md:pl-32 md:pr-16 z-10 py-8 md:py-0">
        <div className="mb-12 overflow-visible flex flex-wrap gap-x-4 md:gap-x-6 gap-y-3">
          {words.map((word, wordIdx) => (
            <span key={wordIdx} className="inline-block whitespace-nowrap">
              {word.split("").map((char, charIdx) => (
                <span
                  key={charIdx}
                  className="jumble-letter font-serif text-4xl md:text-7xl tracking-[0.05em] md:tracking-[0.1em] uppercase inline-block"
                >
                  {char}
                </span>
              ))}
            </span>
          ))}
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={containerVariants}
          className="max-w-xl"
        >
          <p className="font-serif italic text-xl md:text-3xl text-white mb-2 leading-snug">
            &ldquo;
            {"Humble beginnings and proud endings!".split(" ").map((word, wi) => (
              <motion.span
                key={wi}
                variants={wordVariants}
                whileHover={{ y: -4, color: "#e2c97e", transition: { duration: 0.4 } }}
                className="inline-block mr-[0.22em] cursor-default"
              >
                {word}
              </motion.span>
            ))}
            &rdquo;
          </p>



        </motion.div>
      </div>

      <div className="w-full md:flex-1 flex flex-col justify-center px-6 md:pr-32 md:pl-16 relative mt-12 md:mt-0 z-10 py-8 md:py-0">
        <div className="w-full max-w-[280px] md:max-w-md aspect-[3/4] relative overflow-hidden mb-8 self-center md:self-auto">
          <ParallaxImage src="/right of architectre designer/Architecture.jpeg" alt="Architect Umesh Kekre" className="w-full h-full" />
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="max-w-xl self-center md:self-auto text-center md:text-left"
        >
          <motion.p
            whileHover={{ y: -2, color: "#ffffff" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="font-serif italic text-lg md:text-2xl text-white mb-3 leading-relaxed cursor-default"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            &ldquo;Every client is a reminder that someone believes in your vision&rdquo;
          </motion.p>


        </motion.div>
      </div>
    </div>
  );
}
