"use client";
import { useState, useEffect, useRef } from "react";
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
const L_R = 673;
// Central Core
const C_L = 673;
const C_R = 727;
// Right Wing
const R_L = 727;
const R_R = 905;


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
const IMAGE_TOP_Y = -15; // Set exactly at the last residential floor balcony
const IMAGE_BOTTOM_Y = 465; // Set exactly at the first residential floor balcony above podium
const PROJECTS = RAW.map((p, i) => {
  const baseY = IMAGE_TOP_Y + (i / (RAW.length - 1)) * (IMAGE_BOTTOM_Y - IMAGE_TOP_Y);
  const floorIdx = Math.min(Math.floor((baseY - TOWER_TOP) / FH), FLOORS - 1);
  const isL = p.side === "L";
  return {
    ...p, baseY, floorIdx,
    nodeX: isL ? 612 : 788,
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
      {/* ── CENTRAL CORE SHAFT (Rendered in Background so Podium Blocks can Overlap/Cover it) ── */}
      <g style={{ transform: "scaleY(0)", animation: "growPillar 2s cubic-bezier(0.25, 1, 0.5, 1) 2.1s forwards", transformOrigin: "0px 730px", pointerEvents: "none" }}>
        {/* Main cylindrical glass shaft extending ALL the way to the ground, overlapped by 4px at the top with the capping strip */}
        <rect x={C_L} y={-32} width={C_R - C_L} height={BB + 32} fill="url(#cylinderGlass)" />
        
        {/* Horizontal glass panel seams all the way down, filtered to start below the new top */}
        {Array.from({ length: 18 }).map((_, i) => {
          const seamY = TOWER_TOP + (i * 44);
          if (seamY < TOWER_TOP - DY_TOP + 30) return null;
          return (
            <line key={i} x1={C_L} y1={seamY} x2={C_R} y2={seamY} stroke="rgba(255,255,255,0.3)" strokeWidth={0.8} />
          );
        })}

        {/* Detailed Glass Capsule Lift (Climbing the shaft, warm light inside) */}
        <g style={{ opacity: 0, animation: "climbLift 20s cubic-bezier(0.45, 0, 0.15, 1) 4.1s infinite, fadeInLift 0.6s ease-out 4.1s forwards" }}>
          {/* Struts */}
          <rect x={C_L + 3} y={8} width={3} height={54} fill="url(#goldGradient)" rx={1} />
          <rect x={C_R - 6} y={8} width={3} height={54} fill="url(#goldGradient)" rx={1} />
          {/* Light Glow */}
          <rect x={C_L + 6} y={8} width={C_R - C_L - 12} height={54} fill="url(#storeIllum)" opacity={0.85} rx={2} />
          {/* Glass Face */}
          <rect x={C_L + 6} y={8} width={C_R - C_L - 12} height={54} fill="rgba(255, 255, 255, 0.18)" stroke="rgba(255,255,255,0.5)" strokeWidth={0.8} rx={3} />
          {/* Center Seam */}
          <line x1={C_L + (C_R - C_L)/2} y1={8} x2={C_L + (C_R - C_L)/2} y2={62} stroke="rgba(255,255,255,0.4)" strokeWidth={0.5} />
          {/* Floor Plates */}
          <line x1={C_L + 6} y1={26} x2={C_R - 6} y2={26} stroke="#222222" strokeWidth={1} />
          <line x1={C_L + 6} y1={44} x2={C_R - 6} y2={44} stroke="#222222" strokeWidth={1} />
          {/* Gold Caps */}
          <path d={`M ${C_L + 2},8 Q ${C_L + (C_R-C_L)/2},16 ${C_R - 2},8 L ${C_R - 2},0 Q ${C_L + (C_R-C_L)/2},8 ${C_L + 2},0 Z`} fill="url(#goldGradient)" stroke="#777777" strokeWidth={0.4} />
          <path d={`M ${C_L + 2},62 Q ${C_L + (C_R-C_L)/2},70 ${C_R - 2},62 L ${C_R - 2},70 Q ${C_L + (C_R-C_L)/2},78 ${C_L + 2},70 Z`} fill="url(#bronzeGradient)" stroke="#555555" strokeWidth={0.4} />
          {/* Highlight Sweep */}
          <path d={`M ${C_L + 8},10 Q ${C_L + 14},35 ${C_L + 8},60`} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth={1.5} />
        </g>

        {/* 12 Volumetric Rings (wrapping cylinder completely from top to ground) */}
        {Array.from({ length: 12 }).map((_, rIdx) => {
          const f = rIdx * 3;
          const ry = TOWER_TOP + f * FH;
          if (ry < TOWER_TOP - DY_TOP + 30) return null;
          const mid = C_L + (C_R - C_L) / 2;
          const rx_l = C_L - 3;
          const rx_r = C_R + 3;
          const cy_d = 7;
          return (
            <g key={`core-ring-${rIdx}`}>
              <path d={`M ${rx_l},${ry + 16} Q ${mid},${ry + 16 + cy_d} ${rx_r},${ry + 16} L ${rx_r},${ry + 19} Q ${mid},${ry + 19 + cy_d} ${rx_l},${ry + 19} Z`} fill="rgba(0,0,0,0.35)" />
              <path d={`M ${rx_l},${ry} Q ${mid},${ry + cy_d} ${rx_r},${ry} L ${rx_r},${ry + 16} Q ${mid},${ry + 16 + cy_d} ${rx_l},${ry + 16} Z`} fill="url(#goldGradient)" stroke="#666666" strokeWidth={0.3} />
              <path d={`M ${rx_l},${ry} Q ${mid},${ry + cy_d} ${rx_r},${ry} Q ${mid},${ry - 3} ${rx_l},${ry} Z`} fill="#ffebc2" opacity={0.6} />
            </g>
          );
        })}
      </g>
      <defs>
        <linearGradient id="goldGradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#dcdcdc" />
          <stop offset="35%" stopColor="#fafafa" />
          <stop offset="70%" stopColor="#cfcfcf" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>
        <linearGradient id="darkPetalStripsGradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#303030" />
          <stop offset="35%" stopColor="#5a5a5a" />
          <stop offset="70%" stopColor="#444444" />
          <stop offset="100%" stopColor="#666666" />
        </linearGradient>
        <linearGradient id="bronzeGradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#a8a8a8" />
          <stop offset="50%" stopColor="#dedede" />
          <stop offset="100%" stopColor="#808080" />
        </linearGradient>
        
        {/* Cylindrical Core Gradient: Volumetric Smoked glass with sharp center reflection */}
        <linearGradient id="cylinderGlass" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(15, 15, 15, 0.95)" />
          <stop offset="25%" stopColor="rgba(110, 110, 110, 0.5)" />
          <stop offset="50%" stopColor="rgba(255, 255, 255, 0.95)" />
          <stop offset="75%" stopColor="rgba(110, 110, 110, 0.5)" />
          <stop offset="100%" stopColor="rgba(15, 15, 15, 0.95)" />
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

        {/* Storefront Illuminated Interior - Minimalist White/Grey Glow */}
        <linearGradient id="storeIllum" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e5e5e5" />
        </linearGradient>

        <filter id="shadowBlur">
          <feGaussianBlur stdDeviation="3" />
        </filter>
        <linearGradient id="windowGlowGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFBEB" />
          <stop offset="30%" stopColor="#FCD34D" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
        <linearGradient id="glassGlowGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(251, 191, 36, 0.8)" />
          <stop offset="100%" stopColor="rgba(245, 158, 11, 0.2)" />
        </linearGradient>
      </defs>

                        {/* ── COMMERCIAL PODIUM BASE (Ultra-Minimalist Split-Block Design matching original render) ── */}
      <g style={{ transform: "scaleY(0)", animation: "growPillar 1.5s cubic-bezier(0.25, 1, 0.5, 1) 1.5s forwards", transformBox: "fill-box", transformOrigin: "bottom" }}>
        {/* 1. Garden Rooftops */}
        <polygon points={`425,${BB - PODIUM_H} 727,${BB - PODIUM_H} 727,${BB - PODIUM_H - DY_TOP} 425,${BB - PODIUM_H - DY_TOP}`} fill="#eaeaea" stroke="#222" strokeWidth="0.5" />
        <polygon points={`425,${BB - PODIUM_H} 727,${BB - PODIUM_H} 727,${BB - PODIUM_H - 10} 425,${BB - PODIUM_H - 10}`} fill="rgba(255, 255, 255, 0.2)" stroke="rgba(255,255,255,0.5)" strokeWidth="0.4" />

        <polygon points={`727,${BB - PODIUM_H} 975,${BB - PODIUM_H} 975,${BB - PODIUM_H - DY_TOP} 727,${BB - PODIUM_H - DY_TOP}`} fill="#eaeaea" stroke="#222" strokeWidth="0.5" />
        <polygon points={`727,${BB - PODIUM_H} 975,${BB - PODIUM_H} 975,${BB - PODIUM_H - 10} 727,${BB - PODIUM_H - 10}`} fill="rgba(255, 255, 255, 0.2)" stroke="rgba(255,255,255,0.5)" strokeWidth="0.4" />


        {/* 2. Slabs backing both blocks */}
        <rect x={425} y={BB - PODIUM_H} width={302} height={PODIUM_H} fill="url(#bronzeGradient)" stroke="#444" strokeWidth="0.5" />
        <rect x={727} y={BB - PODIUM_H} width={248} height={PODIUM_H} fill="url(#bronzeGradient)" stroke="#444" strokeWidth="0.5" />

        {/* ── LEFT PODIUM BLOCK ── */}
        
        {/* Floor 4: Massive Solid Concrete Box overlapping the Central Pole completely */}
        <g>
          <rect x={431} y={BB - PODIUM_H + 8} width={296} height={42} fill="url(#goldGradient)" stroke="#555555" strokeWidth="0.4" />
          <line x1={431} y1={BB - PODIUM_H + 22} x2={727} y2={BB - PODIUM_H + 22} stroke="rgba(0,0,0,0.15)" strokeWidth={1} />
          <line x1={431} y1={BB - PODIUM_H + 36} x2={727} y2={BB - PODIUM_H + 36} stroke="rgba(0,0,0,0.15)" strokeWidth={1} />
        </g>{/* Floor 3: Wave-Slanted Louvers Parking Garage */}
        <g>
          <rect x={431} y={BB - PODIUM_H + 54} width={296} height={44} fill="#0d0d0d" />
          {/* Subtle dark car silhouette */}
          <rect x={480} y={BB - PODIUM_H + 78} width={22} height={8} fill="rgba(255,255,255,0.15)" rx={1} />
          <rect x={560} y={BB - PODIUM_H + 78} width={22} height={8} fill="rgba(255,255,255,0.1)" rx={1} />
          
          {/* Minimalist wave louvers */}
          {Array.from({ length: 20 }).map((_, i) => {
            const lx = 437 + i * 15;
            const lH = 40 - Math.sin((i / 15) * Math.PI) * 18;
            return (
              <rect key={`louver-left-${i}`} x={lx} y={BB - PODIUM_H + 54} width={4} height={lH} fill="url(#goldGradient)" stroke="#555555" strokeWidth="0.3" />
            );
          })}
          {/* Solid separator strip */}
          <rect x={431} y={BB - PODIUM_H + 98} width={296} height={6} fill="url(#goldGradient)" stroke="#555" strokeWidth="0.4" />
        </g>

        {/* Floor 2: Minimalist Terrace + Sleek Corridor */}
        <g>
          {/* Background */}
          <rect x={431} y={BB - PODIUM_H + 104} width={296} height={38} fill="#121212" />
          
          {/* Left Terrace: grid tile lines */}
          {Array.from({ length: 5 }).map((_, i) => (
            <line key={`tile-${i}`} x1={431 + i * 12} y1={BB - PODIUM_H + 104} x2={431 + i * 12} y2={BB - PODIUM_H + 142} stroke="rgba(255,255,255,0.08)" strokeWidth={0.5} />
          ))}
          
          {/* Right Corridor: Glass storefront with simple interior pillars */}
          <rect x={495} y={BB - PODIUM_H + 104} width={232} height={38} fill="url(#storeIllum)" />
          {/* Elegant internal pillars */}
          <rect x={540} y={BB - PODIUM_H + 104} width={5} height={38} fill="#eaeaea" />
          <rect x={605} y={BB - PODIUM_H + 104} width={5} height={38} fill="#eaeaea" />
          <rect x={670} y={BB - PODIUM_H + 104} width={5} height={38} fill="#eaeaea" />
          
          {/* Glass Face overlay */}
          <rect x={495} y={BB - PODIUM_H + 104} width={232} height={38} fill="rgba(255, 255, 255, 0.12)" stroke="rgba(255,255,255,0.4)" strokeWidth={0.5} />
          
          {/* Solid separator strip */}
          <rect x={431} y={BB - PODIUM_H + 142} width={296} height={6} fill="url(#goldGradient)" stroke="#555" strokeWidth="0.4" />
        </g>

        {/* Floor 1: Sleek Double-Wide Glass Showroom Corridor */}
        <g>
          {/* Warm minimalist illuminated showroom backdrop */}
          <rect x={431} y={BB - PODIUM_H + 148} width={296} height={38} fill="url(#storeIllum)" />
          
          {/* Simple clean structural pillars */}
          <rect x={475} y={BB - PODIUM_H + 148} width={6} height={38} fill="#fafafa" />
          <rect x={545} y={BB - PODIUM_H + 148} width={6} height={38} fill="#fafafa" />
          <rect x={615} y={BB - PODIUM_H + 148} width={6} height={38} fill="#fafafa" />
          <rect x={685} y={BB - PODIUM_H + 148} width={6} height={38} fill="#fafafa" />

          {/* Large, continuous glass windows */}
          <rect x={431} y={BB - PODIUM_H + 148} width={296} height={38} fill="rgba(255, 255, 255, 0.1)" stroke="rgba(255,255,255,0.4)" strokeWidth={0.5} />
          
          {/* Solid separator strip */}
          <rect x={431} y={BB - PODIUM_H + 186} width={296} height={6} fill="url(#goldGradient)" stroke="#555" strokeWidth="0.4" />
        </g>

        {/* Floor 0: Ground Level Tall Showrooms */}
        <g>
          <rect x={431} y={BB - PODIUM_H + 192} width={296} height={38} fill="url(#storeIllum)" />
          
          {/* Clean tall glass panels */}
          {Array.from({ length: 5 }).map((_, i) => (
            <rect key={`ground-pane-${i}`} x={431 + i * 59.2} y={BB - PODIUM_H + 192} width={59.2} height={38} fill="rgba(255, 255, 255, 0.15)" stroke="rgba(255,255,255,0.4)" strokeWidth={0.5} />
          ))}
          
          {/* High-end vertical bronze framing columns */}
          {Array.from({ length: 6 }).map((_, i) => (
            <rect key={`ground-col-${i}`} x={429 + i * 59.2} y={BB - PODIUM_H + 192} width={5} height={38} fill="url(#bronzeGradient)" stroke="#222" strokeWidth="0.3" />
          ))}
        </g>

        {/* ── RIGHT PODIUM BLOCK ── */}
        
        {/* Floor 4, 3, 2: Open-Air Parking Garage & Horizontal Slabs */}
        <g>
          <rect x={733} y={BB - PODIUM_H + 8} width={236} height={134} fill="#0d0d0d" />
          
          {/* Minimalist car outline silhouettes on different floors */}
          <rect x={760} y={BB - PODIUM_H + 74} width={26} height={9} fill="rgba(255,255,255,0.2)" rx={1.5} />
          <rect x={860} y={BB - PODIUM_H + 115} width={26} height={9} fill="rgba(255,255,255,0.15)" rx={1.5} />

          {/* Clean horizontal gold slabs (strips) */}
          <rect x={733} y={BB - PODIUM_H + 8} width={236} height={6} fill="url(#goldGradient)" stroke="#555" strokeWidth="0.4" />
          <rect x={733} y={BB - PODIUM_H + 50} width={236} height={6} fill="url(#goldGradient)" stroke="#555" strokeWidth="0.4" />
          <rect x={733} y={BB - PODIUM_H + 98} width={236} height={6} fill="url(#goldGradient)" stroke="#555" strokeWidth="0.4" />
          <rect x={733} y={BB - PODIUM_H + 142} width={236} height={6} fill="url(#goldGradient)" stroke="#555" strokeWidth="0.4" />
        </g>

        {/* Floor 1: Minimalist Gallery Corridor */}
        <g>
          {/* Warm, clean gallery corridor backdrop */}
          <rect x={733} y={BB - PODIUM_H + 148} width={236} height={38} fill="url(#storeIllum)" />
          
          {/* Elegant internal vertical pillars */}
          <rect x={775} y={BB - PODIUM_H + 148} width={5} height={38} fill="#fafafa" />
          <rect x={845} y={BB - PODIUM_H + 148} width={5} height={38} fill="#fafafa" />
          <rect x={915} y={BB - PODIUM_H + 148} width={5} height={38} fill="#fafafa" />

          {/* Smooth glass panel */}
          <rect x={733} y={BB - PODIUM_H + 148} width={236} height={38} fill="rgba(255, 255, 255, 0.12)" stroke="rgba(255,255,255,0.4)" strokeWidth={0.5} />
          
          {/* Solid separator strip */}
          <rect x={733} y={BB - PODIUM_H + 186} width={236} height={6} fill="url(#goldGradient)" stroke="#555" strokeWidth="0.4" />
        </g>

        {/* Floor 0: Ground Level Open Driveway supported by Piloti Columns */}
        <g>
          <rect x={733} y={BB - PODIUM_H + 192} width={236} height={38} fill="#151412" />
          {/* Ceiling shadow */}
          <rect x={733} y={BB - PODIUM_H + 192} width={236} height={6} fill="rgba(0,0,0,0.5)" filter="url(#shadowBlur)" />
          
          {/* Smooth, premium circular support columns (Piloti) */}
          <rect x={765} y={BB - PODIUM_H + 192} width={10} height={38} fill="url(#bronzeGradient)" stroke="#222" strokeWidth={0.4} />
          <rect x={845} y={BB - PODIUM_H + 192} width={10} height={38} fill="url(#bronzeGradient)" stroke="#222" strokeWidth={0.4} />
          <rect x={925} y={BB - PODIUM_H + 192} width={10} height={38} fill="url(#bronzeGradient)" stroke="#222" strokeWidth={0.4} />
        </g>

        {/* Ground level foundation base line */}
        <line x1={300} x2={1100} y1={BB} y2={BB} stroke="#222" strokeWidth={5} />
      </g>

                  {[0, 1].map((wingIdx) => {
        const isLeft = wingIdx === 0;
        const l = isLeft ? L_L : R_L;
        const r = isLeft ? L_R : R_R;
        const cx = (l + r) / 2;
        
        // Extended balcony bounds for a deep wrap-around pop beyond the building silhouette (1.4x less wider)
        const b_l = isLeft ? l - 17 : l;
        const b_r = isLeft ? r : r + 17;
        const b_cx = isLeft ? b_l + (b_r - b_l) * 0.6 : b_l + (b_r - b_l) * 0.4;
        
        const curveD = 28; // Deep rounded bulge
        const slabYOffset = 10;
        
        
        return (
          <g key={wingIdx}>
            {/* Floors Loop (Flat Interior Wall with Windows + Curved Popping Balconies) */}
            {Array.from({ length: FLOORS }).map((_, f) => {
              const fy = TOWER_TOP + f * FH;
              const hot = hotFloor !== null && f === hotFloor;
              const delay = 2.1 + (FLOORS - 1 - f) * 0.05; // Bottom-up stagger
              
              // Spacing for 4 windows per floor
              const wCount = 4;
              const ww = 28;
              const gap = ((r - l) - 24 - wCount * ww) / (wCount - 1);
              
              return (
                <g key={f} style={{ opacity: 0, animation: `popFloor 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${delay}s forwards`, transformBox: "fill-box", transformOrigin: "bottom" }}>
                  
                  {/* A. Flat Interior Wall Background (Sits behind balcony, between ceiling and floor slab) */}
                  <rect 
                    x={l} 
                    y={fy - FH} 
                    width={r - l} 
                    height={FH} 
                    fill={f % 2 === 0 ? "#fafafa" : "#eaeaea"} 
                  />

                  {/* B. Sleek Minimalist Windows (Perfect inside grid, above the concrete slab at fy - 10) */}
                  {Array.from({ length: wCount }).map((_, j) => (
                    <rect 
                      key={j}
                      x={l + 12 + j * (ww + gap)} 
                      y={fy - FH + 6}
                      width={ww} 
                      height={12}
                      fill={hot ? "url(#windowGlowGradient)" : "#333333"}
                      rx="1.5"
                      style={{ 
                        pointerEvents: "none",
                        filter: hot ? "drop-shadow(0 0 5px rgba(251, 191, 36, 0.9))" : "none",
                        transition: "fill 0.35s ease, filter 0.35s ease"
                      }}
                    />
                  ))}

                  {/* D. Recessed Interior Shadow behind the balcony (Semi-transparent glaze to blend wall and glass) */}
                  <path 
                    d={`M ${l},${fy - slabYOffset} Q ${cx},${fy + curveD/2 - slabYOffset} ${r},${fy - slabYOffset} L ${r},${fy - FH} L ${l},${fy - FH} Z`}
                    fill="rgba(10, 10, 10, 0.18)"
                  />
                  
                  {/* E. Cast Shadow (Casts a shadow onto the floor below) */}
                  <path 
                    d={`M ${b_l},${fy + 3} Q ${b_cx},${fy + curveD + 3} ${b_r},${fy + 3} L ${b_r},${fy + 14} Q ${b_cx},${fy + curveD + 14} ${b_l},${fy + 14} Z`}
                    fill="rgba(0,0,0,0.15)" filter="url(#shadowBlur)"
                  />

                  {/* F. Golden Downlight Splash (Under-balcony ambient glow on hover) */}
                  <path 
                    d={`M ${b_l - 12},${fy + 2} Q ${b_cx},${fy + curveD + 4} ${b_r + 12},${fy + 2} L ${b_r + 12},${fy + 16} Q ${b_cx},${fy + curveD + 18} ${b_l - 12},${fy + 16} Z`}
                    fill="rgba(245, 158, 11, 0.45)"
                    filter="url(#shadowBlur)"
                    style={{ 
                      opacity: hot ? 1 : 0, 
                      transition: "opacity 0.35s ease" 
                    }}
                  />

                  {/* G. INTERACTIVE 3D BALCONY GROUP (Curved popping edges) */}
                  <g 
                    className="balcony-floor"
                    style={{
                      transform: hot ? "translateY(-4.5px)" : "translateY(0)",
                      transformOrigin: "center",
                      transition: "transform 0.35s cubic-bezier(0.25, 0.8, 0.25, 1)"
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

                    {/* Top Surface of Slab */}
                    <path 
                      d={`M ${l},${fy - slabYOffset} Q ${cx},${fy + curveD/2 - slabYOffset} ${r},${fy - slabYOffset} L ${b_r},${fy} Q ${b_cx},${fy + curveD} ${b_l},${fy} Z`}
                      fill="#f0f0f0" 
                    />

                    {/* Layer C: Floating Glass Railing */}
                    <path 
                      d={`M ${b_l + 2},${fy - FH + 10} Q ${b_cx},${fy + curveD - FH + 10} ${b_r - 2},${fy - FH + 10} L ${b_r - 2},${fy} Q ${b_cx},${fy + curveD} ${b_l + 2},${fy} Z`}
                      fill="rgba(255, 255, 255, 0.25)"
                    />
                    
                    {/* White specular highlight on the outermost curved edge */}
                    <path 
                      d={`M ${b_l + 2},${fy} Q ${b_cx},${fy + curveD} ${b_r - 2},${fy}`}
                      fill="none" stroke="#fff" strokeWidth={1.2}
                    />

                    {/* Amber highlight overlay when active */}
                    <path 
                      d={`M ${b_l + 2},${fy - FH + 10} Q ${b_cx},${fy + curveD - FH + 10} ${b_r - 2},${fy - FH + 10} L ${b_r - 2},${fy} Q ${b_cx},${fy + curveD} ${b_l + 2},${fy} Z`}
                      fill="url(#glassGlowGradient)"
                      style={{ 
                        opacity: hot ? 0.75 : 0, 
                        filter: hot ? "drop-shadow(0 0 8px rgba(245, 158, 11, 0.8))" : "none",
                        transition: "opacity 0.35s ease, filter 0.35s ease" 
                      }}
                    />

                    {/* Golden specular highlight glow on hover */}
                    <path 
                      d={`M ${b_l + 2},${fy} Q ${b_cx},${fy + curveD} ${b_r - 2},${fy}`}
                      fill="none" 
                      stroke="#FBBF24" 
                      strokeWidth={2}
                      style={{ 
                        opacity: hot ? 1 : 0, 
                        filter: "drop-shadow(0 0 5px #F59E0B)",
                        transition: "opacity 0.35s ease" 
                      }}
                    />
                  </g>

                  {/* H. Static Invisible Hitbox for Interaction (Placed outside the translating group to prevent jitter/stutter!) */}
                  <path 
                    d={`M ${b_l},${fy - FH + 5} Q ${b_cx},${fy + curveD - FH + 5} ${b_r},${fy - FH + 5} L ${b_r},${fy + 5} Q ${b_cx},${fy + curveD + 5} ${b_l},${fy + 5} Z`}
                    fill="transparent"
                    style={{ cursor: "pointer" }}
                    onMouseEnter={() => onFloorHover(f)}
                    onMouseLeave={() => onFloorHover(null)}
                    onClick={() => onFloorClick(f)}
                  />
                </g>
              );
            })}
            
            {/* Parapet strips removed from here to be rendered on top of volumetric crown wings below */}

                        {/* Outer structural pillars merging into crowns */}
            <rect x={l - 5} y={TOWER_TOP} width={8} height={BB - PODIUM_H - TOWER_TOP} fill="url(#goldGradient)" stroke="#777777" strokeWidth="0.5"
              style={{ transform: "scaleY(0)", animation: "growPillar 1.8s cubic-bezier(0.25, 1, 0.5, 1) 2.1s forwards", transformBox: "fill-box", transformOrigin: "bottom", pointerEvents: "none" }} />
            <rect x={r - 3} y={TOWER_TOP} width={8} height={BB - PODIUM_H - TOWER_TOP} fill="url(#goldGradient)" stroke="#777777" strokeWidth="0.5"
              style={{ transform: "scaleY(0)", animation: "growPillar 1.8s cubic-bezier(0.25, 1, 0.5, 1) 2.1s forwards", transformBox: "fill-box", transformOrigin: "bottom", pointerEvents: "none" }} />

{/* ── VOLUMETRIC CROWNS (Majestic Looking-Up Hollow Petals with Flush Pergola Gaps) ── */}
            <g style={{ opacity: 0, animation: "dropCrown 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) 3.6s forwards", transformBox: "fill-box", transformOrigin: "bottom", pointerEvents: "none" }}>
              
              {/* Geometry Helpers & Math Mapped dynamically */}
              {(() => {
                // Pop-Out Footprint: Outer pops out 54px proudly, Inner has 6px overhang that curves inward (no center overlap!)
                const cl = isLeft ? l - 54 : l - 6;
                const cr = isLeft ? r + 6 : r + 54;
                
                // Concrete strip connection points (Outer and Inner)
                const b_l = isLeft ? l - 17 : l;
                const b_r = isLeft ? r : r + 17;

                // ASYMMETRIC PEAK: Shifted towards the outer side (left for Left, right for Right) matching original image
                const ccx = isLeft ? cl + (cr - cl) * 0.08 : cl + (cr - cl) * 0.92;

                const baseDeckY = TOWER_TOP - FH + 1; // Y = -61 (perfect overlap with topmost floor, zero gap)

                return (
                  <g>
                    {(() => {
                      const f_y0 = isLeft ? baseDeckY - 15 : baseDeckY;
                      const f_y1 = baseDeckY - 77;
                      const f_y2 = isLeft ? baseDeckY : baseDeckY - 15;

                      const singleCurvePath = isLeft
                        ? `M ${b_l},${baseDeckY - 15 + 18} Q ${cl - 14},${(f_y0 + baseDeckY - 15 + 18) / 2} ${cl},${f_y0} Q ${ccx},${f_y1} ${cr},${f_y2} Q ${cr - 4},${(f_y2 + baseDeckY - 3) / 2} ${b_r},${baseDeckY - 3}`
                        : `M ${b_l},${baseDeckY - 3} Q ${cl + 4},${(f_y0 + baseDeckY - 3) / 2} ${cl},${f_y0} Q ${ccx},${f_y1} ${cr},${f_y2} Q ${cr + 14},${(f_y2 + baseDeckY - 15 + 18) / 2} ${b_r},${baseDeckY - 15 + 18}`;
                      const clipId = `clip-petal-${isLeft ? 'left' : 'right'}`;

                      return (
                        <g>
                           <defs>
                             <clipPath id={clipId}>
                               <path d={
                                 isLeft
                                   ? singleCurvePath + ` L ${b_r},${baseDeckY} L ${b_l},${baseDeckY - 15} Z`
                                   : singleCurvePath + ` L ${b_r},${baseDeckY - 15} L ${b_l},${baseDeckY} Z`
                               } />
                             </clipPath>
                           </defs>

                          {/* 1. Slanting Louver Deck (Clipped to stay perfectly aligned, filled with no gaps) */}
                          <g clipPath={`url(#${clipId})`}>
                            {Array.from({ length: 52 }).map((_, i) => {
                              const t = i / 51;
                              // Distribute starting X coordinates widely to cover the entire clipped region under the slant (no black gaps at the corners)
                              const x_top = b_l - 250 + t * (b_r - b_l + 500);
                              const y_top = baseDeckY - 200; // Start high above the peak
                              
                              // Diagonal slant slope mirroring each other perfectly (Left goes down-left, Right goes down-right)
                              const x_bottom = isLeft ? x_top - 150 : x_top + 150;
                              const y_bottom = baseDeckY + 100; // End low below the deck
                              
                              return (
                                <g key={`slant-strip-group-${i}`}>
                                  {/* 1. Deep Black Outer Outline Border */}
                                  <line
                                    x1={x_top}
                                    y1={y_top}
                                    x2={x_bottom}
                                    y2={y_bottom}
                                    stroke="#000000"
                                    strokeWidth={14}
                                    strokeLinecap="butt"
                                  />
                                  {/* 2. Original Rich Silver-Gold Inner Louver Strip */}
                                  <line
                                    x1={x_top}
                                    y1={y_top}
                                    x2={x_bottom}
                                    y2={y_bottom}
                                    stroke="url(#goldGradient)"
                                    strokeWidth={11} // Slightly narrower to leave a crisp 1.5px outline on each side!
                                    strokeLinecap="butt"
                                  />
                                </g>
                              );
                            })}
                          </g>

                          {/* 2. Single Continuous Crown Curve (A bold, elegant sweeping outline representing the entire shape of the wing crown) */}
                          {/* Elegant solid gray outline on both outer and inner sides */}
                          <path 
                            d={singleCurvePath}
                            fill="none"
                            stroke="#555555"
                            strokeWidth={11.5}
                            strokeLinecap="butt"
                            strokeLinejoin="round"
                          />
                          {/* Main sharp white crown curve */}
                          <path 
                            d={singleCurvePath}
                            fill="none"
                            stroke="#ffffff"
                            strokeWidth={7.5}
                            strokeLinecap="butt"
                            strokeLinejoin="round"
                          />
                        </g>
                      );
                    })()}
                  </g>
                );
              })()}
            </g>

            {/* ── CORRESPONDING SLANTED HORIZONTAL PARAPET STRIP (Rendered on top of the louvers to be fully visible on both sides) ── */}
            {(() => {
              const baseDeckY = TOWER_TOP - FH + 1; // Y = -61
              const b_l_left = L_L - 17;
              const b_r_left = L_R;
              const b_l_right = R_L;
              const b_r_right = R_R + 17;

              return (
                <g style={{ opacity: 0, animation: "dropCrown 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) 3.6s forwards", transformBox: "fill-box", transformOrigin: "bottom", pointerEvents: "none" }}>
                  {isLeft ? (
                    <>
                      {/* Left Tower Slanted Parapet Strip */}
                      <path 
                        d={`M ${b_l_left},${baseDeckY - 15} L ${b_r_left},${baseDeckY} L ${b_r_left},${baseDeckY + 18} L ${b_l_left},${baseDeckY - 15 + 18} Z`}
                        fill="#fafafa"
                        stroke="#555555"
                        strokeWidth={1.5}
                      />
                      {/* Crisp slanted highlight lines on Left strip */}
                      <line 
                        x1={b_l_left} y1={baseDeckY - 15} 
                        x2={b_r_left} y2={baseDeckY} 
                        stroke="#cccccc" strokeWidth={0.5} 
                      />
                      <line 
                        x1={b_l_left} y1={baseDeckY - 15 + 18} 
                        x2={b_r_left} y2={baseDeckY + 18} 
                        stroke="#ffffff" strokeWidth={1.2} 
                      />
                    </>
                  ) : (
                    <>
                      {/* Right Tower Slanted Parapet Strip */}
                      <path 
                        d={`M ${b_l_right},${baseDeckY} L ${b_r_right},${baseDeckY - 15} L ${b_r_right},${baseDeckY - 15 + 18} L ${b_l_right},${baseDeckY + 18} Z`}
                        fill="#fafafa"
                        stroke="#555555"
                        strokeWidth={1.5}
                      />
                      {/* Crisp slanted highlight lines on Right strip */}
                      <line 
                        x1={b_l_right} y1={baseDeckY} 
                        x2={b_r_right} y2={baseDeckY - 15} 
                        stroke="#cccccc" strokeWidth={0.5} 
                      />
                      <line 
                        x1={b_l_right} y1={baseDeckY + 18} 
                        x2={b_r_right} y2={baseDeckY - 15 + 18} 
                        stroke="#ffffff" strokeWidth={1.2} 
                      />


                    </>
                  )}
                </g>
              );
            })()}
          </g>
        );
      })}

      {/* Central Core Cap (Thick curved architectural strip capping the cylinder - rendered on top of the wing petals!) */}
      <g style={{ opacity: 0, animation: "dropCrown 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) 3.5s forwards", pointerEvents: "none" }}>
        {/* Curved capping strip sitting flat on the cylinder top at Y = -28 and arched at the top up to Y = -50 */}
        <path d="M 671,-28 L 671,-42 A 29,8 0 0,1 729,-42 L 729,-28 Z" fill="#fafafa" stroke="#555555" strokeWidth={1.2} />
        {/* Specular curved top highlight */}
        <path d="M 671,-42 A 29,8 0 0,1 729,-42" fill="none" stroke="#ffffff" strokeWidth={1} />
        {/* Bottom flat accent seam line */}
        <line x1={671} y1={-28} x2={729} y2={-28} stroke="#cccccc" strokeWidth={0.5} />
      </g>    </g>
  );
}

export default function ProjectsPage() {
  const [hovered, setHovered] = useState<number | null>(null);
  const [zoomed, setZoomed] = useState<number | null>(null);
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const router = useRouter();
  const hf = hovered !== null ? PROJECTS[hovered].floorIdx : null;

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
    if (now - lastScrollTimeRef.current < 280) return; // Smooth scroll pacing (280ms)

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

  // Calculate zoom transform origin to center horizontally on the building and vertically on the floor
  let zoomX = 700;
  let zoomY = 305;
  let translateX = 0;
  let translateY = 0;
  if (zoomed !== null) {
    const p = PROJECTS[zoomed];
    zoomY = p.nodeY;
    
    if (activeCard !== null && activeCard === zoomed) {
      const isL = p.side === "L";
      const endX = isL ? p.nodeX - 110 : p.nodeX + 110;
      const cardWidth = 193 * 0.7;
      const cardX = isL ? endX - cardWidth : endX;
      zoomX = cardX + cardWidth / 2; // Center on the card horizontally
    } else {
      zoomX = 700; // Center on the building
    }

    // Translate the floor to the exact center of the 1400x970 viewBox (center Y is 305)
    translateX = 700 - zoomX;
    translateY = 305 - zoomY;
  }

  return (
    <div className="w-screen h-screen overflow-hidden bg-[#111111]" onWheel={handleWheel}>
      <p className="absolute top-5 right-8 z-10 text-[11px] tracking-[0.22em] uppercase text-white/40">25 Projects</p>

      <svg viewBox="0 -180 1400 970" className="w-full h-full" preserveAspectRatio="xMidYMid meet"
        style={{ cursor: "default" }}
      >
        <g style={{
          transition: "transform 0.8s cubic-bezier(0.22, 1, 0.36, 1), transform-origin 0.8s cubic-bezier(0.22, 1, 0.36, 1)",
          transformOrigin: `${zoomX}px ${zoomY}px`,
          transform: zoomed !== null ? `translate(${translateX}px, ${translateY}px) scale(2.5)` : "translate(0px, 0px) scale(1)",
          willChange: "transform"
        }}>

        {/* ── ANIMATED SKY BIRDS ── */}
        <defs>
          <radialGradient id="building-overlay" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#111111" stopOpacity="0" />
            <stop offset="80%" stopColor="#111111" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#111111" stopOpacity="0.65" />
          </radialGradient>
          {/* Mathematical Convolve Sharpening to eliminate blurriness and restore crisp 4K details */}
          <filter id="premium-4k-filter">
            <feConvolveMatrix order="3" kernelMatrix="0 -0.25 0 -0.25 2.0 -0.25 0 -0.25 0" preserveAlpha="true" />
          </filter>
          {/* Subtle noise/grain shader to break up digital upscale artifacts and simulate organic 4K texture */}
          <filter id="grain-filter">
            <feTurbulence type="fractalNoise" baseFrequency="0.95" numOctaves="4" stitchTiles="stitch" />
            <feColorMatrix type="matrix" values="0 0 0 0 1   0 0 0 0 1   0 0 0 0 1  0 0 0 0.04 0" />
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
            @keyframes wipeUp {
              0%   { clip-path: inset(100% 0 0 0); }
              100% { clip-path: inset(0 0 0 0); }
            }
          `}</style>
        </defs>

        {/* ── BUILDING IMAGE (Fading up from roots) ── */}
        <g style={{ animation: "wipeUp 3s cubic-bezier(0.25, 1, 0.5, 1) forwards" }}>
          <image 
            href="/building/building.png" 
            x="300" y="-245" 
            width="800" height="1100" 
            preserveAspectRatio="xMidYMid meet" 
            style={{ 
              filter: "url(#premium-4k-filter)", 
              imageRendering: "high-quality", 
              transform: "translateZ(0)" 
            }}
          />
        </g>

        {/* ── PROJECT NODES + CALLOUTS ── */}
        {PROJECTS.map((p, i) => {
          const isH = hovered === i || activeCard === i;
          const isL = p.side === "L";
          const nx = p.nodeX, ny = p.nodeY;
          const midX = isL ? nx - 30 : nx + 30;
          const endX = isL ? nx - 110 : nx + 110;
          const cardWidth = 193 * 0.7;
          const cardX = isL ? endX - cardWidth : endX;
          let cardY = ny - 40;
          let lineEndY = ny + (isL ? -4 : 4);
          
          // If card goes past the bottom frame, shift it up and angle the line
          const cardHeight = 232 * 0.7;
          if (cardY + cardHeight > 760) {
            cardY = 760 - cardHeight;
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
                <g transform={`translate(${cardX}, ${cardY}) scale(0.7)`}>
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
                  <text x="177" y="217" fill="#F59E0B" fontSize="8" fontWeight="600" fontFamily="'Inter', sans-serif" textAnchor="end" style={{ cursor: "pointer" }} onClick={(e) => { e.stopPropagation(); router.push(`/projects-2/${p.slug}`); }}>View project →</text>
                  
                  {/* Invisible click target for the CTA */}
                  <rect x="110" y="200" width="80" height="30" fill="transparent" style={{ cursor: "pointer" }} onClick={(e) => { e.stopPropagation(); router.push(`/projects-2/${p.slug}`); }} />
                </g>
              )}
            </g>
          );
        })}
        </g>

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
          filter="url(#grain-filter)" 
          style={{ pointerEvents: "none" }}
        />
      </svg>
    </div>
  );
}
