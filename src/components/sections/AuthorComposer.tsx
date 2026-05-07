"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import ParallaxImage from "../ParallaxImage";
import { motion } from "framer-motion";

export default function AuthorComposer() {
  const title = "Architect and Designer".split("");
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
    <div id="author-composer" ref={containerRef} className="horizontal-section w-screen h-screen flex-shrink-0 relative flex flex-col md:flex-row bg-black text-white">
      <div className="absolute top-8 left-8 text-white/50 font-sans tracking-widest text-sm z-10 hidden md:block">
        5.
      </div>

      {/* Floating Rotating Circle SVG */}
      <motion.img
        src="https://benjaminrighetti.netlify.app/img/cercle.svg"
        alt="Circle decoration"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
        className="absolute top-[10%] left-[45%] w-32 h-32 md:w-64 md:h-64 invert opacity-20 z-0 mix-blend-difference pointer-events-none"
      />

      <div className="flex-1 flex flex-col justify-center px-8 md:pl-32 md:pr-16 z-10">
        <div className="mb-12 overflow-visible flex flex-wrap gap-x-2 md:gap-x-4">
          {title.map((char, i) => (
            <span
              key={i}
              className="jumble-letter font-serif text-4xl md:text-7xl tracking-[0.2em] md:tracking-[0.4em] uppercase inline-block"
            >
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="max-w-xl"
        >
          <p className="font-sans text-sm md:text-base leading-relaxed text-gray-300 mb-8 italic">
            &quot;Architecture should speak of its time and place, but yearn for timelessness.&quot; — Frank Gehry. A principle that guides my writing and discourse on the built environment.
          </p>
          <a
            href="#"
            className="font-sans text-xs uppercase tracking-widest border-b border-white/30 pb-1 hover:border-white transition-colors"
          >
            Read Articles →
          </a>
        </motion.div>
      </div>

      <div className="flex-1 flex flex-col justify-center px-8 md:pr-32 md:pl-16 relative mt-12 md:mt-0 z-10">
        <div className="w-full max-w-md aspect-[3/4] relative overflow-hidden mb-12 self-end md:self-auto">
          <ParallaxImage src="/right of architectre designer/Architecture.jpeg" alt="Architect Umesh Kekre" className="w-full h-full" />
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="max-w-xl self-end md:self-auto"
        >
          <p className="font-sans text-sm md:text-base leading-relaxed text-gray-300 mb-8">
            As an architectural thinker, Umesh Kekre shares his research and design philosophies freely through essays and open-source design modules. He believes that good design principles should be accessible to everyone.
          </p>
          <a
            href="#"
            className="font-sans text-xs uppercase tracking-widest border-b border-white/30 pb-1 hover:border-white transition-colors"
          >
            Read Essays →
          </a>
        </motion.div>
      </div>
    </div>
  );
}
