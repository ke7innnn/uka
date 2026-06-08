"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { PROJECTS_DATA, Project } from "@/lib/projectsData";

const quoteText = "Design begins when mind silences and spaces speak!!";
const quoteAuthor = "Umesh Kekre";

const bioText = "Umesh Kekre is a rising visionary architect. With over one decade of experience in shaping environments, he leads a practice dedicated to innovative, sustainable, and context-driven design. His portfolio spans residential, commercial, and institutional projects, each characterized by a profound respect for materials, natural light, and the human experience.";

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
    <div className="horizontal-section w-screen h-screen flex-shrink-0 bg-black flex flex-col relative overflow-hidden">
      {/* Bio + Quotes Content Row (Constrained to 64vh to leave gap above marquee) */}
      <div className="w-full h-[64vh] flex flex-col md:flex-row relative pt-8 md:pt-16">
        <div className="absolute top-1/2 -left-12 -translate-y-1/2 -rotate-90 text-sm tracking-widest uppercase opacity-30 font-sans hidden md:block whitespace-nowrap">
          In real life
        </div>

        {/* ── Left: bio ── */}
        <div className="flex-1 flex flex-col justify-center px-8 md:px-32 py-4 max-w-3xl">
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={containerVariants}
            className="text-lg md:text-2xl leading-relaxed text-gray-300"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            {bioText.split(" ").map((word, i) => (
              <motion.span
                key={i}
                variants={wordVariants}
                whileHover={{ y: -3, color: "#e2c97e", transition: { duration: 0.4 } }}
                className="inline-block mr-[0.25em] cursor-default"
              >
                {word}
              </motion.span>
            ))}
          </motion.p>
        </div>

        {/* ── Right: quotes ── */}
        <div className="flex-1 flex flex-col justify-center px-8 md:px-32 pb-4 md:pb-0 max-w-3xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={containerVariants}
            className="flex flex-col"
          >
            <p className="font-serif italic text-xl md:text-3xl text-white mb-2 leading-snug">
              &ldquo;
              {quoteText.split(" ").map((word, wi) => (
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
            <motion.p
              variants={wordVariants}
              className="font-sans text-xs uppercase tracking-widest text-gray-500 transition-all duration-300 hover:tracking-[0.25em] hover:text-[#e2c97e] cursor-default w-fit"
            >
              — {quoteAuthor}
            </motion.p>
          </motion.div>
        </div>
      </div>

      {/* Subtle marquee helper prompt */}
      <div className="absolute bottom-[21vh] md:bottom-[25vh] left-8 z-20 flex items-center gap-3">
        <span className="text-[9px] md:text-[10px] font-sans tracking-[0.35em] uppercase text-white/40">
          Interactive Gallery
        </span>
        <div className="w-8 h-[1px] bg-white/20" />
        <span className="text-[8px] md:text-[9px] font-sans tracking-[0.25em] uppercase text-[#F59E0B]/60">
          Click to inspect
        </span>
      </div>

      {/* Marquee Strip (Absolute positioned with bottom offsets to leave margin gap below) */}
      <div className="absolute bottom-6 md:bottom-10 left-0 w-full h-[20vh] md:h-[24vh] overflow-hidden flex bg-black z-20">
        <div className="animate-marquee flex h-full min-w-max">
          {[...activeProjects, ...activeProjects].map((p, i) => (
            <div 
              key={i} 
              onClick={() => setBlastedProject(p)}
              className="h-full aspect-[4/3] relative border-r-4 border-black shrink-0 grayscale hover:grayscale-0 transition-all duration-500 cursor-pointer overflow-hidden group"
            >
              {/* Subtle dark tint overlay that fades out on hover */}
              <div className="absolute inset-0 bg-black/25 group-hover:bg-transparent transition-colors duration-500 z-10" />
              
              <Image 
                src={p.heroImage} 
                alt={p.title} 
                fill 
                unoptimized 
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105" 
              />
              
              {/* Subtle gold line on hover at the bottom of the card */}
              <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#F59E0B] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left z-20" />
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
