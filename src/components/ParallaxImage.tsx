"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function ParallaxImage({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!containerRef.current || !imgRef.current) return;
    
    // As per user prompt exactly:
    // gsap.to(ref.current, { yPercent: -20, ease: "none", scrollTrigger: { trigger: ref.current, start: "top bottom", end: "bottom top", scrub: true }});
    // This provides vertical parallax even in horizontal scroll natively if we scroll vertically. 
    // In horizontal mode, the whole section is sliding sideways, but Lenis is scrolling down vertically. So yPercent actually works because the vertical scroll offset is still changing!

    const tween = gsap.to(imgRef.current, {
      yPercent: -20,
      ease: "none",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });

    return () => {
      tween.kill();
    };
  }, []);

  return (
    <div ref={containerRef} className={`overflow-hidden relative ${className}`}>
      <Image
        ref={imgRef}
        src={src}
        alt={alt}
        fill
        unoptimized
        className="object-cover scale-[1.2]"
      />
    </div>
  );
}
