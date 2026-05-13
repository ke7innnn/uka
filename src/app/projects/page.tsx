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

const PHOTO_IDS = [
  "1600585154340-be6161a56a0c","1600596542815-ffad4c1539a9",
  "1600607687939-ce8a6c25118c","1486406146926-c627a92ad1ab",
  "1545324418-cc1a3fa10c00","1512917774080-9991f1c4c750",
  "1558618666-fcd25c85cd64","1449824913935-59a10b8d2000",
  "1580587771525-78b9dba3b914","1497366216548-37526070297c",
  "1497366754035-f200586c4a16","1497366811353-6870744d04b2",
  "1431576901776-e539bd916ba2","1486325212027-8081e485255e",
  "1519999482648-25049ddd37b1","1478476868527-bb19f5d68b37",
  "1494145904049-0dca59b4bbad","1505843490701-d60d2f08ee02",
  "1568605114967-8130f3a36994","1464082354059-0e3d0cfd76cf",
  "1479839672679-a46cb5e2d4bc","1470723272604-efd9a2e5776a",
  "1513584684374-8bab748fbf90","1415796994537-5ee154fc4e80",
  "1507003211169-0a1dd7228f2d"
];

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
      style={{ backgroundImage: 'url("/project%20building%20bg/building%20background.png")', backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
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
          `}</style>
        </defs>

        {/* ── PALE SKETCH SUN (Top Right) ── */}
        <g style={{ animation: "flyInSun 2.5s cubic-bezier(0.22, 1, 0.36, 1) forwards" }}>
          <g>
            <animateTransform attributeName="transform" type="translate" values="1200,150; 1210,140; 1200,150" dur="20s" repeatCount="indefinite" />
            
            {/* Scale down by 1.4x (1 / 1.4 = ~0.71) */}
            <g transform="scale(0.71)">
              {/* Very slow rotation for the whole sun to make it dynamic */}
              <g>
                <animateTransform attributeName="transform" type="rotate" values="0; 360" dur="180s" repeatCount="indefinite" />

                {/* Straight rays (Outer) */}
                {Array.from({ length: 24 }).map((_, i) => {
                  const isLong = i % 2 === 0;
                  return (
                    <line key={`ray-${i}`} 
                      x1="0" y1="-35" 
                      x2="0" y2={isLong ? "-95" : "-65"} 
                      stroke="rgba(255,255,255,0.35)" 
                      strokeWidth="1.2" 
                      strokeLinecap="round"
                      transform={`rotate(${i * (360 / 24)})`} 
                    />
                  );
                })}

                {/* Wavy rays (Inner) */}
                {Array.from({ length: 16 }).map((_, i) => (
                  <path key={`wave-${i}`} 
                    d="M 0 -26 Q 10 -40 0 -50 T -5 -70" 
                    fill="none" 
                    stroke="rgba(255,255,255,0.7)" 
                    strokeWidth="1.8" 
                    strokeLinecap="round"
                    transform={`rotate(${i * (360 / 16)})`} 
                  />
                ))}

                {/* Central sketch rings */}
                {/* Multiple rings to give that hand-drawn, chalky look */}
                <circle cx="0" cy="0" r="26" fill="#0a0a0a" stroke="rgba(255,255,255,0.8)" strokeWidth="2.5" />
                <circle cx="0" cy="0" r="24.5" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
                <circle cx="0" cy="0" r="28" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeDasharray="4 3" />
              </g>
            </g>
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

              {/* hover card in pure SVG to fix Safari zoom bugs */}
              {isH && (
                <g transform={`translate(${cardX}, ${cardY})`}>
                  {/* Outer border & shadow (simulated) */}
                  <rect x="0" y="0" width="193" height="232" fill="#0d0d0d" stroke="#2a2a2a" strokeWidth="1" rx="3" />
                  
                  {/* Image in the empty space (dark top) */}
                  <clipPath id={`clip-img-${p.id}`}>
                    <rect x="1" y="1" width="191" height="112" rx="2" />
                  </clipPath>
                  <image 
                    href={`https://images.unsplash.com/photo-${PHOTO_IDS[i % 25]}?q=80&w=400&auto=format&fit=crop`} 
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
                  <text x="177" y="217" fill="#F59E0B" fontSize="8" fontWeight="600" fontFamily="'Inter', sans-serif" textAnchor="end" style={{ cursor: "pointer" }} onClick={(e) => { e.stopPropagation(); router.push(`/projects/${p.slug}`); }}>View project →</text>
                  
                  {/* Invisible click target for the CTA */}
                  <rect x="110" y="200" width="80" height="30" fill="transparent" style={{ cursor: "pointer" }} onClick={(e) => { e.stopPropagation(); router.push(`/projects/${p.slug}`); }} />
                </g>
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
