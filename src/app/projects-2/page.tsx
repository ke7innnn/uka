"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { PROJECTS_DATA } from "@/lib/projectsData";
import { motion } from "framer-motion";

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
  const [zoomed, setZoomed] = useState<number | null>(null);
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const router = useRouter();

  const lastScrollTimeRef = useRef(0);

  // Auto-zoom to the top floor (project index 0) after the bottom-to-top reveal completes (3.2 seconds)
  useEffect(() => {
    // Initial animation sequence:
    // After the 3s wipeUp animation finishes, snap to the top floor
    const timer = setTimeout(() => {
      setZoomed(0);
    }, 3200);
    return () => clearTimeout(timer);
  }, []);

  // Enable scroll-controlled navigation through the 25 floors when zoomed in
  const handleWheel = (e: React.WheelEvent) => {
    if (zoomed === null) return;
    
    const now = Date.now();
    if (now - lastScrollTimeRef.current < 160) return; // Fluid, responsive scroll pacing (160ms)

    if (e.deltaY > 0) {
      // Scroll down: Go to next floor (larger index)
      setZoomed(prev => {
        if (prev === null) return 0;
        const next = prev + 1;
        if (next < PROJECTS.length) {
          lastScrollTimeRef.current = now;
          setActiveCard(null);
          return next;
        }
        return prev;
      });
    } else if (e.deltaY < 0) {
      // Scroll up: Go to previous floor (smaller index)
      setZoomed(prev => {
        if (prev === null) return 0;
        const next = prev - 1;
        if (next >= 0) {
          lastScrollTimeRef.current = now;
          setActiveCard(null);
          return next;
        }
        return prev;
      });
    }
  };



  // Calculate camera translation to center horizontally on the building and vertically on the active floor
  let translateX = 0;
  let translateY = 0;
  if (zoomed !== null) {
    const p = PROJECTS[zoomed];
    let targetX = 700;
    const targetY = p.nodeY;
    
    if (activeCard !== null && activeCard === zoomed) {
      const isL = p.side === "L";
      const activeScale = 0.50; // Keep the larger premium scale
      const cardWidth = 193 * activeScale;
      const cardX = isL ? 520 - cardWidth : 880; // Positioned far away to the left/right to prevent any building overlap
      targetX = cardX + cardWidth / 2; // Center on the expanded active card horizontally
    }

    // Mathematical translation based on a completely fixed transform-origin at the viewbox center (700, 305)
    // This guarantees rock-solid transitions without browser origin shearing artifacts.
    translateX = (700 - targetX) * ZOOM_SCALE;
    translateY = (305 - targetY) * ZOOM_SCALE;
  }

  return (
    <div className="w-screen h-screen overflow-hidden bg-[#050505]" onWheel={handleWheel}>
      <p className="absolute top-5 right-8 z-10 text-[11px] tracking-[0.22em] uppercase text-white/40">25 Projects</p>

      <svg viewBox="0 -180 1400 970" className="w-full h-full" preserveAspectRatio="xMidYMid meet"
        style={{ cursor: "default" }}
      >
        <motion.g
          animate={{
            transform: zoomed !== null 
              ? `translate(${translateX}px, ${translateY}px) scale(${ZOOM_SCALE})` 
              : "translate(0px, 0px) scale(1)"
          }}
          transition={{
            type: "spring",
            stiffness: 90,
            damping: 18,
            mass: 0.75
          }}
          onAnimationStart={() => setIsScrolling(true)}
          onAnimationComplete={() => setIsScrolling(false)}
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
          {/* Mathematical Convolve Sharpening to eliminate blurriness and restore crisp 4K details */}
          <filter id="premium-4k-filter">
            <feConvolveMatrix order="3" kernelMatrix="0 -0.25 0 -0.25 2.0 -0.25 0 -0.25 0" preserveAlpha="true" />
          </filter>
          {/* Ultra-subtle noise/grain shader to blend upscaled artifacts while keeping absolute black zones pure */}
          <filter id="grain-filter">
            <feTurbulence type="fractalNoise" baseFrequency="0.95" numOctaves="4" stitchTiles="stitch" />
            <feColorMatrix type="matrix" values="0 0 0 0 1   0 0 0 0 1   0 0 0 0 1  0 0 0 0.015 0" />
          </filter>
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
              0% { clip-path: inset(100% 0 0 0); filter: brightness(1.3) contrast(1.1) saturate(1.15) drop-shadow(0 0 4px rgba(245, 158, 11, 0.4)); }
              8% { filter: brightness(0.88) contrast(0.95); }
              20% { filter: brightness(1.22) contrast(1.08) drop-shadow(0 0 6px rgba(245, 158, 11, 0.3)); }
              32% { filter: brightness(0.84) contrast(0.9); }
              45% { filter: brightness(1.28) contrast(1.15) drop-shadow(0 0 8px rgba(245, 158, 11, 0.4)); }
              60% { filter: brightness(0.9) contrast(0.98); }
              74% { filter: brightness(1.25) contrast(1.1) drop-shadow(0 0 5px rgba(245, 158, 11, 0.3)); }
              88% { filter: brightness(0.94) contrast(0.96); }
              100% { clip-path: inset(0 0 0 0); filter: brightness(1) contrast(1) saturate(1) drop-shadow(0 0 0px transparent); }
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

        {/* ── BUILDING IMAGE (Holographic Time-Lapse Materialization) ── */}
        <g style={{ animation: "constructionTimeLapse 3s cubic-bezier(0.25, 1, 0.5, 1) forwards" }}>
          <image 
            href="/building/building.png" 
            x="300" y="-245" 
            width="800" height="1100" 
            preserveAspectRatio="xMidYMid meet" 
            style={{ 
              filter: isScrolling ? "none" : "url(#premium-4k-filter)", 
              imageRendering: "high-quality" as "auto", 
              transform: "translateZ(0)",
              transition: "filter 0.35s cubic-bezier(0.16, 1, 0.3, 1)"
            }}
          />
        </g>

        {/* ── HIGH-TECH LASER SCANNING BEAM (Construction Time-Lapse Spark) ── */}
        <g style={{
          animation: "riseBeam 3s cubic-bezier(0.25, 1, 0.5, 1) forwards",
          pointerEvents: "none"
        }}>
          {/* Main Laser Beam Line */}
          <line 
            x1="520" x2="880" y1="0" y2="0" 
            stroke="#F59E0B" 
            style={{
              filter: "drop-shadow(0 0 4px #F59E0B) drop-shadow(0 0 10px #D97706)",
              animation: "pulseBeam 0.1s infinite alternate"
            }}
          />
          {/* Subtle Horizontal Spark Flare */}
          <ellipse 
            cx="700" cy="0" rx="180" ry="1.5" 
            fill="#ffffff" 
            style={{
              filter: "blur(1.5px) drop-shadow(0 0 3px #F59E0B)",
              animation: "sparkBeam 0.07s infinite alternate"
            }}
          />
        </g>

        {/* ── PROJECT NODES + CALLOUTS ── */}
        {PROJECTS.map((p, i) => {
          const isH = hovered === i || activeCard === i;
          const isL = p.side === "L";
          const nx = p.nodeX, ny = p.nodeY;
          
          // Dynamic scaling: active card is significantly larger and pushed way far to left/right to prevent any overlap
          const currentScale = activeCard === i ? 0.50 : CARD_SCALE;
          const currentWidth = 193 * currentScale;
          const currentHeight = 232 * currentScale;
          
          const cardX = isL ? (activeCard === i ? 520 - currentWidth : 596 - currentWidth) : (activeCard === i ? 880 : 804);
          const endX = isL ? cardX + currentWidth : cardX;
          const midX = nx + (endX - nx) / 2;
          let cardY = activeCard === i ? ny - 65 : ny - 40;
          let lineEndY = ny + (isL ? -4 : 4);
          
          // If card goes past the bottom frame, shift it up and angle the line
          if (cardY + currentHeight > 760) {
            cardY = 760 - currentHeight;
            lineEndY = cardY + 25;
          }

          return (
            <g key={p.id} style={{ cursor: "pointer" }}
              onMouseEnter={() => { setHovered(i); }}
              onMouseLeave={() => { setHovered(null); }}
              onClick={(e) => {
                e.stopPropagation();
                setZoomed(i);
                setActiveCard(i);
              }}>

              {/* floor hover overlay (3D Curved V-Shape Perspective Path covering the WHOLE floor) */}
              <path 
                d={`M 588,${ny - 12} Q 634,${ny} 680,${ny + 6} Q 700,${ny + 9} 720,${ny + 6} Q 774,${ny} 828,${ny - 12} L 828,${ny + 8} Q 774,${ny + 20} 720,${ny + 26} Q 700,${ny + 29} 680,${ny + 26} Q 634,${ny + 20} 588,${ny + 8} Z`}
                fill="#F59E0B" opacity={isH ? 0.4 : 0}
                style={{ transition: "opacity 0.2s ease", pointerEvents: "all" }} />

              {/* node (Shifted down by 3.5px to sit exactly at the floor center centroid) */}
              <rect x={nx - 2.25} y={ny + 3.5 - 2.25} width={4.5} height={4.5}
                fill={isH ? "#F59E0B" : "#111"} stroke={isH ? "#F59E0B" : "#ccc"} strokeWidth="1"
                style={{ 
                  transition: "fill 0.15s", 
                  opacity: 0, 
                  animation: `popNode 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${2.0 + i*0.02}s forwards`, 
                  transformBox: "fill-box", 
                  transformOrigin: "center" 
                }} />

              {/* callout line */}
              {isH && (
                <polyline
                  points={`${nx},${ny + 3.5} ${midX},${ny + 3.5 + (isL ? -4 : 4)} ${endX},${lineEndY}`}
                  fill="none" stroke="#ddd" strokeWidth="0.9" />
              )}

              {/* hover card in pure SVG to fix Safari zoom bugs */}
              {isH && (
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
                  <text x="12" y="85" fill="#ddd" fontSize="7" fontFamily="'Inter', sans-serif" letterSpacing="0.1em">{p.cat.toUpperCase()}</text>
                  
                  {/* Title */}
                  <text x="12" y="103" fill="#fff" fontSize="13" fontWeight="600" fontFamily="'Inter', sans-serif" letterSpacing="-0.01em">{p.title}</text>
                  
                  {/* Light bottom */}
                  <rect x="1" y="113" width="191" height="118" fill="#fcfcfc" rx="2" />
                  <rect x="1" y="113" width="191" height="10" fill="#fcfcfc" /> {/* square top corners */}
                  
                  {/* Metadata Type */}
                  <text x="16" y="138" fill="#888" fontSize="6.5" fontFamily="'Inter', sans-serif" letterSpacing="0.1em">TYPE</text>
                  <text x="16" y="152" fill="#111" fontSize="10" fontWeight="600" fontFamily="'Inter', sans-serif">{p.cat}</text>
                  
                  {/* Metadata Location */}
                  <text x="100" y="138" fill="#888" fontSize="6.5" fontFamily="'Inter', sans-serif" letterSpacing="0.1em">LOCATION</text>
                  <text x="100" y="152" fill="#111" fontSize="10" fontWeight="600" fontFamily="'Inter', sans-serif">Mumbai</text>
                  
                  {/* Divider line */}
                  <line x1="16" y1="166" x2="177" y2="166" stroke="#eaeaea" strokeWidth="1" />
                  
                  {/* Tags */}
                  <text x="16" y="184" fill="#666" fontSize="7.5" fontFamily="'Inter', sans-serif"># {p.cat}  ·  # Architecture</text>
                  
                  {/* Footer: Status */}
                  <circle cx="18" cy="214" r="2.5" fill="#22c55e" />
                  <text x="25" y="216.5" fill="#555" fontSize="7.5" fontFamily="'Inter', sans-serif">Completed</text>
                  
                  {/* Footer: View project */}
                  <text x="177" y="217" fill="#F59E0B" fontSize="8" fontWeight="600" fontFamily="'Inter', sans-serif" textAnchor="end" style={{ cursor: "pointer" }} onClick={(e) => { e.stopPropagation(); router.push(`/projects-2/${p.slug}`); }}>View project →</text>
                  
                  {/* Invisible click target for the CTA */}
                  <rect x="110" y="200" width="80" height="30" fill="transparent" style={{ cursor: "pointer" }} onClick={(e) => { e.stopPropagation(); router.push(`/projects-2/${p.slug}`); }} />
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

        {/* Full-screen premium cinematic film grain to add uniform 4K texture across the whole screen */}
        <rect 
          x="-500" y="-500" 
          width="2400" height="2000" 
          filter={isScrolling ? "none" : "url(#grain-filter)"} 
          style={{ 
            pointerEvents: "none",
            opacity: isScrolling ? 0 : 1,
            transition: "opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1)"
          }}
        />
      </svg>
    </div>
  );
}
