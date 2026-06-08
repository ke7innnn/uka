"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

import { PROJECTS_DATA } from "@/lib/projectsData";

const images = PROJECTS_DATA.filter(p => !p.isComingSoon).map(p => p.heroImage);

// Positions tuned to stay well inside the viewport on all screens
const blastPositions = [
  { x: -370, y: -160, rotate: -18 }, // top-left
  { x:   20, y: -200, rotate:   8 }, // top-center
  { x:  340, y: -140, rotate:  16 }, // top-right
  { x: -330, y:  170, rotate:  14 }, // bottom-left
  { x:   40, y:  200, rotate:  -6 }, // bottom-center
  { x:  340, y:  150, rotate: -20 }, // bottom-right
  { x: -160, y:   -5, rotate:  10 }, // mid-left
];

export default function InteractiveCards() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (!containerRef.current) return;

    const cards = containerRef.current.querySelectorAll<HTMLElement>(".card-wrapper");

    // Start: all cards stacked at dead-center, invisible & micro-scaled
    gsap.set(cards, {
      opacity: 0,
      scale: 0.05,
      x: 0,
      y: 0,
      rotate: 0,
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 65%",
        end: "center center",
        scrub: 3.5, // slow, silky scrub
      },
    });

    // Phase 1 (~30% of scroll): cards emerge stacked at center
    tl.to(cards, {
      opacity: 1,
      scale: 0.95,
      duration: 0.3,
      stagger: 0,
      ease: "power2.in",
    });

    // Phase 2 (~70% of scroll): slow, deliberate throw outward
    tl.to(
      cards,
      {
        x: (i) => blastPositions[i % blastPositions.length].x,
        y: (i) => blastPositions[i % blastPositions.length].y,
        rotate: (i) => blastPositions[i % blastPositions.length].rotate,
        scale: 1,
        stagger: 0.08, // each card leaves slightly after the last
        ease: "power3.out",
        duration: 0.7,
      },
    );

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="horizontal-section w-full min-h-screen flex-shrink-0 relative bg-black flex items-center justify-center overflow-hidden"
    >
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        {images.map((src, i) => (
          <div
            key={i}
            className="card-wrapper absolute"
            style={{ zIndex: i }}
          >
            <motion.div
              drag
              dragConstraints={{ left: -350, right: 350, top: -220, bottom: 220 }}
              dragElastic={0.1}
              whileDrag={{ scale: 1.08, cursor: "grabbing", zIndex: 50 }}
              whileHover={{ cursor: "grab", scale: 1.04, zIndex: 40 }}
              className="w-40 h-56 md:w-52 md:h-72 shadow-2xl rounded-2xl overflow-hidden bg-gray-900 border border-white/20 relative"
            >
              <Image
                src={src}
                alt="Draggable card"
                fill
                className="object-cover pointer-events-none"
                unoptimized
              />
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
}
