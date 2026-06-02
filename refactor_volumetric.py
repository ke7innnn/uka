import sys

with open('src/app/projects/page.tsx', 'r') as f:
    lines = f.readlines()

new_geometry = """/* ── Building geometry (Golden Skyscraper 2.5D Volumetric) ─────────────────────────── */
const BB = 730;          // ground line
const FH = 22;           // floor height (increased for slender, taller look)
const FLOORS = 25;       // Number of tower floors
const PODIUM_H = 140;    // podium height
const TOWER_TOP = BB - PODIUM_H - (FLOORS * FH); // 730 - 140 - 550 = 40
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
    nodeX: isL ? L_L - 80 : R_R + 80,
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
          <stop offset="0%" stopColor="#dca864" />
          <stop offset="35%" stopColor="#fef3cc" />
          <stop offset="70%" stopColor="#c59146" />
          <stop offset="100%" stopColor="#fdf1c5" />
        </linearGradient>
        <linearGradient id="bronzeGradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#b6895b" />
          <stop offset="50%" stopColor="#dfbd9c" />
          <stop offset="100%" stopColor="#8d5f38" />
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
          <stop offset="0%" stopColor="#8c6230" />
          <stop offset="50%" stopColor="#fde093" />
          <stop offset="100%" stopColor="#8c6230" />
        </linearGradient>
        
        <filter id="shadowBlur">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>

      {/* ── COMMERCIAL PODIUM BASE (2.5D Volumetric) ── */}
      <g style={{ animation: "growPillar 1.5s cubic-bezier(0.25, 1, 0.5, 1) forwards", transformBox: "fill-box", transformOrigin: "bottom" }}>
        
        {/* Podium Top Roof Deck (Garden Deck, dark green tint, skewed back) */}
        <polygon 
          points={`440,${BB - PODIUM_H} 960,${BB - PODIUM_H} 960,${BB - PODIUM_H - DY_TOP} 440,${BB - PODIUM_H - DY_TOP}`} 
          fill="#334230" stroke="#222" strokeWidth="0.5" 
        />
        
        {/* Main Base Front Block */}
        <rect x={440} y={BB - PODIUM_H} width={520} height={PODIUM_H} fill="url(#bronzeGradient)" />
        
        {/* Left Side Bronze Vertical Louvers */}
        {Array.from({ length: 18 }).map((_, i) => (
          <rect key={i} x={450 + i * 14} y={BB - PODIUM_H + 25} width={5} height={90} fill="#4a2c16" stroke="#2a180b" strokeWidth="0.5" />
        ))}
        
        {/* Right Side Dark Open-Air Garage Decks */}
        {/* Deep background to simulate interior volume */}
        <rect x={720} y={BB - PODIUM_H + 25} width={220} height={90} fill="#0d0805" />
        {/* Skewed parking grilles/slabs to show perspective */}
        {Array.from({ length: 4 }).map((_, i) => (
          <g key={i}>
            {/* Slab top face (deep) */}
            <polygon 
              points={`720,${BB - PODIUM_H + 25 + i * 25} 940,${BB - PODIUM_H + 25 + i * 25} 940,${BB - PODIUM_H + 25 + i * 25 - 4} 720,${BB - PODIUM_H + 25 + i * 25 - 4}`} 
              fill="#c59146" 
            />
            {/* Slab front face */}
            <rect x={720} y={BB - PODIUM_H + 25 + i * 25} width={220} height={5} fill="url(#goldGradient)" stroke="#8d5f38" strokeWidth="0.5" />
          </g>
        ))}
        
        {/* Bottom Storefronts / Glass Entrances */}
        <rect x={440} y={BB - 35} width={520} height={35} fill="rgba(20, 30, 40, 0.95)" />
        <rect x={440} y={BB - 35} width={520} height={4} fill="url(#goldGradient)" />
        <line x1={360} x2={1040} y1={BB} y2={BB} stroke="#333" strokeWidth={3} />
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
          <line x1={C_L + 16} y1={10} x2={C_R - 16} y2={10} stroke="#5c3b24" strokeWidth="1" />
          <line x1={C_L + 16} y1={20} x2={C_R - 16} y2={20} stroke="#5c3b24" strokeWidth="1" />
          <line x1={C_L + 16} y1={30} x2={C_R - 16} y2={30} stroke="#5c3b24" strokeWidth="1" />
          {/* Elevator glass door */}
          <rect x={C_L + 25} y={5} width={(C_R - C_L) - 50} height={30} fill="rgba(40, 80, 100, 0.8)" rx={1} />
        </g>
      </g>

      {/* ── TOWER WINGS (Volumetric Balconies) ── */}
      {[0, 1].map((wingIdx) => {
        const isLeft = wingIdx === 0;
        const l = isLeft ? L_L : R_L;
        const r = isLeft ? L_R : R_R;
        const cx = (l + r) / 2;
        const curveD = 18; // Depth of the balcony curve bulge
        const slabYOffset = 8; // How far the balcony extends backward (Y perspective depth)
        
        return (
          <g key={wingIdx}>
            {/* Floors Loop (3D Layered Paths) */}
            {Array.from({ length: FLOORS }).map((_, f) => {
              const fy = TOWER_TOP + f * FH;
              const hot = hotFloor !== null && f === hotFloor;
              const delay = (FLOORS - 1 - f) * 0.055; // Bottom-up stagger
              
              return (
                <g key={f} style={{ opacity: 0, animation: \`popFloor 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) \${delay}s forwards\`, transformBox: "fill-box", transformOrigin: "bottom" }}>
                  
                  {/* 1. Recessed Interior Crescent (Deep shadow behind glass) */}
                  <path 
                    d={\`M \${l + 5},\${fy - slabYOffset} Q \${cx},\${fy + curveD - slabYOffset} \${r - 5},\${fy - slabYOffset} L \${r - 5},\${fy - FH} L \${l + 5},\${fy - FH} Z\`}
                    fill="rgba(10, 10, 10, 0.6)"
                  />

                  {/* 2. Top Surface of Slab (Perspective depth) */}
                  <path 
                    d={\`M \${l},\${fy - slabYOffset} Q \${cx},\${fy + curveD - slabYOffset} \${r},\${fy - slabYOffset} L \${r},\${fy} Q \${cx},\${fy + curveD} \${l},\${fy} Z\`}
                    fill={hot ? "#F59E0B" : "#fef3cc"} 
                  />

                  {/* 3. Bottom Lip (Concrete Thickness) */}
                  <path 
                    d={\`M \${l},\${fy} Q \${cx},\${fy + curveD} \${r},\${fy} L \${r},\${fy + 4} Q \${cx},\${fy + curveD + 4} \${l},\${fy + 4} Z\`}
                    fill={hot ? "#d48100" : "url(#goldGradient)"} 
                    stroke={hot ? "#fff" : "#8d5f38"} strokeWidth={0.5}
                    style={{ transition: "fill 0.2s" }}
                  />

                  {/* 4. Semi-Transparent Glass Railing */}
                  {/* Stacked slightly above the slab. Bright white stroke for specularity. */}
                  <path 
                    d={\`M \${l + 3},\${fy - FH + 12} Q \${cx},\${fy + curveD - FH + 12} \${r - 3},\${fy - FH + 12} L \${r - 3},\${fy} Q \${cx},\${fy + curveD} \${l + 3},\${fy} Z\`}
                    fill={hot ? "rgba(245,158,11,0.5)" : "rgba(160, 210, 240, 0.35)"}
                    stroke="rgba(255, 255, 255, 0.85)" strokeWidth={1}
                    style={{ transition: "fill 0.2s" }}
                  />
                  
                  {/* 5. Invisible Hitbox for Interaction */}
                  <path 
                    d={\`M \${l},\${fy - FH + 10} Q \${cx},\${fy + curveD - FH + 10} \${r},\${fy - FH + 10} L \${r},\${fy + 4} Q \${cx},\${fy + curveD + 4} \${l},\${fy + 4} Z\`}
                    fill="transparent"
                    style={{ cursor: "pointer" }}
                    onMouseEnter={() => onFloorHover(f)}
                    onMouseLeave={() => onFloorHover(null)}
                    onClick={() => onFloorClick(f)}
                  />

                  {/* 6. Scattered Organic Greenery (Sitting on the top surface of the slab) */}
                  {!hot && (
                    <g>
                      <circle cx={l + 35} cy={fy + (curveD * 0.5) - slabYOffset + 2} r={3} fill="#26421d" stroke="#5a7a4f" strokeWidth="0.5" />
                      <circle cx={cx} cy={fy + curveD - slabYOffset + 2} r={3} fill="#4d6f43" stroke="#5a7a4f" strokeWidth="0.5" />
                      <circle cx={r - 35} cy={fy + (curveD * 0.5) - slabYOffset + 2} r={3} fill="#3a5a30" stroke="#5a7a4f" strokeWidth="0.5" />
                    </g>
                  )}
                </g>
              );
            })}
            
            {/* Outer structural pillars merging into crowns (Drawn AFTER balconies to frame them) */}
            <rect x={l - 5} y={TOWER_TOP} width={8} height={BB - PODIUM_H - TOWER_TOP} fill="url(#goldGradient)" stroke="#8d5f38" strokeWidth="0.5"
              style={{ animation: "growPillar 1.8s cubic-bezier(0.25, 1, 0.5, 1) forwards", transformBox: "fill-box", transformOrigin: "bottom" }} />
            <rect x={r - 3} y={TOWER_TOP} width={8} height={BB - PODIUM_H - TOWER_TOP} fill="url(#goldGradient)" stroke="#8d5f38" strokeWidth="0.5"
              style={{ animation: "growPillar 1.8s cubic-bezier(0.25, 1, 0.5, 1) forwards", transformBox: "fill-box", transformOrigin: "bottom" }} />

            {/* WAVE CROWNS (Continuous architectural flow) */}
            <g style={{ opacity: 0, animation: "dropCrown 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) 1.9s forwards", transformBox: "fill-box", transformOrigin: "bottom" }}>
              {/* Drop Shadow onto top floor */}
              <path 
                d={isLeft 
                  ? \`M \${l - 5},\${TOWER_TOP} C \${l},\${TOWER_TOP - 40} \${cx},\${TOWER_TOP - 45} \${C_L},\${TOWER_TOP} L \${l},\${TOWER_TOP + 15} Z\`
                  : \`M \${C_R},\${TOWER_TOP} C \${cx},\${TOWER_TOP - 45} \${r},\${TOWER_TOP - 40} \${r + 5},\${TOWER_TOP} L \${r},\${TOWER_TOP + 15} Z\`
                }
                fill="rgba(0,0,0,0.5)" filter="url(#shadowBlur)"
              />
              
              {/* Top Face of the Crown (3D Volume) */}
              <path 
                d={isLeft 
                  ? \`M \${l - 5},\${TOWER_TOP - DY_TOP} C \${l},\${TOWER_TOP - 40 - DY_TOP} \${cx},\${TOWER_TOP - 45 - DY_TOP} \${C_L},\${TOWER_TOP - DY_TOP} L \${C_L},\${TOWER_TOP} C \${cx},\${TOWER_TOP - 45} \${l},\${TOWER_TOP - 40} \${l - 5},\${TOWER_TOP} Z\`
                  : \`M \${C_R},\${TOWER_TOP - DY_TOP} C \${cx},\${TOWER_TOP - 45 - DY_TOP} \${r},\${TOWER_TOP - 40 - DY_TOP} \${r + 5},\${TOWER_TOP - DY_TOP} L \${r + 5},\${TOWER_TOP} C \${r},\${TOWER_TOP - 40} \${cx},\${TOWER_TOP - 45} \${C_R},\${TOWER_TOP} Z\`
                }
                fill="#fdf1c5" stroke="#c59146" strokeWidth="0.5"
              />
              
              {/* Front Face of the Crown, merging into outer pillars */}
              <path 
                d={isLeft 
                  ? \`M \${l - 5},\${TOWER_TOP} C \${l},\${TOWER_TOP - 40} \${cx},\${TOWER_TOP - 45} \${C_L},\${TOWER_TOP} L \${C_L},\${TOWER_TOP - 12} C \${cx},\${TOWER_TOP - 55} \${l},\${TOWER_TOP - 50} \${l - 5},\${TOWER_TOP - 12} Z\`
                  : \`M \${C_R},\${TOWER_TOP} C \${cx},\${TOWER_TOP - 45} \${r},\${TOWER_TOP - 40} \${r + 5},\${TOWER_TOP} L \${r + 5},\${TOWER_TOP - 12} C \${r},\${TOWER_TOP - 50} \${cx},\${TOWER_TOP - 55} \${C_R},\${TOWER_TOP - 12} Z\`
                }
                fill="url(#goldGradient)" stroke="#8d5f38" strokeWidth="0.5"
              />
              
              {/* Programmatic Pergola Slats Under Arch */}
              {Array.from({ length: 7 }).map((_, i) => {
                const slatX = isLeft ? l + 25 + (i * 18) : r - 25 - (i * 18);
                const slatY = TOWER_TOP - 12 - (i * 3.5);
                return <rect key={i} x={slatX} y={slatY} width={4} height={15} fill="url(#bronzeGradient)" rx={1} />;
              })}
            </g>
          </g>
        );
      })}
    </g>
  );
}
"""

func_idx = -1
for i, line in enumerate(lines):
    if "export default function ProjectsPage()" in line:
        func_idx = i
        break

if func_idx == -1:
    print("Error: Could not find export default function ProjectsPage()")
    sys.exit(1)

# We need to replace lines 5 to func_idx - 1 with new_geometry
final_lines = []
for i in range(5):
    final_lines.append(lines[i])

final_lines.append(new_geometry)

for i in range(func_idx, len(lines)):
    final_lines.append(lines[i])

with open('src/app/projects/page.tsx', 'w') as f:
    f.write("".join(final_lines))

print("Volumetric Refactor complete.")
