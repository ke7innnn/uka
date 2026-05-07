"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import ParallaxImage from "../ParallaxImage";

const TOTAL_FRAMES = 213;

const frames = Array.from(
  { length: TOTAL_FRAMES },
  (_, i) =>
    `/scrollable evideo/sequence/ezgif-frame-${String(i + 1).padStart(3, "0")}.jpg`
);

const projects = [
  { date: "2023", name: "Project 1 — Mumbai Residence" },
  { date: "2022", name: "Project 2 — Bangalore Commercial" },
  { date: "2021", name: "Project 3 — Goa Coastal Villa" },
  { date: "2020", name: "Project 4 — Jaipur Heritage" },
  { date: "2019", name: "Project 5 — Delhi Office Tower" },
  { date: "2018", name: "Project 6 — Pune Township" },
];

export default function ConcertOrganist() {
  const sectionRef   = useRef<HTMLDivElement>(null);
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const frameRef     = useRef(0);
  const imagesRef    = useRef<HTMLImageElement[]>([]);
  const projectRefs  = useRef<HTMLLIElement[]>([]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const section = sectionRef.current;
    const canvas  = canvasRef.current;
    if (!section || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const setSize = () => {
      canvas.width  = canvas.offsetWidth  || window.innerWidth / 2;
      canvas.height = canvas.offsetHeight || window.innerHeight;
      draw(frameRef.current);
    };

    const draw = (idx: number) => {
      const img = imagesRef.current[idx];
      if (!img?.complete || !img.naturalWidth) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const s = Math.max(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight);
      const w = img.naturalWidth * s;
      const h = img.naturalHeight * s;
      ctx.drawImage(img, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
    };

    // Preload all frames
    imagesRef.current = frames.map((src, i) => {
      const img = new Image();
      img.src = src;
      img.onload = () => { if (i === 0) setSize(); };
      return img;
    });
    setTimeout(setSize, 150);

    // Pin & scrub — locked until video finishes AND all projects appear
    const SCROLL_PX = TOTAL_FRAMES * 9;

    ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: `+=${SCROLL_PX}`,
      pin: true,
      pinSpacing: true,
      scrub: 2,
      anticipatePin: 1,
      onUpdate(self) {
        // Draw video frame
        const idx = Math.min(
          Math.round(self.progress * (TOTAL_FRAMES - 1)),
          TOTAL_FRAMES - 1
        );
        if (idx !== frameRef.current) {
          frameRef.current = idx;
          draw(idx);
        }

        // Reveal projects sequentially through the scroll
        projectRefs.current.forEach((el, i) => {
          if (!el) return;
          const threshold = (i / projects.length) * 0.85; // spread across 85% of scroll
          if (self.progress >= threshold) {
            el.style.opacity   = "1";
            el.style.transform = "translateX(0px)";
          } else {
            el.style.opacity   = "0";
            el.style.transform = "translateX(40px)";
          }
        });
      },
    });

    window.addEventListener("resize", setSize);
    return () => {
      ScrollTrigger.getAll().forEach(st => st.kill());
      window.removeEventListener("resize", setSize);
    };
  }, []);

  return (
    <div
      id="concert-organist"
      ref={sectionRef}
      className="relative w-screen h-screen bg-black flex flex-col md:flex-row"
    >
      {/* ── Dark cinematic background (same as before) ── */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
        <ParallaxImage
          src="https://benjaminrighetti.netlify.app/img/orgue.jpg"
          alt="Background"
          className="w-full h-full"
        />
      </div>

      {/* ── section number ── */}
      <div className="absolute top-8 left-8 text-white/50 font-sans tracking-widest text-sm z-20">
        1.
      </div>

      {/* ══ LEFT: Scroll-driven video with decorative frame ══ */}
      <div className="relative z-10 w-full md:w-1/2 h-1/2 md:h-full flex items-center justify-center p-8 md:p-14">
        {/* Aspect-ratio locked frame wrapper — keeps original video proportions */}
        <div className="relative w-full" style={{ aspectRatio: "16 / 9", maxHeight: "100%" }}>
          {/* Decorative frame wrapper */}
          <div
            className="absolute inset-0"
            style={{
              boxShadow: [
                "0 0 0 1px rgba(255,255,255,0.2)",
                "0 0 0 9px rgba(0,0,0,0.9)",
                "0 0 0 10px rgba(255,255,255,0.08)",
                "0 0 40px 0px rgba(0,0,0,0.6)",
              ].join(", "),
              borderRadius: "3px",
            }}
          >
            {/* Corner accent brackets */}
            {[
              "top-0 left-0 border-t border-l",
              "top-0 right-0 border-t border-r",
              "bottom-0 left-0 border-b border-l",
              "bottom-0 right-0 border-b border-r",
            ].map((cls, i) => (
              <div key={i} className={`absolute ${cls} w-5 h-5 z-10 border-white/60`} />
            ))}

            {/* Canvas — grayscale B&W filter */}
            <canvas
              ref={canvasRef}
              className="block absolute inset-0 w-full h-full"
              style={{ borderRadius: "2px", filter: "grayscale(1) contrast(1.05)" }}
            />

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 font-sans text-[10px] uppercase tracking-widest text-white/25 pointer-events-none">
              scroll to play
            </div>
          </div>
        </div>
      </div>

      {/* ══ RIGHT: Projects revealed one by one ══ */}
      <div className="relative z-10 w-full md:w-1/2 h-1/2 md:h-full flex flex-col justify-center px-8 md:px-16">
        <h3 className="font-sans text-xs uppercase tracking-widest text-gray-400 mb-10">
          Projects
        </h3>
        <ul className="flex flex-col gap-5">
          {projects.map((p, i) => (
            <li
              key={i}
              ref={(el) => { if (el) projectRefs.current[i] = el; }}
              className="flex items-center gap-6 border-b border-white/15 pb-5 cursor-pointer group"
              style={{
                opacity: 0,
                transform: "translateX(40px)",
                transition: "opacity 0.6s ease, transform 0.6s ease",
              }}
            >
              <span className="font-sans text-xs tracking-widest text-gray-500 w-12 shrink-0">
                {p.date}
              </span>
              <span className="font-serif text-xl md:text-2xl group-hover:text-gray-300 transition-colors flex-1">
                {p.name}
              </span>
              <span className="font-sans text-xs uppercase tracking-widest text-white/0 group-hover:text-white/50 transition-colors whitespace-nowrap">
                View →
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
