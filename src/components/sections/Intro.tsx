"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { PROJECTS_DATA, Project } from "@/lib/projectsData";

const quotes = [
  { text: "A master of spatial harmony and sustainable design.", author: "Architectural Digest" },
  { text: "His spaces don't just exist; they breathe and evolve with their inhabitants.", author: "Design Today" },
  { text: "An immensely talented architect reshaping modern urban landscapes.", author: "The Blueprint" },
];

const bioText = "Umesh Kekre is a visionary architect and principal designer at Umesh Kekre & Associates. With over two decades of experience in shaping environments, he leads a practice dedicated to innovative, sustainable, and context-driven design. His portfolio spans residential, commercial, and institutional projects, each characterized by a profound respect for materials, natural light, and the human experience.";

// Target coordinates for blasting 3 cards from the center stack
const blastPositions3 = [
  { x: -280, y: -40, rotate: -12 },  // Left card
  { x: 0,    y: -80,  rotate: 4 },    // Center card
  { x: 280,  y: -40,  rotate: 12 },   // Right card
];

export default function Intro() {
  const [blastedProject, setBlastedProject] = useState<Project | null>(null);
  
  const activeProjects = PROJECTS_DATA.filter(p => !p.isComingSoon);

  // Take up to 3 images from the clicked project to show in the blast
  const blastImages = blastedProject 
    ? [
        blastedProject.heroImage,
        blastedProject.images[1] || blastedProject.heroImage,
        blastedProject.images[2] || blastedProject.heroImage
      ]
    : [];

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
          {[...activeProjects, ...activeProjects].map((p, i) => (
            <div 
              key={i} 
              onClick={() => setBlastedProject(p)}
              className="h-full aspect-[4/3] relative border-r-4 border-black shrink-0 grayscale hover:grayscale-0 transition-all duration-500 cursor-pointer"
            >
              <Image src={p.heroImage} alt={p.title} fill unoptimized className="object-cover" />
            </div>
          ))}
        </div>
      </div>

      {/* ── 3-CARD PROJECT PHOTO BLAST OVERLAY ── */}
      <AnimatePresence>
        {blastedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center backdrop-blur-md"
            onClick={() => setBlastedProject(null)} // Click background to close
          >
            {/* Close Button */}
            <button
              onClick={() => setBlastedProject(null)}
              className="absolute top-8 right-8 text-white/50 hover:text-white text-xs uppercase tracking-widest font-sans transition-colors z-[120] border border-white/20 rounded-full px-4 py-2 bg-black/40"
            >
              Close [X]
            </button>

            {/* Floating Title of the Blasted Project */}
            <div className="absolute top-20 left-1/2 -translate-x-1/2 text-center pointer-events-none z-[110] w-full px-4">
              <h2 className="font-serif text-3xl md:text-5xl text-white mb-2 drop-shadow-md">
                {blastedProject.title}
              </h2>
              <p className="font-sans text-[10px] uppercase tracking-widest text-[#F59E0B]">
                Drag cards to explore  ·  Click anywhere to exit
              </p>
            </div>

            {/* Stacked Cards Container */}
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
              {blastImages.map((src, idx) => {
                const pos = blastPositions3[idx];
                return (
                  <motion.div
                    key={`${blastedProject.id}-card-${idx}`}
                    initial={{ opacity: 0, scale: 0.1, x: 0, y: 0, rotate: 0 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      x: pos.x,
                      y: pos.y,
                      rotate: pos.rotate,
                      transition: {
                        delay: idx * 0.15,
                        type: "spring",
                        stiffness: 85,
                        damping: 13,
                      },
                    }}
                    exit={{ opacity: 0, scale: 0.05, x: 0, y: 0, rotate: 0 }}
                    drag
                    dragConstraints={{ left: -450, right: 450, top: -250, bottom: 250 }}
                    dragElastic={0.12}
                    whileDrag={{ scale: 1.08, zIndex: 150, cursor: "grabbing" }}
                    whileHover={{ scale: 1.04, cursor: "grab" }}
                    onClick={(e) => e.stopPropagation()} // Prevent background closing when clicking a card
                    className="absolute w-44 h-56 md:w-56 md:h-72 shadow-2xl rounded-2xl overflow-hidden bg-gray-900 border border-white/20"
                    style={{ zIndex: idx + 10 }}
                  >
                    <Image
                      src={src}
                      alt={`${blastedProject.title} image ${idx + 1}`}
                      fill
                      unoptimized
                      className="object-cover pointer-events-none"
                    />
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
