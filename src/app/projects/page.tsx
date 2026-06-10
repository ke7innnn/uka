"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { PROJECTS_DATA } from "@/lib/projectsData";
import { motion, AnimatePresence } from "framer-motion";
import ArchitecturalTransition from "@/components/ArchitecturalTransition";

/* ── Building geometry (Golden Skyscraper 2.5D Volumetric) ─────────────────────────── */
const BB = 730;          // ground line
const FH = 22;           // floor height (increased for slender, taller look)
const FLOORS = 25;       // Number of tower floors
const PODIUM_H = 220;    // podium height
const TOWER_TOP = BB - PODIUM_H - (FLOORS * FH); // 730 - 220 - 550 = -40

// Premium Zoom & Card scale configurations
const ZOOM_SCALE = 4.2;   // Increased zoom-in level from 3.8 to 4.2 (10.5% more zoom for extreme closeups)
const CARD_SCALE = 0.31;  // Adjusted card local scale to make them smaller and fit the black space perfectly


const IMAGE_TOP_Y = -15; // Set exactly at the last residential floor balcony
const IMAGE_BOTTOM_Y = 465; // Set exactly at the first residential floor balcony above podium
const PROJECTS = PROJECTS_DATA.map((p, i) => {
  const baseY = IMAGE_TOP_Y + (i / (PROJECTS_DATA.length - 1)) * (IMAGE_BOTTOM_Y - IMAGE_TOP_Y);
  const floorIdx = Math.min(Math.floor((baseY - TOWER_TOP) / FH), FLOORS - 1);
  const isL = p.side === "L";
  return {
    ...p, baseY, floorIdx,
    nodeX: isL ? 612 : 788,
    nodeY: baseY,
  };
});

export default function ProjectsPage() {
  const [hovered, setHovered] = useState<number | null>(null);
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const [pageTransitionDone, setPageTransitionDone] = useState(false);
  const [isZoomed, setIsZoomed] = useState(true);
  const [exitTransition, setExitTransition] = useState<{ active: boolean; slug: string; title: string } | null>(null);
  const [scrollY, setScrollY] = useState(0);
  const router = useRouter();
  const targetScrollYRef = useRef<number | null>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [fromProjectTitle, setFromProjectTitle] = useState<string | null>(null);
  const [introTransitionFinished, setIntroTransitionFinished] = useState(true);

  useEffect(() => {
    const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
    const fromSlug = params?.get("from");
    
    if (fromSlug) {
      setPageTransitionDone(true);
      setIsZoomed(true);
      
      const proj = PROJECTS.find(p => p.slug === fromSlug);
      if (proj) {
        setFromProjectTitle(proj.title);
        setIntroTransitionFinished(false);
        const timer = setTimeout(() => {
          setIntroTransitionFinished(true);
        }, 1200);
        
        // Find index and pin active card
        const idx = PROJECTS.findIndex(p => p.slug === fromSlug);
        if (idx !== -1) {
          setActiveCard(idx);
          
          const performScroll = () => {
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            const projectPct = (proj.nodeY - IMAGE_TOP_Y) / (IMAGE_BOTTOM_Y - IMAGE_TOP_Y);
            const targetScrollY = projectPct * (maxScroll || 1);
            window.scrollTo(0, targetScrollY);
          };

          performScroll();
          const t1 = setTimeout(performScroll, 50);
          const t2 = setTimeout(performScroll, 150);
          const t3 = setTimeout(performScroll, 300);
          const t4 = setTimeout(performScroll, 600);

          return () => {
            clearTimeout(timer);
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
            clearTimeout(t4);
          };
        }
        return () => clearTimeout(timer);
      }
      return;
    }

    // 1. Let the premium page curtain wipe up for 1.8s
    const curtainTimer = setTimeout(() => {
      setPageTransitionDone(true);
    }, 1800);

    return () => {
      clearTimeout(curtainTimer);
    };
  }, []);

  // Continuous window scroll tracking
  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      setScrollY(currentScroll);
      
      // If we are NOT performing a programmatic click-to-pin scroll, unpin cards on scroll
      if (targetScrollYRef.current === null) {
        setActiveCard(prev => prev !== null ? null : null);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Listen to manual user wheel/touch events to immediately cancel programmatic tracking
  useEffect(() => {
    const handleUserCancel = () => {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      targetScrollYRef.current = null;
    };
    window.addEventListener("wheel", handleUserCancel, { passive: true });
    window.addEventListener("touchstart", handleUserCancel, { passive: true });
    return () => {
      window.removeEventListener("wheel", handleUserCancel);
      window.removeEventListener("touchstart", handleUserCancel);
    };
  }, []);

  // Calculate fractional scroll percent (0 to 1) running from top of the page to bottom
  const [scrollRange, setScrollRange] = useState({ maxScroll: 1 });
  useEffect(() => {
    const updateRange = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      setScrollRange({ maxScroll: maxScroll || 1 });
    };
    updateRange();
    window.addEventListener("resize", updateRange);
    return () => window.removeEventListener("resize", updateRange);
  }, [pageTransitionDone]); // Recalculate once DOM renders fully

  const handleViewProject = (e: React.MouseEvent, slug: string, title: string) => {
    e.stopPropagation();
    setExitTransition({ active: true, slug, title });
    setTimeout(() => {
      router.push(`/projects/${slug}`);
    }, 900);
  };

  const pct = Math.min(Math.max(scrollY / scrollRange.maxScroll, 0), 1);

  // Interpolate camera targetY continuously between top and bottom residential floor boundaries
  const targetY = IMAGE_TOP_Y + pct * (IMAGE_BOTTOM_Y - IMAGE_TOP_Y);

  // activeIndex auto-glow is removed to ensure floors only highlight on physical mouse hover or click

  const currentScale = exitTransition?.active ? 10 : (isZoomed ? ZOOM_SCALE : 1);

  // Calculate smooth 2D translations
  let translateX = 0;
  if ((isZoomed || exitTransition?.active) && activeCard !== null) {
    const p = PROJECTS[activeCard];
    const isL = p.side === "L";
    const cardWidth = 193 * 0.50; // Active card has scale 0.50
    const cardX = isL ? 520 - cardWidth : 880;
    const zoomX = cardX + cardWidth / 2;
    translateX = (700 - zoomX) * currentScale;
  }
  const translateY = (isZoomed || exitTransition?.active) ? (305 - targetY) * currentScale : 0;

  // Mobile-only premium card list
  const MobileProjectsList = () => {
    const visibleProjects = PROJECTS.filter(p => !p.isComingSoon);
    const comingSoon = PROJECTS.filter(p => p.isComingSoon);
    const all = [...visibleProjects, ...comingSoon];

    return (
      <div className="md:hidden min-h-screen bg-[#050505] text-white">
        {/* Sticky header */}
        <div className="sticky top-0 z-30 bg-[#050505]/90 backdrop-blur-md border-b border-white/5 px-5 py-4 flex items-center justify-between">
          <div>
            <p className="font-serif text-xl tracking-wide" style={{ fontFamily: "var(--font-cormorant), serif" }}>Projects</p>
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 mt-0.5">Umesh Kekre &amp; Associates</p>
          </div>
          <span className="text-[10px] tracking-[0.2em] uppercase text-white/30 border border-white/10 rounded-full px-3 py-1">
            {visibleProjects.length} Works
          </span>
        </div>

        {/* Card list */}
        <div className="flex flex-col">
          {all.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.07 * i, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => {
                if (!p.isComingSoon) {
                  setExitTransition({ active: true, slug: p.slug, title: p.title });
                  setTimeout(() => router.push(`/projects/${p.slug}`), 900);
                }
              }}
              className={`relative w-full overflow-hidden ${p.isComingSoon ? "opacity-50 pointer-events-none" : "cursor-pointer"}`}
              style={{ height: "72vw", maxHeight: 300 }}
            >
              {/* Full-bleed hero image */}
              <img
                src={p.heroImage}
                alt={p.title}
                className="absolute inset-0 w-full h-full object-cover"
                style={{ filter: "grayscale(100%) brightness(0.5)" }}
              />
              {/* Bottom gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />
              {/* Category badge */}
              <div className="absolute top-4 left-4">
                <span className="text-[9px] uppercase tracking-[0.3em] text-white/50 font-sans bg-black/40 backdrop-blur-sm border border-white/10 rounded-full px-2.5 py-1">
                  {p.isComingSoon ? "Coming Soon" : p.cat}
                </span>
              </div>
              {/* Index number */}
              <div className="absolute top-4 right-4">
                <span className="text-[11px] font-sans text-white/20 tracking-widest">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              {/* Bottom info */}
              <div className="absolute bottom-0 left-0 right-0 px-5 pb-5">
                <h2
                  className="font-serif text-[6.5vw] leading-tight text-white mb-2"
                  style={{ fontFamily: "var(--font-cormorant), serif" }}
                >
                  {p.isComingSoon ? "Coming Soon" : p.title}
                </h2>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${p.isComingSoon ? "bg-amber-400" : "bg-emerald-400"}`} />
                    <span className="text-[10px] uppercase tracking-widest text-white/40 font-sans">
                      {p.isComingSoon ? "In Pipeline" : "Completed"}
                    </span>
                  </div>
                  {!p.isComingSoon && (
                    <span className="text-[10px] uppercase tracking-widest text-[#F59E0B] font-sans">View →</span>
                  )}
                </div>
              </div>
              {/* Separator */}
              <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-white/5" />
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-10 border-t border-white/5 text-center">
          <p className="text-[10px] uppercase tracking-[0.35em] text-white/20 font-sans">
            Umesh Kekre &amp; Associates · Mumbai
          </p>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* ── MOBILE VIEW ── */}
      <MobileProjectsList />

      {/* ── DESKTOP VIEW (untouched) ── */}
      <div className="hidden md:block w-screen h-[350vh] bg-[#050505]">
      {/* Sticky container that keeps the SVG viewport locked to the screen */}
      <div className="sticky top-0 w-screen h-screen overflow-hidden">
        <p className="absolute top-5 right-8 z-10 text-[11px] tracking-[0.22em] uppercase text-white/40">25 Projects</p>

        <svg viewBox="0 -180 1400 970" className="w-full h-full" preserveAspectRatio="xMidYMid meet"
          style={{ cursor: "default" }}
        >
        <motion.g
          initial={{
            x: (isZoomed || exitTransition?.active) ? translateX : 0,
            y: (isZoomed || exitTransition?.active) ? translateY : 0,
            scale: currentScale
          }}
          animate={{
            x: (isZoomed || exitTransition?.active) ? translateX : 0,
            y: (isZoomed || exitTransition?.active) ? translateY : 0,
            scale: currentScale
          }}
          transition={{
            duration: exitTransition?.active ? 0.8 : 2.0,
            ease: exitTransition?.active ? [0.7, 0, 0.3, 1] : [0.16, 1, 0.3, 1]
          }}
          style={{ 
            transformOrigin: "700px 305px",
            willChange: "transform" 
          }}
        >

        {/* ── ANIMATED SKY BIRDS ── */}
        <defs>
          <radialGradient id="building-overlay" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#050505" stopOpacity="0" />
            <stop offset="75%" stopColor="#050505" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#050505" stopOpacity="0.85" />
          </radialGradient>
          <linearGradient id="card-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0d0d0d" stopOpacity="0" />
            <stop offset="100%" stopColor="#0d0d0d" stopOpacity="0.9" />
          </linearGradient>
          <style>{`
            @keyframes popFloor {
              0%   { opacity: 0; transform: translateY(15px) scaleY(0.5); }
              40%  { opacity: 1; transform: translateY(-2px) scaleY(1.05); }
              100% { opacity: 1; transform: translateY(0) scaleY(1); }
            }
            @keyframes growPillar {
              0%   { transform: scaleY(0); }
              100% { transform: scaleY(1); }
            }
            @keyframes dropCrown {
              0%   { opacity: 0; transform: translateY(-40px); }
              100% { opacity: 1; transform: translateY(0); }
            }
            @keyframes popNode {
              0%   { opacity: 0; transform: scale(0.1); }
              60%  { opacity: 1; transform: scale(1.2); }
              100% { opacity: 1; transform: scale(1); }
            }
            @keyframes flyInSun {
              0%   { opacity: 0; transform: translate(400px, -100px); }
              100% { opacity: 1; transform: translate(0px, 0px); }
            }
            @keyframes climbLift {
              0%, 3.75%, 96.25%, 100% { transform: translateY(432px); }
              46.25%, 53.75%          { transform: translateY(-28px); }
            }
            @keyframes fadeInLift {
              0%   { opacity: 0; }
              100% { opacity: 1; }
            }
            @keyframes constructionTimeLapse {
              0% { 
                clip-path: inset(88.6% 0 0 0); 
                filter: brightness(1.1) contrast(1.02); 
              }
              50% { 
                filter: brightness(0.95) contrast(0.98); 
              }
              100% { 
                clip-path: inset(0% 0 0 0); 
                filter: brightness(1) contrast(1); 
              }
            }
            @keyframes riseBeam {
              0% { transform: translateY(855px); opacity: 0; }
              4% { opacity: 1; }
              90% { opacity: 1; }
              100% { transform: translateY(-245px); opacity: 0; }
            }
            @keyframes pulseBeam {
              0% { stroke-width: 1px; opacity: 0.8; }
              100% { stroke-width: 3.5px; opacity: 1; }
            }
            @keyframes sparkBeam {
              0% { rx: 110px; opacity: 0.55; }
              100% { rx: 250px; opacity: 0.85; }
            }
          `}</style>
        </defs>

        {/* ── BUILDING IMAGE (Static, zoomed in from start) ── */}
        <g>
          <image 
            href="/building/building.webp" 
            x="300" y="-245" 
            width="800" height="1100" 
            preserveAspectRatio="xMidYMid meet" 
            style={{ 
              imageRendering: "auto", 
              transform: "translate3d(0, 0, 0)",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden"
            }}
          />
        </g>

        {/* ── PROJECT NODES + CALLOUTS (Static DOM order with CSS zIndex for flawless hover layers) ── */}
        {PROJECTS.map((p, i) => {
          // The floor path glows ONLY if hovered or clicked/pinned
          const isFloorHighlighted = hovered === i || activeCard === i;
          
          // The card and callout line are ONLY visible on hover or pin (never auto-shown)
          const isCardVisible = hovered === i || activeCard === i;
          
          const isL = p.side === "L";
          const nx = p.nodeX, ny = p.nodeY;
          
          // Dynamic scaling: active card is significantly larger and pushed way far to left/right to prevent any overlap
          const isHighlighted = activeCard === i;
          const currentScale = isHighlighted ? 0.50 : CARD_SCALE;
          const currentWidth = 193 * currentScale;
          const currentHeight = 232 * currentScale;
          
          const cardX = isL ? (isHighlighted ? 520 - currentWidth : 596 - currentWidth) : (isHighlighted ? 880 : 804);
          const endX = isL ? cardX + currentWidth : cardX;
          const midX = nx + (endX - nx) / 2;
          let cardY = isHighlighted ? ny - 65 : ny - 40;
          let lineEndY = ny + (isL ? -4 : 4);
          
          // If card goes past the bottom frame, shift it up and angle the line
          if (cardY + currentHeight > 760) {
            cardY = 760 - currentHeight;
            lineEndY = cardY + 25;
          }

          return (
            <g key={p.id} 
              style={{ 
                cursor: "pointer", 
                zIndex: isFloorHighlighted ? 50 : 1, 
                position: "relative" 
              }}
              onMouseEnter={() => { setHovered(i); }}
              onMouseLeave={() => { setHovered(null); }}
              onClick={(e) => {
                e.stopPropagation();
                const projectPct = (p.nodeY - IMAGE_TOP_Y) / (IMAGE_BOTTOM_Y - IMAGE_TOP_Y);
                const targetScrollY = projectPct * scrollRange.maxScroll;
                
                // Track programmatic scroll target to bypass scroll listener reset
                targetScrollYRef.current = Math.round(targetScrollY);
                
                // Clear any previous programmatic timeout
                if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
                
                // Bypass scroll unpin tracking for 1000ms (smooth scroll animation window)
                scrollTimeoutRef.current = setTimeout(() => {
                  targetScrollYRef.current = null;
                }, 1000);
                
                window.scrollTo({ top: targetScrollY, behavior: "smooth" });
                setActiveCard(activeCard === i ? null : i); // toggle click-to-pin
              }}>

              {/* floor hover overlay (3D Curved V-Shape Perspective Path covering the WHOLE floor) */}
              <path 
                d={`M 588,${ny - 12} Q 634,${ny} 680,${ny + 6} Q 700,${ny + 9} 720,${ny + 6} Q 774,${ny} 828,${ny - 12} L 828,${ny + 8} Q 774,${ny + 20} 720,${ny + 26} Q 700,${ny + 29} 680,${ny + 26} Q 634,${ny + 20} 588,${ny + 8} Z`}
                fill="#F59E0B" opacity={isFloorHighlighted ? 0.4 : 0}
                style={{ transition: "opacity 0.2s ease", pointerEvents: "all" }} />

              {/* node (Shifted down by 3.5px to sit exactly at the floor center centroid) */}
              <rect x={nx - 2.25} y={ny + 3.5 - 2.25} width={4.5} height={4.5}
                fill={isFloorHighlighted ? "#F59E0B" : "#111"} stroke={isFloorHighlighted ? "#F59E0B" : "#ccc"} strokeWidth="1"
                style={{ 
                  transition: "fill 0.15s", 
                  opacity: pageTransitionDone ? 1 : 0, 
                  animation: pageTransitionDone 
                    ? `popNode 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${0.1 + i*0.03}s forwards` 
                    : "none", 
                  transformBox: "fill-box", 
                  transformOrigin: "center" 
                }} />

              {/* callout line */}
              {isCardVisible && (
                <polyline
                  points={`${nx},${ny + 3.5} ${midX},${ny + 3.5 + (isL ? -4 : 4)} ${endX},${lineEndY}`}
                  fill="none" stroke="#ddd" strokeWidth="0.9" />
              )}

              {/* hover card in pure SVG to fix Safari zoom bugs */}
              {isCardVisible && (
                <g transform={`translate(${cardX}, ${cardY}) scale(${currentScale})`}>
                  {/* Outer border & shadow (simulated) */}
                  <rect x="0" y="0" width="193" height="232" fill="#0d0d0d" stroke="#2a2a2a" strokeWidth="1" rx="3" />
                  
                  {/* Image in the empty space (dark top) */}
                  <clipPath id={`clip-img-${p.id}`}>
                    <rect x="1" y="1" width="191" height="112" rx="2" />
                  </clipPath>
                  <image 
                    href={p.heroImage} 
                    x="1" y="1" width="191" height="112" 
                    preserveAspectRatio="xMidYMid slice" 
                    clipPath={`url(#clip-img-${p.id})`}
                  />
                  
                  {/* Fade overlay so text is readable */}
                  <rect x="1" y="50" width="191" height="63" fill="url(#card-fade)" />
                  
                  {/* Category text */}
                  <text x="12" y="85" fill="#ddd" fontSize="7" fontFamily="'Inter', sans-serif" letterSpacing="0.1em">
                    {p.isComingSoon ? "FUTURE PHASE" : p.cat.toUpperCase()}
                  </text>
                  
                  {/* Title */}
                  <text x="12" y="103" fill="#fff" fontSize="13" fontWeight="600" fontFamily="'Inter', sans-serif" letterSpacing="-0.01em">
                    {p.isComingSoon ? "Coming Soon" : p.title}
                  </text>
                  
                  {/* Light bottom */}
                  <rect x="1" y="113" width="191" height="118" fill="#fcfcfc" rx="2" />
                  <rect x="1" y="113" width="191" height="10" fill="#fcfcfc" /> {/* square top corners */}
                  
                  {/* Metadata Type */}
                  <text x="16" y="138" fill="#888" fontSize="6.5" fontFamily="'Inter', sans-serif" letterSpacing="0.1em">TYPE</text>
                  <text x="16" y="152" fill="#111" fontSize="10" fontWeight="600" fontFamily="'Inter', sans-serif">
                    {p.isComingSoon ? "Upcoming" : p.cat}
                  </text>
                  
                  {/* Metadata Location */}
                  <text x="100" y="138" fill="#888" fontSize="6.5" fontFamily="'Inter', sans-serif" letterSpacing="0.1em">LOCATION</text>
                  <text x="100" y="152" fill="#111" fontSize="10" fontWeight="600" fontFamily="'Inter', sans-serif">
                    {p.isComingSoon ? "—" : "Mumbai"}
                  </text>
                  
                  {/* Divider line */}
                  <line x1="16" y1="166" x2="177" y2="166" stroke="#eaeaea" strokeWidth="1" />
                  
                  {/* Tags */}
                  <text x="16" y="184" fill="#666" fontSize="7.5" fontFamily="'Inter', sans-serif">
                    {p.isComingSoon ? "# ComingSoon  ·  # UKA" : `# ${p.cat}  ·  # Architecture`}
                  </text>
                  
                  {/* Footer: Status */}
                  <circle cx="18" cy="214" r="2.5" fill={p.isComingSoon ? "#f59e0b" : "#22c55e"} />
                  <text x="25" y="216.5" fill="#555" fontSize="7.5" fontFamily="'Inter', sans-serif">
                    {p.isComingSoon ? "In Pipeline" : "Completed"}
                  </text>
                  
                  {/* Footer: View project */}
                  {!p.isComingSoon && (
                    <text x="177" y="217" fill="#F59E0B" fontSize="8" fontWeight="600" fontFamily="'Inter', sans-serif" textAnchor="end" style={{ cursor: "pointer" }} onClick={(e) => handleViewProject(e, p.slug, p.title)}>View project →</text>
                  )}
                  
                  {/* Invisible click target for the CTA */}
                  {!p.isComingSoon && (
                    <rect x="110" y="200" width="80" height="30" fill="transparent" style={{ cursor: "pointer" }} onClick={(e) => handleViewProject(e, p.slug, p.title)} />
                  )}
                </g>
              )}
            </g>
          );
        })}
        </motion.g>

        {/* Full-screen anti-aliasing soft overlay */}
        <rect 
          x="-500" y="-500" 
          width="2400" height="2000" 
          fill="url(#building-overlay)" 
          style={{ pointerEvents: "none" }}
        />
      </svg>
      </div>{/* /sticky */}

      {/* ── LUXURY PAGE ENTRANCE TRANSITION ── */}
      <AnimatePresence>
        {!pageTransitionDone && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="fixed inset-0 z-[80] bg-[#050505] flex flex-col items-center justify-center text-white"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.6, ease: "easeOut" }}
              className="flex flex-col items-center text-center"
            >
              <h2 
                className="text-4xl md:text-5xl font-serif tracking-[0.25em] uppercase text-white/90"
                style={{ fontFamily: "var(--font-cormorant), serif" }}
              >
                UKA
              </h2>
              <div className="w-16 h-[1px] bg-white/60 my-4" />
              <p className="text-[10px] md:text-[11px] font-sans tracking-[0.45em] uppercase text-white/45">
                Umesh Kekre &amp; Associates
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── LUXURY ARCHITECTURAL EXIT TRANSITION ── */}
      {exitTransition?.active && (
        <ArchitecturalTransition mode="exit" title={exitTransition.title} />
      )}

      {/* ── LUXURY ARCHITECTURAL ENTER TRANSITION (ON RETURN) ── */}
      {!introTransitionFinished && fromProjectTitle && (
        <ArchitecturalTransition mode="enter" title={fromProjectTitle} />
      )}
    </div>
    </>
  );
}
