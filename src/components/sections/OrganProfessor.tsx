"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import ParallaxImage from "../ParallaxImage";
import { motion } from "framer-motion";

export default function OrganProfessor() {
  const words = "About Umesh Kekre".split(" ");
  const containerRef = useRef<HTMLDivElement>(null);

  const teamMembers = [
    "Liasoning heads - Mr. Nihal Gharat (B.A.L.L.B) and Mr. Vijay Palkar (B.A.L.L.B)",
    "Structural engineering and Site Assistance - Mr. Crystal Nadar (B.E.Civil) and team",
    "3D visualisation team - Mr. Alpesh Bari and Mr. Chirag Moolya",
    "Designing heads and Co-Architect - Mr. Uday Arekar and Ms. Tanvi Vichare (B.Arch)",
  ];

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
    <div id="organ-professor" ref={containerRef} className="horizontal-section w-screen h-screen flex-shrink-0 relative flex flex-col md:flex-row bg-black text-white">
      <div className="w-full md:w-1/2 h-1/2 md:h-full relative overflow-hidden p-8 md:p-16 lg:p-24">
        <ParallaxImage src="/main umesh folder/umesh.jpeg" alt="Umesh Kekre" className="w-full h-full" />
      </div>

      <div className="w-full md:w-1/2 flex flex-col justify-center px-8 md:px-24 h-1/2 md:h-full z-10 bg-black/80 md:bg-transparent">
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

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="font-sans text-sm md:text-base leading-relaxed text-gray-300 max-w-xl mb-12"
        >
          Umesh Kekre is deeply committed to architectural education and serves as a guest critic and mentor at leading design schools. Having learned from master architects during his formative years, he believes it is essential to pass on his knowledge, passion for sustainable design, and practical expertise to the next generation of architects.
        </motion.p>

        <div className="flex flex-col md:flex-row gap-8 md:gap-16">
          <div>
            <h3 className="font-sans text-xs uppercase tracking-widest text-gray-500 mb-6 border-b border-gray-800 pb-2">Our Team</h3>
            <ul className="flex flex-col gap-3">
              {teamMembers.map((member, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="font-sans text-xs text-gray-300"
                >
                  {member}
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
