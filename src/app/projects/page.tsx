"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

/* ── Building geometry ─────────────────────────────────── */
const BB = 770;          // ground line
const FH = 33;           // floor height
const FLOORS = 20;
const DX = 85, DY = -42; // 3-D depth (side face of right tower)

// 4 wings  [left, right, topY]
const WA = [430, 535, 110];  // outer-left  (tallest)
const WB = [557, 707, 138];  // inner-left
const WC = [727, 877, 138];  // inner-right
const WD = [899, 1004, 110]; // outer-right (tallest)

const RAW = [
  {id:1, title:"The Courtyard House",  cat:"Residential",   slug:"courtyard-house",    side:"L"},
  {id:2, title:"Lakeside Villa",        cat:"Residential",   slug:"lakeside-villa",     side:"R"},
  {id:3, title:"Urban Townhouses",      cat:"Residential",   slug:"urban-townhouses",   side:"L"},
  {id:4, title:"Minimalist Loft",       cat:"Interior",      slug:"minimalist-loft",    side:"R"},
  {id:5, title:"Executive Boardroom",   cat:"Interior",      slug:"executive-boardroom",side:"L"},
  {id:6, title:"Luxury Penthouse",      cat:"Interior",      slug:"luxury-penthouse",   side:"R"},
  {id:7, title:"Artisan Coffee Shop",   cat:"Interior",      slug:"artisan-coffee-shop",side:"L"},
  {id:8, title:"The Grand Atrium",      cat:"Commercial",    slug:"grand-atrium",       side:"R"},
  {id:9, title:"Retail Galleria",       cat:"Commercial",    slug:"retail-galleria",    side:"L"},
  {id:10,title:"Mixed-Use Complex",     cat:"Commercial",    slug:"mixed-use-complex",  side:"R"},
  {id:11,title:"Urban Market Space",    cat:"Commercial",    slug:"urban-market-space", side:"L"},
  {id:12,title:"Tech Hub HQ",           cat:"Corporate",     slug:"tech-hub-hq",        side:"R"},
  {id:13,title:"Financial Tower",       cat:"Corporate",     slug:"financial-tower",    side:"L"},
  {id:14,title:"Creative Agency Hub",   cat:"Corporate",     slug:"creative-agency-hub",side:"R"},
  {id:15,title:"Boutique Hotel",        cat:"Hospitality",   slug:"boutique-hotel",     side:"L"},
  {id:16,title:"Mountain Resort",       cat:"Hospitality",   slug:"mountain-resort",    side:"R"},
  {id:17,title:"City Center Suites",    cat:"Hospitality",   slug:"city-center-suites", side:"L"},
  {id:18,title:"Heritage Inn",          cat:"Hospitality",   slug:"heritage-inn",       side:"R"},
  {id:19,title:"National Library",      cat:"Institutional", slug:"national-library",   side:"L"},
  {id:20,title:"University Campus",     cat:"Institutional", slug:"university-campus",  side:"R"},
  {id:21,title:"Modern Art Museum",     cat:"Institutional", slug:"modern-art-museum",  side:"L"},
  {id:22,title:"Urban Park Revival",    cat:"Landscape",     slug:"urban-park-revival", side:"R"},
  {id:23,title:"Coastal Promenade",     cat:"Landscape",     slug:"coastal-promenade",  side:"L"},
  {id:24,title:"Botanical Gardens",     cat:"Landscape",     slug:"botanical-gardens",  side:"R"},
  {id:25,title:"Future City Plan",      cat:"Visualisation", slug:"future-city-plan",   side:"L"},
];

const BH = BB - WA[2]; // tallest building height
const PROJECTS = RAW.map((p, i) => {
  const baseY = WA[2] + (i / (RAW.length - 1)) * BH;
  const floorIdx = Math.min(Math.floor((baseY - WA[2]) / FH), FLOORS - 1);
  const isL = p.side === "L";
  return {
    ...p, baseY, floorIdx,
    nodeX: isL ? WA[0] : WD[1] + DX,
    nodeY: isL ? baseY : baseY + DY,
  };
});

/* ── Wing renderer ─────────────────────────────────────── */
function Wing({ l, r, t, hotFloor, side, sideLeft, onFloorHover, onFloorClick }: {
  l: number; r: number; t: number; hotFloor: number | null;
  side?: boolean; sideLeft?: boolean;
  onFloorHover: (f: number | null) => void;
  onFloorClick: (f: number) => void;
}) {
  const w = r - l;
  const floors = Math.floor((BB - t) / FH);
  const cx = (l + r) / 2;
  const isOuter = (l === WA[0] || l === WD[0]);
  // left-side depth constants (mirror of DX/DY)
  const LDX = 60, LDY = -30;

  return (
    <g>
      {/* ── LEFT SIDE FACE (Wing A only) ── */}
      {sideLeft && (
        <g>
          <polygon points={`${l},${t} ${l-LDX},${t+LDY} ${l-LDX},${BB+LDY} ${l},${BB}`}
            fill="#888" stroke="#555" strokeWidth="0.8" />
          {Array.from({ length: floors }, (_, f) => {
            const y1 = t + f * FH; const y2 = y1 + FH;
            const hot = hotFloor !== null && Math.abs((WA[2] + hotFloor * FH) - y1) < FH / 2;
            return (
              <g key={f}>
                <polygon
                  points={`${l},${y1} ${l-LDX},${y1+LDY} ${l-LDX},${y2+LDY} ${l},${y2}`}
                  fill={hot ? "#d4900a" : f % 2 === 0 ? "#7a7a7a" : "#848484"}
                  stroke="#555" strokeWidth="0.4" style={{ transition: "fill 0.2s" }} />
                {[[0.15, 0.45], [0.58, 0.88]].map(([ta, tb], wi) => (
                  <polygon key={wi}
                    points={`${l-ta*LDX},${y1+7+ta*LDY} ${l-tb*LDX},${y1+7+tb*LDY} ${l-tb*LDX},${y1+17+tb*LDY} ${l-ta*LDX},${y1+17+ta*LDY}`}
                    fill={hot ? "rgba(255,200,60,0.4)" : "#444"} stroke="#333" strokeWidth="0.3" />
                ))}
              </g>
            );
          })}
          <g style={{ opacity: 0, animation: "dropCrown 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) 2s forwards", transformBox: "fill-box", transformOrigin: "bottom" }}>
            <polygon points={`${l},${t} ${l-LDX},${t+LDY} ${l-LDX},${BB+LDY} ${l},${BB}`}
              fill="none" stroke="#444" strokeWidth="1.1" />
            {/* top-left face */}
            <polygon points={`${l},${t} ${r},${t} ${r+DX},${t+DY} ${l+DX},${t+DY}`}
              fill="#d2d2d2" stroke="#aaa" strokeWidth="0.8" />
            {/* back-left corner top */}
            <polygon points={`${l},${t} ${l-LDX},${t+LDY} ${l-LDX+DX},${t+LDY+DY} ${l+DX},${t+DY}`}
              fill="#c0c0c0" stroke="#aaa" strokeWidth="0.7" />
          </g>
        </g>
      )}

      {/* floor strips */}
      {Array.from({ length: floors }, (_, f) => {
        const fy = t + f * FH;
        // Convert this floor's pixel Y to a WA-relative floor index (so all wings align)
        const waRelF = Math.floor((fy - WA[2]) / FH);
        const hot = hotFloor !== null && waRelF === hotFloor;
        const fill = hot ? "#F59E0B" : f % 2 === 0 ? "#ececec" : "#f4f4f4";
        const ww = isOuter ? 26 : 30;
        const wCount = isOuter ? 3 : 4;
        const gap = (w - 24 - wCount * ww) / (wCount - 1);
        const wh = Math.min(FH - 9, 13);
        const delay = (floors - 1 - f) * 0.055; // Bottom-up delay
        return (
          <g key={f} style={{ opacity: 0, animation: `popFloor 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${delay}s forwards`, transformBox: "fill-box", transformOrigin: "bottom" }}>
            <rect x={l} y={fy} width={w} height={FH} fill={fill} stroke="#444" strokeWidth="0.4"
              style={{ transition: "fill 0.2s", cursor: "pointer" }}
              onMouseEnter={() => onFloorHover(waRelF)}
              onMouseLeave={() => onFloorHover(null)}
              onClick={() => onFloorClick(waRelF)} />
            {Array.from({ length: wCount }, (_, j) => (
              <rect key={j}
                x={l + 12 + j * (ww + gap)} y={fy + 6}
                width={ww} height={wh}
                fill={hot ? "rgba(255,255,255,0.6)" : "#555"}
                stroke={hot ? "#fff8" : "#444"} strokeWidth="0.3" rx="1"
                style={{ pointerEvents: "none" }} />
            ))}
            <path d={`M ${l + 6},${fy + FH - 4} Q ${cx},${fy + FH + 2} ${r - 6},${fy + FH - 4}`}
              fill={hot ? "rgba(245,158,11,0.25)" : "rgba(0,0,0,0.12)"}
              stroke={hot ? "#e8960a" : "#777"} strokeWidth="0.7"
              style={{ pointerEvents: "none" }} />
          </g>
        );
      })}

      {/* wing outline & structural pillars growing from ground */}
      <rect x={l} y={t} width={w} height={BB - t} fill="none" stroke="#444" strokeWidth="1.2" 
        style={{ animation: "growPillar 1.8s cubic-bezier(0.25, 1, 0.5, 1) forwards", transformBox: "fill-box", transformOrigin: "bottom" }} />
      {[l, l + w / 2 - 4, r - 8].map((px, i) => (
        <rect key={i} x={px} y={t} width={8} height={BB - t} fill="#cccccc" stroke="#aaa" strokeWidth="0.3"
          style={{ pointerEvents: "none", animation: "growPillar 1.8s cubic-bezier(0.25, 1, 0.5, 1) forwards", transformBox: "fill-box", transformOrigin: "bottom" }} />
      ))}

      {/* crown */}
      <g style={{ opacity: 0, animation: "dropCrown 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) 1.9s forwards", transformBox: "fill-box", transformOrigin: "bottom" }}>
        <ellipse cx={cx} cy={t - 10} rx={isOuter ? 30 : 22} ry={isOuter ? 13 : 9}
          fill="#e0e0e0" stroke="#aaa" strokeWidth="1" />
        <ellipse cx={cx} cy={t - 10} rx={isOuter ? 16 : 10} ry={isOuter ? 7 : 5}
          fill="#c8c8c8" stroke="#bbb" strokeWidth="0.8" />
        {isOuter && (
          <>
            <line x1={cx} y1={t - 23} x2={cx} y2={t - 10} stroke="#bbb" strokeWidth="0.8" />
            <ellipse cx={cx} cy={t - 26} rx={8} ry={4} fill="#ddd" stroke="#bbb" strokeWidth="0.7" />
          </>
        )}

        {/* ── TOP FACE (all wings) ── */}
        {!sideLeft && (
          <polygon points={`${l},${t} ${r},${t} ${r+DX},${t+DY} ${l+DX},${t+DY}`}
            fill="#d2d2d2" stroke="#aaa" strokeWidth="0.8" />
        )}
      </g>

      {/* ── RIGHT SIDE FACE (Wing D only) ── */}
      {side && (
        <g>
          {Array.from({ length: floors }, (_, f) => {
            const y1 = t + f * FH; const y2 = y1 + FH;
            const hot = hotFloor !== null && Math.abs((WA[2] + hotFloor * FH) - y1) < FH / 2;
            const sfl = hot ? "#b87200" : f % 2 === 0 ? "#8a8a8a" : "#949494";
            const delay = (floors - 1 - f) * 0.055;
            return (
              <g key={f} style={{ opacity: 0, animation: `popFloor 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${delay}s forwards`, transformBox: "fill-box", transformOrigin: "bottom" }}>
                <polygon
                  points={`${r},${y1} ${r+DX},${y1+DY} ${r+DX},${y2+DY} ${r},${y2}`}
                  fill={sfl} stroke="#555" strokeWidth="0.4"
                  style={{ transition: "fill 0.2s" }} />
                {[[0.1, 0.4], [0.55, 0.85]].map(([ta, tb], wi) => (
                  <polygon key={wi}
                    points={`${r+ta*DX},${y1+7+ta*DY} ${r+tb*DX},${y1+7+tb*DY} ${r+tb*DX},${y1+17+tb*DY} ${r+ta*DX},${y1+17+ta*DY}`}
                    fill={hot ? "rgba(255,210,80,0.4)" : "#555"} stroke="#444" strokeWidth="0.3" />
                ))}
              </g>
            );
          })}
          <g style={{ opacity: 0, animation: "dropCrown 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) 2s forwards", transformBox: "fill-box", transformOrigin: "bottom" }}>
            <polygon points={`${r},${t} ${r+DX},${t+DY} ${r+DX},${BB+DY} ${r},${BB}`}
              fill="none" stroke="#444" strokeWidth="1.1" />
          </g>
          {/* top face for WD */}
          <polygon points={`${l},${t} ${r},${t} ${r+DX},${t+DY} ${l+DX},${t+DY}`}
            fill="#d0cabe" stroke="#555" strokeWidth="0.8" />
        </g>
      )}
    </g>
  );
}



export default function ProjectsPage() {
  const [hovered, setHovered] = useState<number | null>(null);
  const [zoomed, setZoomed] = useState<number | null>(null);
  const router = useRouter();
  const hf = hovered !== null ? PROJECTS[hovered].floorIdx : null;

  // When hovering a floor directly, snap to closest project
  const getClosestProject = (floorIdx: number) => {
    let closest = 0, minDist = Infinity;
    PROJECTS.forEach((p, i) => {
      const d = Math.abs(p.floorIdx - floorIdx);
      if (d < minDist) { minDist = d; closest = i; }
    });
    return closest;
  };

  const handleFloorHover = (floorIdx: number | null) => {
    if (zoomed !== null) return; // Lock hover when zoomed in
    if (floorIdx === null) { setHovered(null); return; }
    setHovered(getClosestProject(floorIdx));
  };

  const handleFloorClick = (floorIdx: number) => {
    if (zoomed !== null) return; // Zoom out is handled by background click
    const idx = getClosestProject(floorIdx);
    setHovered(idx);
    setZoomed(idx);
  };

  // Calculate zoom transform origin based on the active card's center
  let zoomX = 700;
  let zoomY = 395;
  let translateX = 0;
  let translateY = 0;
  if (zoomed !== null) {
    const p = PROJECTS[zoomed];
    const isL = p.side === "L";
    const endX = isL ? p.nodeX - 165 : p.nodeX + 105;
    const cardX = isL ? endX - 193 : endX;
    const cardY = p.nodeY - 40;
    zoomX = cardX + 193 / 2;
    zoomY = cardY + 232 / 2;
    // Translate the card to the exact center of the 1400x790 viewBox
    translateX = 700 - zoomX;
    translateY = 395 - zoomY;
  }

  return (
    <div className="w-screen h-screen overflow-hidden bg-[#111111]"
      style={{ backgroundImage: 'url("/project building bg/WhatsApp Image 2026-05-10 at 4.57.17 PM.jpeg")', backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <p className="absolute top-5 left-8 z-10 text-[11px] tracking-[0.22em] uppercase text-white/40">Umesh Kekre &amp; Associates</p>
      <p className="absolute top-5 right-8 z-10 text-[11px] tracking-[0.22em] uppercase text-white/40">25 Projects</p>

      <svg viewBox="0 0 1400 790" className="w-full h-full" preserveAspectRatio="xMidYMid meet"
        onClick={() => { if (zoomed !== null) { setZoomed(null); setHovered(null); } }}
        style={{ cursor: zoomed !== null ? "zoom-out" : "default" }}
      >
        <g style={{
          transition: "transform 1.2s cubic-bezier(0.22, 1, 0.36, 1), transform-origin 1.2s cubic-bezier(0.22, 1, 0.36, 1)",
          transformOrigin: `${zoomX}px ${zoomY}px`,
          transform: zoomed !== null ? `translate(${translateX}px, ${translateY}px) scale(2.8)` : "translate(0px, 0px) scale(1)"
        }}>

        {/* ── ANIMATED SKY BIRDS ── */}
        <defs>
          <style>{`
            @keyframes flyRL { from { transform: translateX(1600px); } to { transform: translateX(-200px); } }
            @keyframes flyLR { from { transform: translateX(-200px); } to { transform: translateX(1600px); } }
            @keyframes wingFlap {
              0%   { transform: scaleY(1); }
              50%  { transform: scaleY(0.45); }
              100% { transform: scaleY(1); }
            }
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
          `}</style>
        </defs>

        {/* Bird A — large, R→L, slow and majestic */}
        <g transform="translate(0, 32)">
          <g style={{ animation: "flyRL 34s linear -11s infinite" }}>
            <path d="M0,2 C6,-7 13,-7 19,2 C25,-7 32,-7 38,2"
              fill="none" stroke="rgba(255,255,255,0.82)" strokeWidth="2" strokeLinecap="round"
              style={{ transformBox: "fill-box", transformOrigin: "center", animation: "wingFlap 0.9s ease-in-out infinite" }} />
          </g>
        </g>

        {/* Bird B — smaller, L→R, different height */}
        <g transform="translate(0, 58)">
          <g style={{ animation: "flyLR 44s linear -28s infinite" }}>
            <path d="M0,1 C5,-5 10,-5 15,1 C20,-5 25,-5 30,1"
              fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.4" strokeLinecap="round"
              style={{ transformBox: "fill-box", transformOrigin: "center", animation: "wingFlap 1.1s ease-in-out infinite" }} />
          </g>
        </g>

        {/* ── BUILDING WRAPPER ── */}
        <g>
          {/* ── CONNECTOR SHADOW SECTIONS between wings ── */}
        {/* Gap A-B */}
        <rect x={WA[1]} y={WB[2]} width={WB[0]-WA[1]} height={BB-WB[2]} fill="#222" stroke="#444" strokeWidth="0.5" 
          style={{ animation: "growPillar 1.8s cubic-bezier(0.25, 1, 0.5, 1) forwards", transformBox: "fill-box", transformOrigin: "bottom" }} />
        {/* Gap B-C */}
        <rect x={WB[1]} y={WC[2]} width={WC[0]-WB[1]} height={BB-WC[2]} fill="#1a1a1a" stroke="#444" strokeWidth="0.5" 
          style={{ animation: "growPillar 1.8s cubic-bezier(0.25, 1, 0.5, 1) forwards", transformBox: "fill-box", transformOrigin: "bottom" }} />
        {/* Gap C-D */}
        <rect x={WC[1]} y={WD[2]} width={WD[0]-WC[1]} height={BB-WD[2]} fill="#222" stroke="#444" strokeWidth="0.5" 
          style={{ animation: "growPillar 1.8s cubic-bezier(0.25, 1, 0.5, 1) forwards", transformBox: "fill-box", transformOrigin: "bottom" }} />

        {/* ── WINGS (back-to-front order) ── */}
        <Wing l={WB[0]} r={WB[1]} t={WB[2]} hotFloor={hf} onFloorHover={handleFloorHover} onFloorClick={handleFloorClick} />
        <Wing l={WC[0]} r={WC[1]} t={WC[2]} hotFloor={hf} onFloorHover={handleFloorHover} onFloorClick={handleFloorClick} />
        <Wing l={WA[0]} r={WA[1]} t={WA[2]} hotFloor={hf} sideLeft onFloorHover={handleFloorHover} onFloorClick={handleFloorClick} />
        <Wing l={WD[0]} r={WD[1]} t={WD[2]} hotFloor={hf} side onFloorHover={handleFloorHover} onFloorClick={handleFloorClick} />

        {/* ── GAP BRIDGES (fill holes between wing tops) ── */}
        <g style={{ opacity: 0, animation: "dropCrown 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) 1.9s forwards", transformBox: "fill-box", transformOrigin: "bottom" }}>
          {/* Step-down front face: WA→connector */}
          <rect x={WA[1]} y={WA[2]} width={WB[0]-WA[1]} height={WB[2]-WA[2]}
            fill="#bebebe" stroke="#aaa" strokeWidth="0.6" />
          {/* Top bridge: WA → WB */}
          <polygon points={`${WA[1]},${WA[2]} ${WB[0]},${WB[2]} ${WB[0]+DX},${WB[2]+DY} ${WA[1]+DX},${WA[2]+DY}`}
            fill="#cacaca" stroke="#aaa" strokeWidth="0.7" />

          {/* Top bridge: WB → WC */}
          <polygon points={`${WB[1]},${WB[2]} ${WC[0]},${WC[2]} ${WC[0]+DX},${WC[2]+DY} ${WB[1]+DX},${WB[2]+DY}`}
            fill="#cacaca" stroke="#aaa" strokeWidth="0.7" />

          {/* Step-up front face: WC→WD */}
          <rect x={WC[1]} y={WD[2]} width={WD[0]-WC[1]} height={WC[2]-WD[2]}
            fill="#bebebe" stroke="#aaa" strokeWidth="0.6" />
          {/* Top bridge: WC → WD */}
          <polygon points={`${WC[1]},${WC[2]} ${WD[0]},${WD[2]} ${WD[0]+DX},${WD[2]+DY} ${WC[1]+DX},${WC[2]+DY}`}
            fill="#cacaca" stroke="#aaa" strokeWidth="0.7" />
        </g>


        {/* ── GROUND LINE ── */}
        <line x1={WA[0]-60} x2={WD[1]+DX+60} y1={BB} y2={BB} stroke="#888" strokeWidth="1.6" />
        <line x1={WD[1]} x2={WD[1]+DX} y1={BB} y2={BB+DY} stroke="#888" strokeWidth="1.2" />
        {/* Entrance */}
        <rect x={WB[0]+15} y={BB-40} width={WC[1]-WB[0]-30} height={40} fill="#ccc" stroke="#aaa" strokeWidth="0.8" />
        <rect x={WB[0]+22} y={BB-38} width={40} height={38} fill="#aaa" stroke="#999" strokeWidth="0.5" />
        <rect x={WC[1]-62} y={BB-38} width={40} height={38} fill="#aaa" stroke="#999" strokeWidth="0.5" />
        <path d={`M ${WB[0]+15},${BB-40} Q ${(WB[0]+WC[1])/2},${BB-52} ${WC[1]-15},${BB-40}`}
          fill="none" stroke="#bbb" strokeWidth="1" />

        {/* ── PROJECT NODES + CALLOUTS ── */}
        {PROJECTS.map((p, i) => {
          const isH = hovered === i;
          const isL = p.side === "L";
          const nx = p.nodeX, ny = p.nodeY;
          const midX = isL ? nx - 55 : nx + 55;
          const endX = isL ? nx - 165 : nx + 105;
          const cardX = isL ? endX - 193 : endX;
          let cardY = ny - 40;
          let lineEndY = ny + (isL ? -4 : 4);
          
          // If card goes past the bottom frame, shift it up and angle the line
          if (cardY + 232 > 760) {
            cardY = 760 - 232;
            lineEndY = cardY + 36;
          }

          return (
            <g key={p.id} style={{ cursor: "pointer" }}
              onMouseEnter={() => { if (zoomed === null) setHovered(i); }}
              onMouseLeave={() => { if (zoomed === null) setHovered(null); }}
              onClick={(e) => {
                if (zoomed === null) {
                  e.stopPropagation();
                  setHovered(i);
                  setZoomed(i);
                }
              }}>

              {/* node */}
              <rect x={isL ? nx - 5 : nx - 2} y={ny - 4} width={7} height={7}
                fill={isH ? "#F59E0B" : "#111"} stroke={isH ? "#F59E0B" : "#ccc"} strokeWidth="1.2"
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
                  points={`${nx},${ny} ${midX},${ny + (isL ? -4 : 4)} ${endX},${lineEndY}`}
                  fill="none" stroke="#ddd" strokeWidth="0.9" />
              )}

              {/* hover card */}
              {isH && (
                <foreignObject x={cardX} y={cardY} width="193" height="232">
                  <div xmlns="http://www.w3.org/1999/xhtml" style={{ fontFamily: "'Inter',sans-serif", overflow: "hidden", borderRadius: "3px", border: "1px solid #2a2a2a", boxShadow: "0 12px 40px rgba(0,0,0,0.85)" }}>

                    {/* ── Dark top: architectural grid + category + title ── */}
                    <div style={{ background: "#0d0d0d", padding: "0", position: "relative", height: "112px", overflow: "hidden" }}>
                      {/* grid lines */}
                      <svg width="193" height="72" style={{ position: "absolute", top: "0", left: "0", opacity: 0.2 }} viewBox="0 0 193 72">
                        <line x1="64" y1="0" x2="64" y2="72" stroke="#fff" strokeWidth="0.5"/>
                        <line x1="128" y1="0" x2="128" y2="72" stroke="#fff" strokeWidth="0.5"/>
                        <line x1="0" y1="24" x2="193" y2="24" stroke="#fff" strokeWidth="0.5"/>
                        <line x1="0" y1="48" x2="193" y2="48" stroke="#fff" strokeWidth="0.5"/>
                        <rect x="6" y="4" width="50" height="16" fill="none" stroke="#fff" strokeWidth="0.8" rx="1"/>
                        <rect x="6" y="28" width="50" height="16" fill="none" stroke="#fff" strokeWidth="0.8" rx="1"/>
                        <rect x="6" y="52" width="50" height="16" fill="none" stroke="#fff" strokeWidth="0.8" rx="1"/>
                        <rect x="70" y="4" width="50" height="16" fill="none" stroke="#fff" strokeWidth="0.8" rx="1"/>
                        <rect x="70" y="28" width="50" height="16" fill="none" stroke="#fff" strokeWidth="0.8" rx="1"/>
                        <rect x="134" y="4" width="24" height="16" fill="none" stroke="#fff" strokeWidth="0.6" rx="1"/>
                        <rect x="162" y="4" width="24" height="16" fill="none" stroke="#fff" strokeWidth="0.6" rx="1"/>
                        <rect x="134" y="28" width="24" height="16" fill="none" stroke="#fff" strokeWidth="0.6" rx="1"/>
                        <rect x="162" y="28" width="24" height="16" fill="none" stroke="#fff" strokeWidth="0.6" rx="1"/>
                      </svg>
                      {/* category pill */}
                      <div style={{ position: "absolute", bottom: "30px", left: "10px" }}>
                        <span style={{ border: "1px solid #555", borderRadius: "99px", padding: "2px 9px", fontSize: "7px", color: "#bbb", letterSpacing: "0.14em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{p.cat}</span>
                      </div>
                      {/* title */}
                      <div style={{ position: "absolute", bottom: "8px", left: "10px", right: "8px" }}>
                        <div style={{ fontSize: "12px", fontWeight: 600, color: "#ffffff", lineHeight: 1.25, letterSpacing: "-0.01em" }}>{p.title}</div>
                      </div>
                    </div>

                    {/* ── Light bottom: metadata + status + cta ── */}
                    <div style={{ background: "#f7f7f7", padding: "9px 10px 10px" }}>
                      {/* metadata row */}
                      <div style={{ display: "flex", gap: "0", marginBottom: "8px", paddingBottom: "8px", borderBottom: "1px solid #e2e2e2" }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: "6.5px", color: "#999", textTransform: "uppercase", letterSpacing: "0.1em" }}>Type</div>
                          <div style={{ fontSize: "10px", color: "#111", fontWeight: 600, marginTop: "2px" }}>{p.cat}</div>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: "6.5px", color: "#999", textTransform: "uppercase", letterSpacing: "0.1em" }}>Location</div>
                          <div style={{ fontSize: "10px", color: "#111", fontWeight: 600, marginTop: "2px" }}>Mumbai</div>
                        </div>
                      </div>
                      {/* tag pill */}
                      <div style={{ marginBottom: "8px" }}>
                        <span style={{ border: "1px solid #ccc", borderRadius: "99px", padding: "2px 8px", fontSize: "7px", color: "#444", marginRight: "4px" }}>{p.cat}</span>
                        <span style={{ border: "1px solid #ccc", borderRadius: "99px", padding: "2px 8px", fontSize: "7px", color: "#444" }}>Architecture</span>
                      </div>
                      {/* status + cta */}
                        <div 
                          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
                          onClick={(e) => { e.stopPropagation(); router.push(`/projects/${p.slug}`); }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22c55e", flexShrink: 0 }} />
                            <span style={{ fontSize: "7.5px", color: "#555" }}>Completed</span>
                          </div>
                          <span style={{ fontSize: "7.5px", color: "#F59E0B", letterSpacing: "0.06em", fontWeight: 600 }}>View project →</span>
                        </div>
                    </div>

                  </div>
                </foreignObject>
              )}
            </g>
          );
        })}
        </g>
        </g>
      </svg>
    </div>
  );
}
