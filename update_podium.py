import sys

with open('src/app/projects/page.tsx', 'r') as f:
    content = f.read()

# Replace Constants block
old_consts = """const BB = 730;          // ground line
const FH = 22;           // floor height (increased for slender, taller look)
const FLOORS = 25;       // Number of tower floors
const PODIUM_H = 140;    // podium height
const TOWER_TOP = BB - PODIUM_H - (FLOORS * FH); // 730 - 140 - 550 = 40"""

new_consts = """const BB = 730;          // ground line
const FH = 22;           // floor height (increased for slender, taller look)
const FLOORS = 25;       // Number of tower floors
const PODIUM_H = 220;    // podium height
const TOWER_TOP = BB - PODIUM_H - (FLOORS * FH); // 730 - 220 - 550 = -40"""

content = content.replace(old_consts, new_consts)

# Extract and replace the podium block
podium_start = content.find("{/* ── COMMERCIAL PODIUM BASE (2.5D Volumetric) ── */}")
podium_end = content.find("{/* ── TOWER WINGS (Back Recessed Wall) ── */}")

if podium_start == -1 or podium_end == -1:
    print("Could not find podium block")
    sys.exit(1)

new_podium = """{/* ── COMMERCIAL PODIUM BASE (2.5D Volumetric) ── */}
      <g style={{ animation: "growPillar 1.5s cubic-bezier(0.25, 1, 0.5, 1) forwards", transformBox: "fill-box", transformOrigin: "bottom" }}>
        
        {/* Podium Top Roof Deck (Garden Deck, dark green tint, skewed back) */}
        <polygon 
          points={`380,${BB - PODIUM_H} 1020,${BB - PODIUM_H} 1020,${BB - PODIUM_H - DY_TOP} 380,${BB - PODIUM_H - DY_TOP}`} 
          fill="#334230" stroke="#222" strokeWidth="0.5" 
        />
        
        {/* Main Base Front Block */}
        <rect x={380} y={BB - PODIUM_H} width={640} height={PODIUM_H} fill="url(#bronzeGradient)" />
        
        {/* Left Side Box Background */}
        <rect x={410} y={BB - PODIUM_H + 30} width={390} height={160} fill="#0d0805" />
        {/* Left Side Horizontal Louvers */}
        {Array.from({ length: 8 }).map((_, i) => (
          <g key={i}>
            <polygon 
              points={`410,${BB - PODIUM_H + 40 + i * 20} 800,${BB - PODIUM_H + 40 + i * 20} 800,${BB - PODIUM_H + 40 + i * 20 - 3} 410,${BB - PODIUM_H + 40 + i * 20 - 3}`} 
              fill="#c59146" 
            />
            <rect x={410} y={BB - PODIUM_H + 40 + i * 20} width={390} height={4} fill="url(#goldGradient)" stroke="#8d5f38" strokeWidth="0.5" />
          </g>
        ))}
        
        {/* Right Side Dark Open-Air Garage Decks */}
        {/* Deep background to simulate interior volume */}
        <rect x={830} y={BB - PODIUM_H + 30} width={160} height={160} fill="#0d0805" />
        {/* Skewed parking grilles/slabs to show perspective */}
        {Array.from({ length: 6 }).map((_, i) => (
          <g key={i}>
            {/* Slab top face (deep) */}
            <polygon 
              points={`830,${BB - PODIUM_H + 40 + i * 24} 990,${BB - PODIUM_H + 40 + i * 24} 990,${BB - PODIUM_H + 40 + i * 24 - 4} 830,${BB - PODIUM_H + 40 + i * 24 - 4}`} 
              fill="#c59146" 
            />
            {/* Slab front face */}
            <rect x={830} y={BB - PODIUM_H + 40 + i * 24} width={160} height={5} fill="url(#goldGradient)" stroke="#8d5f38" strokeWidth="0.5" />
          </g>
        ))}
        
        {/* Bottom Storefronts / Glass Entrances */}
        <rect x={380} y={BB - 30} width={640} height={30} fill="rgba(20, 30, 40, 0.95)" />
        <rect x={380} y={BB - 30} width={640} height={4} fill="url(#goldGradient)" />
        <line x1={300} x2={1100} y1={BB} y2={BB} stroke="#333" strokeWidth={3} />
      </g>

      """

content = content[:podium_start] + new_podium + content[podium_end:]

# Fix duplicate comments at the top if present
content = content.replace("/* ── Building geometry (Golden Skyscraper) ─────────────────────────── */\n/* ── Building geometry (Golden Skyscraper 2.5D Volumetric) ─────────────────────────── */", "/* ── Building geometry (Golden Skyscraper 2.5D Volumetric) ─────────────────────────── */")

with open('src/app/projects/page.tsx', 'w') as f:
    f.write(content)

print("Podium update complete.")
