"use client";

import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function HorizontalScroller({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isMobile || !containerRef.current || !sectionsRef.current) {
      ScrollTrigger.getAll().forEach((st) => st.kill());
      gsap.set(sectionsRef.current, { clearProps: "all" });
      return;
    }

    const sections = gsap.utils.toArray(".horizontal-section") as HTMLElement[];
    const totalSections = sections.length;

    const scrollTween = gsap.to(sectionsRef.current, {
      xPercent: -100 * (totalSections - 1),
      ease: "none",
      scrollTrigger: {
        trigger: containerRef.current,
        pin: true,
        scrub: 1,
        snap: 1 / (totalSections - 1),
        end: () => "+=" + containerRef.current!.offsetWidth * (totalSections - 1),
      },
    });

    return () => {
      scrollTween.kill();
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, [isMobile]);

  if (isMobile) {
    return (
      <div className="w-full flex flex-col">
        <div className="bg-white text-black text-center text-xs py-2 font-sans sticky top-0 z-40">
          Flip your browser horizontally for the full experience
        </div>
        {children}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-screen overflow-hidden bg-black relative">
      <div ref={sectionsRef} className="flex h-full w-[max-content]">
        {children}
      </div>
    </div>
  );
}
