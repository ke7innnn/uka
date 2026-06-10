"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

import { PROJECTS_DATA } from "@/lib/projectsData";

const images = PROJECTS_DATA.filter(p => !p.isComingSoon).map(p => p.heroImage);

// Full-screen blast positions for desktop
const blastPositions = [
  { x: -370, y: -160, rotate: -18 },
  { x:   20, y: -200, rotate:   8 },
  { x:  340, y: -140, rotate:  16 },
  { x: -330, y:  170, rotate:  14 },
  { x:   40, y:  200, rotate:  -6 },
  { x:  340, y:  150, rotate: -20 },
  { x: -160, y:   -5, rotate:  10 },
];

export default function InteractiveCards() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Drag constraints: wider on mobile so cards can be thrown across a 6-inch screen
  const dragConstraints = isMobile
    ? { left: -160, right: 160, top: -260, bottom: 260 }
    : { left: -350, right: 350, top: -220, bottom: 220 };

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (!containerRef.current) return;

    const cards = containerRef.current.querySelectorAll<HTMLElement>(".card-wrapper");

    gsap.set(cards, { opacity: 0, scale: 0.05, x: 0, y: 0, rotate: 0 });

    const mobile = window.innerWidth < 768;
    // Mobile scale factor: 0.65 spreads cards well across a 360-390px wide screen
    const scaleFactor = mobile ? 0.65 : 1;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 65%",
        end: "center center",
        scrub: 3.5,
      },
    });

    tl.to(cards, { opacity: 1, scale: 0.95, duration: 0.3, stagger: 0, ease: "power2.in" });

    tl.to(cards, {
      x: (i) => blastPositions[i % blastPositions.length].x * scaleFactor,
      y: (i) => blastPositions[i % blastPositions.length].y * scaleFactor,
      rotate: (i) => blastPositions[i % blastPositions.length].rotate,
      scale: 1,
      stagger: 0.08,
      ease: "power3.out",
      duration: 0.7,
    });

    return () => { tl.kill(); };
  }, []);

  return (
    <div
      ref={containerRef}
      className="horizontal-section w-full min-h-screen flex-shrink-0 relative bg-black flex items-center justify-center overflow-hidden"
    >
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        {images.map((src, i) => (
          <div key={i} className="card-wrapper absolute" style={{ zIndex: i }}>
            <motion.div
              drag
              dragConstraints={dragConstraints}
              dragElastic={0.12}
              whileDrag={{ scale: 1.08, cursor: "grabbing", zIndex: 50 }}
              whileHover={{ cursor: "grab", scale: 1.04, zIndex: 40 }}
              // Bigger cards on mobile: 36×52 instead of 28×40
              className="w-36 h-52 md:w-52 md:h-72 shadow-2xl rounded-2xl overflow-hidden bg-gray-900 border border-white/20 relative"
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
