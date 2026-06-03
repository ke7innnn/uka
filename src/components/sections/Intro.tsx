"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { PROJECTS_DATA } from "@/lib/projectsData";

const quotes = [
  { text: "A master of spatial harmony and sustainable design.", author: "Architectural Digest" },
  { text: "His spaces don't just exist; they breathe and evolve with their inhabitants.", author: "Design Today" },
  { text: "An immensely talented architect reshaping modern urban landscapes.", author: "The Blueprint" },
];

const bioText = "Umesh Kekre is a visionary architect and principal designer at Umesh Kekre & Associates. With over two decades of experience in shaping environments, he leads a practice dedicated to innovative, sustainable, and context-driven design. His portfolio spans residential, commercial, and institutional projects, each characterized by a profound respect for materials, natural light, and the human experience.";

export default function Intro() {
  const images = PROJECTS_DATA.filter(p => !p.isComingSoon).map(p => p.heroImage);

  return (
    <div className="horizontal-section w-full min-h-screen flex-shrink-0 bg-black flex flex-col md:flex-row relative pb-[calc(20vh+20px)] md:pb-[calc(30vh+20px)]">
      <div className="absolute top-1/2 -left-12 -translate-y-1/2 -rotate-90 text-sm tracking-widest uppercase opacity-30 font-sans hidden md:block whitespace-nowrap">
        In real life
      </div>

      {/* ── Left: bio ── */}
      <div className="flex-1 flex flex-col justify-center px-8 md:px-32 py-12 max-w-3xl">
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-lg md:text-2xl leading-relaxed text-gray-300"
          style={{ fontFamily: "var(--font-playfair), serif" }}
        >
          {bioText.split(" ").map((word, i) => (
            <span
              key={i}
              className="inline-block mr-[0.25em] transition-all duration-[400ms] ease-out hover:-translate-y-[3px] hover:text-[#e2c97e]"
            >
              {word}
            </span>
          ))}
        </motion.p>
      </div>

      {/* ── Right: quotes ── */}
      <div className="flex-1 flex flex-col justify-center px-8 md:px-20 gap-8 md:gap-16 pb-32 md:pb-0">
        {quotes.map((quote, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: i * 0.2 }}
            viewport={{ once: true }}
            className={`flex flex-col ${i === 1 ? "md:ml-20" : ""}`}
          >
            <p className="font-serif italic text-2xl md:text-4xl text-white mb-2 leading-snug">
              &quot;
              {quote.text.split(" ").map((word, wi) => (
                <span
                  key={wi}
                  className="inline-block mr-[0.22em] transition-all duration-[400ms] ease-out hover:-translate-y-[4px] hover:text-[#e2c97e]"
                >
                  {word}
                </span>
              ))}
              &quot;
            </p>
            <p className="font-sans text-xs uppercase tracking-widest text-gray-500 transition-all duration-300 hover:tracking-[0.25em] hover:text-[#e2c97e] cursor-default w-fit">
              — {quote.author}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Marquee Strip */}
      <div className="absolute bottom-0 left-0 w-full h-[20vh] md:h-[30vh] overflow-hidden flex bg-black z-20">
        <div className="animate-marquee flex h-full min-w-max">
          {[...images, ...images].map((src, i) => (
            <div key={i} className="h-full aspect-[4/3] relative border-r-4 border-black shrink-0 grayscale hover:grayscale-0 transition-all duration-500">
              <Image src={src} alt="Slider image" fill unoptimized className="object-cover" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
