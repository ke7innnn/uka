"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

/* ── Building geometry (Golden Skyscraper 2.5D Volumetric) ─────────────────────────── */
const BB = 730;          // ground line
const FH = 22;           // floor height (increased for slender, taller look)
const FLOORS = 25;       // Number of tower floors
const PODIUM_H = 220;    // podium height
const TOWER_TOP = BB - PODIUM_H - (FLOORS * FH); // 730 - 220 - 550 = -40
const DY_TOP = 15;       // Top-face 3D depth

// Left Wing
const L_L = 495;
const L_R = 665;
// Central Core
const C_L = 665;
const C_R = 735;
// Right Wing
const R_L = 735;
const R_R = 905;

// Legacy constants mapping for interaction lines
const WA = [L_L, L_R, TOWER_TOP]; 
const WD = [R_L, R_R, TOWER_TOP];
const DX = 0;
const DY = 0;

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

const BH = FLOORS * FH;
const PROJECTS = RAW.map((p, i) => {
  const baseY = TOWER_TOP + (i / (RAW.length - 1)) * BH;
  const floorIdx = Math.min(Math.floor((baseY - TOWER_TOP) / FH), FLOORS - 1);
  const isL = p.side === "L";
  return {
    ...p, baseY, floorIdx,
    nodeX: isL ? L_L - 32 : R_R + 32,
    nodeY: baseY,
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

/* ── Golden Skyscraper Renderer ────────────────────────── */
function GoldenSkyscraper({ hotFloor, onFloorHover, onFloorClick }: {
  hotFloor: number | null;
  onFloorHover: (f: number | null) => void;
  onFloorClick: (f: number) => void;
}) {
  return (
    <g>
      <defs>
        <linearGradient id="goldGradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#dcdcdc" />
          <stop offset="35%" stopColor="#fafafa" />
          <stop offset="70%" stopColor="#cfcfcf" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>
        <linearGradient id="bronzeGradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#a8a8a8" />
          <stop offset="50%" stopColor="#dedede" />
          <stop offset="100%" stopColor="#808080" />
        </linearGradient>
        
        {/* Cylindrical Core Gradient: Dark edges, bright center highlight */}
        <linearGradient id="cylinderGlass" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(30, 60, 80, 0.95)" />
          <stop offset="25%" stopColor="rgba(100, 160, 190, 0.8)" />
          <stop offset="50%" stopColor="rgba(255, 255, 255, 0.95)" />
          <stop offset="75%" stopColor="rgba(100, 160, 190, 0.8)" />
          <stop offset="100%" stopColor="rgba(30, 60, 80, 0.95)" />
        </linearGradient>

        {/* Elevator Car Gradient */}
        <linearGradient id="elevatorGold" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#666666" />
          <stop offset="50%" stopColor="#f0f0f0" />
          <stop offset="100%" stopColor="#666666" />
        </linearGradient>
        
        {/* Recessed Dark Background for Left Louvers */}
        <linearGradient id="recessedDark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1A1510" />
          <stop offset="100%" stopColor="#0F0C08" />
        </linearGradient>

        {/* Storefront Illuminated Interior */}
        <linearGradient id="storeIllum" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="100%" stopColor="#FEFCE8" />
        </linearGradient>

        <filter id="shadowBlur">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>

      {/* ── COMMERCIAL PODIUM BASE (2.5D Volumetric) ── */}
      <g style={{ animation: "growPillar 1.5s cubic-bezier(0.25, 1, 0.5, 1) forwards", transformBox: "fill-box", transformOrigin: "bottom" }}>
        
        {/* Podium Top Roof Deck (Garden Deck, dark green tint, skewed back) */}
        <polygon 
          points={`425,${BB - PODIUM_H} 975,${BB - PODIUM_H} 975,${BB - PODIUM_H - DY_TOP} 425,${BB - PODIUM_H - DY_TOP}`} 
          fill="#334230" stroke="#222" strokeWidth="0.5" 
        />
        {/* Glass Safety Railing along the top edge */}
        <polygon 
          points={`425,${BB - PODIUM_H} 975,${BB - PODIUM_H} 975,${BB - PODIUM_H - 12} 425,${BB - PODIUM_H - 12}`} 
          fill="rgba(160, 210, 240, 0.25)" stroke="rgba(255, 255, 255, 0.6)" strokeWidth="0.5"
        />
        
        {/* Main Base Front Block */}
        <rect x={425} y={BB - PODIUM_H} width={550} height={PODIUM_H} fill="url(#bronzeGradient)" />
        
        {/* ── LEFT SECTION: Vertical Louvers ── */}
        <g>
          {/* Deep Recessed Background */}
          <rect x={445} y={BB - PODIUM_H + 30} width={340} height={140} fill="url(#recessedDark)" />
          {/* Vertical Gold Slats Loop */}
          {Array.from({ length: 18 }).map((_, i) => (
            <rect key={`louver-${i}`} x={449 + i * 19} y={BB - PODIUM_H + 30} width={6} height={140} fill="url(#goldGradient)" stroke="#777777" strokeWidth="0.5" />
          ))}
        </g>
        
        {/* ── RIGHT SECTION: Open-Air Parking Garage ── */}
        <g>
          {/* Deep background to simulate interior volume */}
          <rect x={805} y={BB - PODIUM_H + 30} width={150} height={140} fill="#0A0805" />
          {/* 4 Distinct Parking Floors */}
          {Array.from({ length: 4 }).map((_, i) => {
            const slabY = BB - PODIUM_H + 30 + i * 35;
            return (
              <g key={`park-${i}`}>
                {/* Slab top face (deep perspective) */}
                <polygon 
                  points={`805,${slabY + 20} 955,${slabY + 20} 955,${slabY + 20 - 5} 805,${slabY + 20 - 5}`} 
                  fill="#b0b0b0" 
                />
                
                {/* Tiny Parked Car Silhouettes */}
                {i < 3 && i % 2 === 0 && <rect x={825} y={slabY + 15} width={16} height={5} fill="#a8b2b8" rx="2" />}
                {i < 3 && i % 2 !== 0 && <rect x={905} y={slabY + 15} width={16} height={5} fill="#cccccc" rx="2" />}
                {i < 3 && i % 2 === 0 && <rect x={865} y={slabY + 15} width={16} height={5} fill="#3a4047" rx="2" />}

                {/* Slab front face */}
                <rect x={805} y={slabY + 20} width={150} height={15} fill="url(#goldGradient)" stroke="#777777" strokeWidth="0.5" />
              </g>
            );
          })}
        </g>
        
        {/* ── GROUND LEVEL: Luxury Retail Storefronts ── */}
        <g>
          {/* Overall retail cutout background (warm illuminated interior) */}
          <rect x={435} y={BB - 50} width={530} height={50} fill="url(#storeIllum)" />
          
          {/* Shopfronts Loop */}
          {Array.from({ length: 10 }).map((_, i) => {
            const shopW = 530 / 10;
            const shopX = 435 + i * shopW;
            return (
              <g key={`shop-${i}`}>
                {/* Large Glass Panel */}
                <rect x={shopX + 2} y={BB - 46} width={shopW - 4} height={46} fill="rgba(160, 210, 240, 0.45)" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="0.5" />
                {/* Pylon Column separating shops */}
                <rect x={shopX + shopW - 3} y={BB - 50} width={6} height={50} fill="url(#bronzeGradient)" stroke="#222" strokeWidth="0.5" />
              </g>
            );
          })}
          {/* Leftmost starting pylon */}
          <rect x={432} y={BB - 50} width={6} height={50} fill="url(#bronzeGradient)" stroke="#222" strokeWidth="0.5" />
        </g>

        {/* Thick ground foundation line */}
        <line x1={300} x2={1100} y1={BB} y2={BB} stroke="#222" strokeWidth={5} />
      </g>

      {/* ── TOWER WINGS (Back Recessed Wall) ── */}
      {/* We draw the recessed interior background for both wings first so they sit behind everything */}
      {[0, 1].map((wingIdx) => {
        const isLeft = wingIdx === 0;
        const l = isLeft ? L_L : R_L;
        const r = isLeft ? L_R : R_R;
        return (
          <rect key={wingIdx} x={l + 5} y={TOWER_TOP} width={r - l - 10} height={BB - PODIUM_H - TOWER_TOP} fill="#1a1816" 
            style={{ animation: "growPillar 1.8s cubic-bezier(0.25, 1, 0.5, 1) forwards", transformBox: "fill-box", transformOrigin: "bottom" }} />
        );
      })}

      {/* ── CENTRAL CORE (Cylindrical Glass Shaft) ── */}
      <g style={{ animation: "growPillar 2s cubic-bezier(0.25, 1, 0.5, 1) forwards", transformBox: "fill-box", transformOrigin: "bottom" }}>
        {/* The main cylindrical glass body */}
        <rect x={C_L} y={TOWER_TOP - DY_TOP} width={C_R - C_L} height={BB - PODIUM_H - TOWER_TOP + DY_TOP} fill="url(#cylinderGlass)" />
        {/* Horizontal structural rings */}
        {Array.from({ length: Math.floor(FLOORS / 2) }).map((_, i) => (
          <line key={i} x1={C_L} y1={TOWER_TOP + (i * FH * 2)} x2={C_R} y2={TOWER_TOP + (i * FH * 2)} stroke="rgba(255,255,255,0.7)" strokeWidth={1.5} />
        ))}
        {/* Elevator Car (Detailed metallic block) */}
        <g transform={`translate(0, ${TOWER_TOP + 180})`}>
          <rect x={C_L + 12} y={0} width={(C_R - C_L) - 24} height={40} fill="url(#elevatorGold)" rx={2} stroke="#fff" strokeWidth="0.8" />
          <line x1={C_L + 16} y1={10} x2={C_R - 16} y2={10} stroke="#555555" strokeWidth="1" />
          <line x1={C_L + 16} y1={20} x2={C_R - 16} y2={20} stroke="#555555" strokeWidth="1" />
          <line x1={C_L + 16} y1={30} x2={C_R - 16} y2={30} stroke="#555555" strokeWidth="1" />
          {/* Elevator glass door */}
          <rect x={C_L + 25} y={5} width={(C_R - C_L) - 50} height={30} fill="rgba(40, 80, 100, 0.8)" rx={1} />
        </g>
        
        {/* Central Core Cap (Metallic Rounded Rectangle) */}
        <g style={{ animation: "dropCrown 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) 1.8s forwards", opacity: 0, transformBox: "fill-box", transformOrigin: "bottom" }}>
          <rect x={C_L + 2} y={TOWER_TOP - DY_TOP - 8} width={(C_R - C_L) - 4} height={12} fill="url(#bronzeGradient)" rx="4" />
          <rect x={C_L + 6} y={TOWER_TOP - DY_TOP - 12} width={(C_R - C_L) - 12} height={8} fill="url(#goldGradient)" rx="2" />
        </g>
      </g>

      {/* ── TOWER WINGS (Volumetric Balconies & Crowns) ── */}
      {[0, 1].map((wingIdx) => {
        const isLeft = wingIdx === 0;
        const l = isLeft ? L_L : R_L;
        const r = isLeft ? L_R : R_R;
        const cx = (l + r) / 2;
        
        // Extended balcony bounds for a deep wrap-around pop beyond the building silhouette
        const b_l = isLeft ? l - 24 : l;
        const b_r = isLeft ? r : r + 24;
        const b_cx = isLeft ? b_l + (b_r - b_l) * 0.6 : b_l + (b_r - b_l) * 0.4;
        
        const curveD = 28; // Deep rounded bulge
        const slabYOffset = 10;
        
        const CF_L = l - 5;
        const CF_R = isLeft ? C_L : r + 5;
        const CF_CX = cx;
        const C_DX = isLeft ? 12 : -12;
        const C_DY = -8;
        const C_H = 30; // Crown vertical height offset
        
        return (
          <g key={wingIdx}>
            {/* Floors Loop (3D Layered Paths) */}
            {Array.from({ length: FLOORS }).map((_, f) => {
              const fy = TOWER_TOP + f * FH;
              const hot = hotFloor !== null && f === hotFloor;
              const delay = (FLOORS - 1 - f) * 0.055; // Bottom-up stagger
              
              return (
                <g key={f} style={{ opacity: 0, animation: `popFloor 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${delay}s forwards`, transformBox: "fill-box", transformOrigin: "bottom" }}>
                  
                  {/* 0. Top Balcony Ceiling (only for the very top floor, f === 0) */}
                  {f === 0 && (
                     <g>
                       <path 
                         d={`M ${b_l},${fy} Q ${b_cx},${fy + curveD} ${b_r},${fy} L ${b_r},${fy - 8} Q ${b_cx},${fy + curveD - 8} ${b_l},${fy - 8} Z`}
                         fill="#f5f5f5"
                       />
                       <path 
                         d={`M ${b_l},${fy} Q ${b_cx},${fy + curveD} ${b_r},${fy} L ${b_r},${fy - 2} Q ${b_cx},${fy + curveD - 2} ${b_l},${fy - 2} Z`}
                         fill="#cccccc"
                       />
                       {Array.from({ length: 9 }).map((_, lightIdx) => {
                         const t = (lightIdx + 1) / 10;
                         const lx = (1-t)*(1-t)*b_l + 2*(1-t)*t*b_cx + t*t*b_r;
                         const ly = (1-t)*(1-t)*fy + 2*(1-t)*t*(fy + curveD) + t*t*fy - 4;
                         return <circle key={`light-${lightIdx}`} cx={lx} cy={ly} r={2.5} fill="url(#storeIllum)" />;
                       })}
                     </g>
                  )}

                  {/* 1. Recessed Interior Crescent (Deep shadow behind glass, bound strictly to inner pillars) */}
                  <path 
                    d={`M ${l},${fy - slabYOffset} Q ${cx},${fy + curveD/2 - slabYOffset} ${r},${fy - slabYOffset} L ${r},${fy - FH} L ${l},${fy - FH} Z`}
                    fill="rgba(10, 10, 10, 0.85)"
                  />
                  
                  {/* 1.5 Cast Shadow (Casts a shadow onto the floor below) */}
                  <path 
                    d={`M ${b_l},${fy + 3} Q ${b_cx},${fy + curveD + 3} ${b_r},${fy + 3} L ${b_r},${fy + 14} Q ${b_cx},${fy + curveD + 14} ${b_l},${fy + 14} Z`}
                    fill="rgba(0,0,0,0.3)" filter="url(#shadowBlur)"
                  />

                  {/* INTERACTIVE 3D BALCONY GROUP (Triggered by hotFloor state) */}
                  <g 
                    className="balcony-floor"
                    style={{
                      transform: hot ? "scaleX(1.04) scaleY(1.02)" : "scale(1)",
                      transformOrigin: isLeft ? `${r}px ${fy}px` : `${l}px ${fy}px`,
                      transition: "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                    }}
                  >
                    {/* Layer A: Underside Shadow */}
                    <path 
                      d={`M ${b_l},${fy + 2} Q ${b_cx},${fy + curveD + 2} ${b_r},${fy + 2} L ${b_r},${fy + 5} Q ${b_cx},${fy + curveD + 5} ${b_l},${fy + 5} Z`}
                      fill="#555555"
                    />

                    {/* Layer B: Solid Floor Slab (3px lip) */}
                    <path 
                      d={`M ${b_l},${fy} Q ${b_cx},${fy + curveD} ${b_r},${fy} L ${b_r},${fy + 3} Q ${b_cx},${fy + curveD + 3} ${b_l},${fy + 3} Z`}
                      fill="url(#goldGradient)" 
                    />

                    {/* Top Surface of Slab (Perspective depth connecting outer lip back to inner wall) */}
                    <path 
                      d={`M ${l},${fy - slabYOffset} Q ${cx},${fy + curveD/2 - slabYOffset} ${r},${fy - slabYOffset} L ${b_r},${fy} Q ${b_cx},${fy + curveD} ${b_l},${fy} Z`}
                      fill="#f0f0f0" 
                    />

                    {/* Layer C: Floating Glass Railing */}
                    <path 
                      d={`M ${b_l + 2},${fy - FH + 10} Q ${b_cx},${fy + curveD - FH + 10} ${b_r - 2},${fy - FH + 10} L ${b_r - 2},${fy} Q ${b_cx},${fy + curveD} ${b_l + 2},${fy} Z`}
                      fill="rgba(160, 210, 240, 0.35)"
                    />
                    
                    {/* White specular highlight on the outermost curved edge */}
                    <path 
                      d={`M ${b_l + 2},${fy} Q ${b_cx},${fy + curveD} ${b_r - 2},${fy}`}
                      fill="none" stroke="#fff" strokeWidth={1.2}
                    />

                    {/* Amber highlight overlay when active */}
                    <path 
                      d={`M ${b_l + 2},${fy - FH + 10} Q ${b_cx},${fy + curveD - FH + 10} ${b_r - 2},${fy - FH + 10} L ${b_r - 2},${fy} Q ${b_cx},${fy + curveD} ${b_l + 2},${fy} Z`}
                      fill="#F59E0B"
                      style={{ opacity: hot ? 0.35 : 0, transition: "opacity 0.3s" }}
                    />
                    
                    {/* Invisible Hitbox for Interaction */}
                    <path 
                      d={`M ${b_l},${fy - FH + 5} Q ${b_cx},${fy + curveD - FH + 5} ${b_r},${fy - FH + 5} L ${b_r},${fy + 5} Q ${b_cx},${fy + curveD + 5} ${b_l},${fy + 5} Z`}
                      fill="transparent"
                      style={{ cursor: "pointer" }}
                      onMouseEnter={() => onFloorHover(f)}
                      onMouseLeave={() => onFloorHover(null)}
                      onClick={() => onFloorClick(f)}
                    />
                  </g>

                  {/* 6. Scattered Organic Greenery (Potted Plants) */}
                  {!hot && (
                    <g>
                      <g transform={`translate(${l + 35}, ${fy + (curveD * 0.5) - slabYOffset + 2})`}><path d="M -2,-2 L 2,-2 L 1,2 L -1,2 Z" fill="#8c6230" /><circle cx={0} cy={-5} r={3} fill="#4d6f43" /><circle cx={-2} cy={-4} r={2} fill="#3a5a30" /><circle cx={2} cy={-4} r={2} fill="#5a7a4f" /></g>
                      <g transform={`translate(${cx}, ${fy + curveD - slabYOffset + 2})`}><path d="M -3,-2 L 3,-2 L 2,2 L -2,2 Z" fill="#8c6230" /><circle cx={0} cy={-5} r={4} fill="#4d6f43" /><circle cx={-3} cy={-4} r={3} fill="#3a5a30" /><circle cx={3} cy={-4} r={3} fill="#5a7a4f" /></g>
                      <g transform={`translate(${r - 35}, ${fy + (curveD * 0.5) - slabYOffset + 2})`}><path d="M -2,-2 L 2,-2 L 1,2 L -1,2 Z" fill="#8c6230" /><circle cx={0} cy={-5} r={3} fill="#4d6f43" /><circle cx={-2} cy={-4} r={2} fill="#3a5a30" /><circle cx={2} cy={-4} r={2} fill="#5a7a4f" /></g>
                    </g>
                  )}
                </g>
              );
            })}
            
            {/* Outer structural pillars merging into crowns */}
            <rect x={l - 5} y={TOWER_TOP} width={8} height={BB - PODIUM_H - TOWER_TOP} fill="url(#goldGradient)" stroke="#777777" strokeWidth="0.5"
              style={{ animation: "growPillar 1.8s cubic-bezier(0.25, 1, 0.5, 1) forwards", transformBox: "fill-box", transformOrigin: "bottom" }} />
            <rect x={r - 3} y={TOWER_TOP} width={8} height={BB - PODIUM_H - TOWER_TOP} fill="url(#goldGradient)" stroke="#777777" strokeWidth="0.5"
              style={{ animation: "growPillar 1.8s cubic-bezier(0.25, 1, 0.5, 1) forwards", transformBox: "fill-box", transformOrigin: "bottom" }} />

            {/* ── VOLUMETRIC CROWNS (Bow-tie structure with supporting columns) ── */}
            <g style={{ opacity: 0, animation: "dropCrown 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) 1.9s forwards", transformBox: "fill-box", transformOrigin: "bottom" }}>
              
              {/* Drop Shadow onto top floor */}
              <path 
                d={`M ${CF_L},${TOWER_TOP - 20} L ${CF_L},${TOWER_TOP - 55} Q ${CF_CX},${TOWER_TOP - 35} ${CF_R},${TOWER_TOP - 55} L ${CF_R},${TOWER_TOP - 20} Q ${CF_CX},${TOWER_TOP - 5} ${CF_L},${TOWER_TOP - 20} Z`}
                fill="rgba(0,0,0,0.6)" filter="url(#shadowBlur)"
              />

              {/* Supporting Volumetric Columns */}
              {[CF_L + 15, CF_CX - 25, CF_CX + 25, CF_R - 15].map((colX, i) => (
                <g key={`col-${i}`}>
                  {/* Column Body */}
                  <rect x={isLeft ? colX : colX - 6} y={TOWER_TOP - C_H} width={6} height={C_H} fill="url(#goldGradient)" stroke="#777777" strokeWidth="0.5" />
                  {/* Column Base/Cap */}
                  <rect x={isLeft ? colX - 2 : colX - 8} y={TOWER_TOP - 2} width={10} height={4} fill="url(#bronzeGradient)" />
                  <rect x={isLeft ? colX - 2 : colX - 8} y={TOWER_TOP - C_H} width={10} height={4} fill="url(#bronzeGradient)" />
                </g>
              ))}

              {/* Thick Pergola Slats (Programmatic loop underneath the crown) */}
              {Array.from({ length: 14 }).map((_, i) => {
                const slatX = CF_L + 15 + i * ((CF_R - CF_L - 30) / 13);
                const t = i / 13;
                const yBase = (1-t)*(1-t)*(TOWER_TOP - C_H + 5) + 2*(1-t)*t*(TOWER_TOP - C_H + 20) + t*t*(TOWER_TOP - C_H + 5);
                return (
                  <g key={`slat-${i}`}>
                    {/* Slat Side Face (Darker shading) */}
                    <polygon points={`${slatX},${yBase} ${slatX + 3},${yBase - 3} ${slatX + 3},${yBase + 12} ${slatX},${yBase + 15}`} fill="#555555" />
                    {/* Slat Front Face */}
                    <rect x={slatX} y={yBase} width={3} height={15} fill="url(#bronzeGradient)" />
                  </g>
                );
              })}

              {/* Side Shading Face (Outer Edge for depth) */}
              <path 
                d={`M ${isLeft ? CF_L : CF_R},${TOWER_TOP - C_H + 5} L ${isLeft ? CF_L : CF_R},${TOWER_TOP - C_H - 35} L ${isLeft ? CF_L + C_DX : CF_R + C_DX},${TOWER_TOP - C_H - 35 + C_DY} L ${isLeft ? CF_L + C_DX : CF_R + C_DX},${TOWER_TOP - C_H + 5 + C_DY} Z`}
                fill="#9c9c9c" stroke="#555555" strokeWidth="0.5"
              />

              {/* Solid Top Roof Plane (Diamond/skewed polygon for 2.5D top-down view) */}
              <path 
                d={`M ${CF_L},${TOWER_TOP - C_H - 35} L ${CF_L + C_DX},${TOWER_TOP - C_H - 35 + C_DY} Q ${CF_CX + C_DX},${TOWER_TOP - C_H - 15 + C_DY} ${CF_R + C_DX},${TOWER_TOP - C_H - 35 + C_DY} L ${CF_R},${TOWER_TOP - C_H - 35} Q ${CF_CX},${TOWER_TOP - C_H - 15} ${CF_L},${TOWER_TOP - C_H - 35} Z`}
                fill="#f0f0f0" stroke="#b0b0b0" strokeWidth="0.5"
              />

              {/* Heavy Solid Crown (Front Face Bow-tie) */}
              <path 
                d={`M ${CF_L},${TOWER_TOP - C_H + 5} L ${CF_L},${TOWER_TOP - C_H - 35} Q ${CF_CX},${TOWER_TOP - C_H - 15} ${CF_R},${TOWER_TOP - C_H - 35} L ${CF_R},${TOWER_TOP - C_H + 5} Q ${CF_CX},${TOWER_TOP - C_H + 20} ${CF_L},${TOWER_TOP - C_H + 5} Z`}
                fill="url(#goldGradient)" stroke="#777777" strokeWidth="1.5"
              />

            </g>
          </g>
        );
      })}
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

      <svg viewBox="0 -130 1400 920" className="w-full h-full" preserveAspectRatio="xMidYMid meet"
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
          <GoldenSkyscraper hotFloor={hf} onFloorHover={handleFloorHover} onFloorClick={handleFloorClick} />
        </g>

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
      </svg>
    </div>
  );
}
