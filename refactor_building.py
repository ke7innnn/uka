import sys

with open('src/app/projects/page.tsx', 'r') as f:
    lines = f.readlines()

new_geometry = """/* ── Building geometry (Golden Skyscraper) ─────────────────────────── */
const BB = 730;          // ground line
const FH = 18;           // floor height
const FLOORS = 25;       // Number of tower floors
const PODIUM_H = 150;    // podium height
const TOWER_TOP = BB - PODIUM_H - (FLOORS * FH); // 130

// Left Wing
const L_L = 500;
const L_R = 670;
// Central Core
const C_L = 670;
const C_R = 730;
// Right Wing
const R_L = 730;
const R_R = 900;

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
        <linearGradient id="glassGradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(190, 230, 250, 0.35)" />
          <stop offset="50%" stopColor="rgba(240, 250, 255, 0.15)" />
          <stop offset="100%" stopColor="rgba(160, 210, 240, 0.45)" />
        </linearGradient>
        <linearGradient id="coreGlass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(180, 220, 240, 0.8)" />
          <stop offset="100%" stopColor="rgba(120, 180, 210, 0.4)" />
        </linearGradient>
      </defs>

      {/* ── COMMERCIAL PODIUM BASE ── */}
      <g style={{ animation: "growPillar 1.5s cubic-bezier(0.25, 1, 0.5, 1) forwards", transformBox: "fill-box", transformOrigin: "bottom" }}>
        <rect x={440} y={BB - PODIUM_H} width={520} height={PODIUM_H} fill="url(#bronzeGradient)" />
        {/* Left Side Bronze Vertical Louvers */}
        {Array.from({ length: 18 }).map((_, i) => (
          <rect key={i} x={450 + i * 14} y={BB - PODIUM_H + 25} width={5} height={90} fill="#5c3b24" />
        ))}
        {/* Right Side Dark Open-Air Garage Decks */}
        <rect x={720} y={BB - PODIUM_H + 25} width={220} height={90} fill="#2a1b12" />
        {Array.from({ length: 3 }).map((_, i) => (
          <rect key={i} x={720} y={BB - PODIUM_H + 25 + i * 30} width={220} height={7} fill="url(#goldGradient)" />
        ))}
        {/* Bottom Storefronts / Glass Entrances */}
        <rect x={440} y={BB - 35} width={520} height={35} fill="rgba(30, 45, 60, 0.85)" />
        <rect x={440} y={BB - 35} width={520} height={4} fill="url(#goldGradient)" />
        <line x1={360} x2={1040} y1={BB} y2={BB} stroke="#444" strokeWidth={2} />
      </g>

      {/* ── CENTRAL CORE ── */}
      <g style={{ animation: "growPillar 2s cubic-bezier(0.25, 1, 0.5, 1) forwards", transformBox: "fill-box", transformOrigin: "bottom" }}>
        <rect x={C_L} y={TOWER_TOP} width={C_R - C_L} height={BB - PODIUM_H - TOWER_TOP} fill="url(#coreGlass)" />
        {/* Core Vertical Mullions */}
        <line x1={C_L + 15} y1={TOWER_TOP} x2={C_L + 15} y2={BB - PODIUM_H} stroke="rgba(255,255,255,0.4)" strokeWidth={1} />
        <line x1={C_R - 15} y1={TOWER_TOP} x2={C_R - 15} y2={BB - PODIUM_H} stroke="rgba(255,255,255,0.4)" strokeWidth={1} />
        {/* Elevator Car */}
        <rect x={C_L + 10} y={TOWER_TOP + 180} width={(C_R - C_L) - 20} height={35} fill="#fff" fillOpacity="0.95" rx={2} />
      </g>

      {/* ── TOWER WINGS ── */}
      {[0, 1].map((wingIdx) => {
        const isLeft = wingIdx === 0;
        const l = isLeft ? L_L : R_L;
        const r = isLeft ? L_R : R_R;
        const cx = (l + r) / 2;
        
        return (
          <g key={wingIdx}>
            {/* Structural Background Pillar */}
            <rect x={l} y={TOWER_TOP} width={r - l} height={BB - PODIUM_H - TOWER_TOP} fill="#dfcaad" 
              style={{ animation: "growPillar 1.8s cubic-bezier(0.25, 1, 0.5, 1) forwards", transformBox: "fill-box", transformOrigin: "bottom" }} />
            
            {/* Floors Loop (Array of Paths) */}
            {Array.from({ length: FLOORS }).map((_, f) => {
              const fy = TOWER_TOP + f * FH;
              const hot = hotFloor !== null && f === hotFloor;
              const delay = (FLOORS - 1 - f) * 0.055; // Bottom-up stagger
              const curveD = 16;
              
              return (
                <g key={f} style={{ opacity: 0, animation: `popFloor 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${delay}s forwards`, transformBox: "fill-box", transformOrigin: "bottom" }}>
                  {/* Base Balcony Slab (Gold) */}
                  <path 
                    d={`M ${l},${fy} Q ${cx},${fy + curveD} ${r},${fy} L ${r},${fy + 5} Q ${cx},${fy + curveD + 5} ${l},${fy + 5} Z`}
                    fill={hot ? "#F59E0B" : "url(#goldGradient)"} 
                    stroke={hot ? "#fff" : "rgba(255,255,255,0.3)"} strokeWidth={0.8}
                    style={{ transition: "fill 0.2s" }}
                  />
                  {/* Translucent Cyan Glass Railing */}
                  <path 
                    d={`M ${l},${fy - 12} Q ${cx},${fy + curveD - 12} ${r},${fy - 12} L ${r},${fy} Q ${cx},${fy + curveD} ${l},${fy} Z`}
                    fill={hot ? "rgba(245,158,11,0.5)" : "url(#glassGradient)"}
                    style={{ transition: "fill 0.2s" }}
                  />
                  {/* Invisible Hitbox for Interaction */}
                  <path 
                    d={`M ${l},${fy - 12} Q ${cx},${fy + curveD - 12} ${r},${fy - 12} L ${r},${fy + 5} Q ${cx},${fy + curveD + 5} ${l},${fy + 5} Z`}
                    fill="transparent"
                    style={{ cursor: "pointer" }}
                    onMouseEnter={() => onFloorHover(f)}
                    onMouseLeave={() => onFloorHover(null)}
                    onClick={() => onFloorClick(f)}
                  />
                  {/* Scattered Organic Greenery (Potted plants on balconies) */}
                  {!hot && (
                    <g>
                      <circle cx={l + 35} cy={fy + (curveD * 0.6) - 3} r={2.5} fill="#3a5a30" />
                      <circle cx={cx} cy={fy + curveD - 3} r={2.5} fill="#4d6f43" />
                      <circle cx={r - 35} cy={fy + (curveD * 0.6) - 3} r={2.5} fill="#5a7a4f" />
                    </g>
                  )}
                </g>
              );
            })}

            {/* WAVE CROWNS (Golden Arched Canopies) */}
            <g style={{ opacity: 0, animation: "dropCrown 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) 1.9s forwards", transformBox: "fill-box", transformOrigin: "bottom" }}>
              <path 
                d={isLeft 
                  ? `M ${l - 12},${TOWER_TOP} C ${l},${TOWER_TOP - 40} ${cx},${TOWER_TOP - 45} ${C_L},${TOWER_TOP} L ${C_L},${TOWER_TOP - 8} C ${cx},${TOWER_TOP - 55} ${l},${TOWER_TOP - 50} ${l - 12},${TOWER_TOP - 8} Z`
                  : `M ${C_R},${TOWER_TOP} C ${cx},${TOWER_TOP - 45} ${r},${TOWER_TOP - 40} ${r + 12},${TOWER_TOP} L ${r + 12},${TOWER_TOP - 8} C ${r},${TOWER_TOP - 50} ${cx},${TOWER_TOP - 55} ${C_R},${TOWER_TOP - 8} Z`
                }
                fill="url(#goldGradient)"
              />
              {/* Programmatic Pergola Slats Under Arch */}
              {Array.from({ length: 7 }).map((_, i) => {
                const slatX = isLeft ? l + 25 + (i * 18) : r - 25 - (i * 18);
                const slatY = TOWER_TOP - 12 - (i * 3.5);
                return <rect key={i} x={slatX} y={slatY} width={3} height={12} fill="#b88f4b" />;
              })}
            </g>
          </g>
        );
      })}
    </g>
  );
}

"""

new_building_wrapper = """        {/* ── BUILDING WRAPPER ── */}
        <g>
          <GoldenSkyscraper hotFloor={hf} onFloorHover={handleFloorHover} onFloorClick={handleFloorClick} />
        </g>

"""

# Reconstruct the file
# 1. Keep lines 1-4
# 2. Add new_geometry
# 3. Find 'export default function ProjectsPage()' (which is around line 224)
# 4. Find '{/* ── BUILDING WRAPPER ── */}' and '{/* ── PROJECT NODES + CALLOUTS ── */}'

final_lines = []
for i in range(4):
    final_lines.append(lines[i])

final_lines.append(new_geometry)

# Find where 'export default function ProjectsPage()' is
func_idx = -1
for i, line in enumerate(lines):
    if "export default function ProjectsPage()" in line:
        func_idx = i
        break

wrapper_start = -1
nodes_start = -1
for i in range(func_idx, len(lines)):
    if "{/* ── BUILDING WRAPPER ── */}" in lines[i]:
        wrapper_start = i
    if "{/* ── PROJECT NODES + CALLOUTS ── */}" in lines[i]:
        nodes_start = i
        break

# Append from func_idx to wrapper_start
for i in range(func_idx, wrapper_start):
    final_lines.append(lines[i])

# Append the new building wrapper
final_lines.append(new_building_wrapper)

# Append from nodes_start to end
for i in range(nodes_start, len(lines)):
    final_lines.append(lines[i])

with open('src/app/projects/page.tsx', 'w') as f:
    f.write("".join(final_lines))

print("Refactor complete.")
