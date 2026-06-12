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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Preload all project images (hero images and gallery photos) in the background
  useEffect(() => {
    if (typeof window !== "undefined") {
      PROJECTS.forEach((p) => {
        if (p.heroImage) {
          const img = new window.Image();
          img.src = p.heroImage;
        }
        if (p.images && Array.isArray(p.images)) {
          p.images.forEach((imgUrl) => {
            const img = new window.Image();
            img.src = imgUrl;
          });
        }
      });
    }
  }, []);

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

  const zoomScale = isMobile ? 4.6 : ZOOM_SCALE;
  const currentScale = exitTransition?.active ? 10 : (isZoomed ? zoomScale : 1);

  // Calculate smooth 2D translations
  let translateX = 0;
  if ((isZoomed || exitTransition?.active) && activeCard !== null) {
    const p = PROJECTS[activeCard];
    const isL = p.side === "L";
    const cardWidth = 193 * (isMobile ? 0.85 : 0.50);
    const cardX = isL ? (isMobile ? 550 - cardWidth : 520 - cardWidth) : (isMobile ? 850 : 880);
    
    if (isMobile) {
      if (isL) {
        // Align card's left edge exactly 60 SVG units from the screen's left edge
        translateX = (700 - cardX) * currentScale - 640;
      } else {
        // Align card's right edge exactly 60 SVG units from the screen's right edge
        translateX = (700 - (cardX + cardWidth)) * currentScale + 640;
      }
    } else {
      const zoomX = cardX + cardWidth / 2;
      translateX = (700 - zoomX) * currentScale;
    }
  }
  let translateY = 0;
  if (isZoomed || exitTransition?.active) {
    if (activeCard !== null) {
      const p = PROJECTS[activeCard];
      const localCardScale = isMobile ? 0.85 : 0.50;
      const currentHeight = 232 * localCardScale;
      let cardY = p.nodeY - 65;
      if (cardY + currentHeight > 760) {
        cardY = 760 - currentHeight;
      }
      const cardCenterY = cardY + currentHeight / 2;
      translateY = (305 - cardCenterY) * currentScale;
    } else {
      translateY = (305 - targetY) * currentScale;
    }
  }

  return (
    <div className="w-screen h-[350vh] bg-[#050505]">
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
          transition={
            exitTransition?.active
              ? { duration: 0.8, ease: [0.7, 0, 0.3, 1] }
              : (pageTransitionDone
                  ? { type: "spring", stiffness: 90, damping: 20, mass: 0.8 } // buttery smooth spring scroll physics
                  : { duration: 2.0, ease: [0.16, 1, 0.3, 1] } // slow entrance zoom
                )
          }
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

        {/* ── BUILDING IMAGE (High-resolution 4K rendering to prevent browser blur on zoom) ── */}
        <g>
          <image 
            href="/building/building.webp" 
            x="1200" y="-980" 
            width="3200" height="4400" 
            preserveAspectRatio="xMidYMid meet" 
            style={{ 
              imageRendering: "smooth", 
              transform: "scale(0.25) translate3d(0, 0, 0)",
              transformOrigin: "0px 0px",
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
          const localCardScale = isHighlighted ? (isMobile ? 0.85 : 0.50) : (isMobile ? 0.65 : CARD_SCALE);
          const currentWidth = 193 * localCardScale;
          const currentHeight = 232 * localCardScale;
          
          const cardX = isL 
            ? (isHighlighted ? (isMobile ? 550 - currentWidth : 520 - currentWidth) : (isMobile ? 596 - currentWidth : 596 - currentWidth)) 
            : (isHighlighted ? (isMobile ? 850 : 880) : (isMobile ? 804 : 804));
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
              onMouseEnter={() => { if (!isMobile) setHovered(i); }}
              onMouseLeave={() => { if (!isMobile) setHovered(null); }}
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

              {/* Invisible large hit target for easy tapping on mobile */}
              <circle cx={nx} cy={ny + 3.5} r={isMobile ? 25 : 10} fill="transparent" />

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
                <g transform={`translate(${cardX}, ${cardY}) scale(${localCardScale})`}>
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
  );
}
