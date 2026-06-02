import sys

with open('src/app/projects/page.tsx', 'r') as f:
    content = f.read()

defs_start = content.find("<defs>")
defs_end = content.find("</defs>") + 7

podium_start = content.find("{/* ── COMMERCIAL PODIUM BASE (2.5D Volumetric) ── */}")
podium_end = content.find("{/* ── TOWER WINGS (Back Recessed Wall) ── */}")

if defs_start == -1 or podium_start == -1:
    print("Could not find blocks")
    sys.exit(1)

new_defs = """<defs>
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
      </defs>"""

new_podium = """{/* ── COMMERCIAL PODIUM BASE (2.5D Volumetric) ── */}
      <g style={{ animation: "growPillar 1.5s cubic-bezier(0.25, 1, 0.5, 1) forwards", transformBox: "fill-box", transformOrigin: "bottom" }}>
        
        {/* Podium Top Roof Deck (Garden Deck, dark green tint, skewed back) */}
        <polygon 
          points={`380,${BB - PODIUM_H} 1020,${BB - PODIUM_H} 1020,${BB - PODIUM_H - DY_TOP} 380,${BB - PODIUM_H - DY_TOP}`} 
          fill="#334230" stroke="#222" strokeWidth="0.5" 
        />
        {/* Glass Safety Railing along the top edge */}
        <polygon 
          points={`380,${BB - PODIUM_H} 1020,${BB - PODIUM_H} 1020,${BB - PODIUM_H - 12} 380,${BB - PODIUM_H - 12}`} 
          fill="rgba(160, 210, 240, 0.25)" stroke="rgba(255, 255, 255, 0.6)" strokeWidth="0.5"
        />
        
        {/* Main Base Front Block */}
        <rect x={380} y={BB - PODIUM_H} width={640} height={PODIUM_H} fill="url(#bronzeGradient)" />
        
        {/* ── LEFT SECTION: Vertical Louvers ── */}
        <g>
          {/* Deep Recessed Background */}
          <rect x={410} y={BB - PODIUM_H + 30} width={390} height={140} fill="url(#recessedDark)" />
          {/* Vertical Gold Slats Loop */}
          {Array.from({ length: 22 }).map((_, i) => (
            <rect key={`louver-${i}`} x={414 + i * 17.5} y={BB - PODIUM_H + 30} width={8} height={140} fill="url(#goldGradient)" stroke="#8d5f38" strokeWidth="0.5" />
          ))}
        </g>
        
        {/* ── RIGHT SECTION: Open-Air Parking Garage ── */}
        <g>
          {/* Deep background to simulate interior volume */}
          <rect x={830} y={BB - PODIUM_H + 30} width={160} height={140} fill="#0A0805" />
          {/* 4 Distinct Parking Floors */}
          {Array.from({ length: 4 }).map((_, i) => {
            const slabY = BB - PODIUM_H + 30 + i * 35;
            return (
              <g key={`park-${i}`}>
                {/* Slab top face (deep perspective) */}
                <polygon 
                  points={`830,${slabY + 20} 990,${slabY + 20} 990,${slabY + 20 - 5} 830,${slabY + 20 - 5}`} 
                  fill="#c59146" 
                />
                
                {/* Tiny Parked Car Silhouettes (Only on first 3 levels) */}
                {i < 3 && i % 2 === 0 && <rect x={860} y={slabY + 15} width={18} height={5} fill="#a8b2b8" rx="2" />}
                {i < 3 && i % 2 !== 0 && <rect x={940} y={slabY + 15} width={18} height={5} fill="#dca864" rx="2" />}
                {i < 3 && i % 2 === 0 && <rect x={900} y={slabY + 15} width={16} height={5} fill="#3a4047" rx="2" />}

                {/* Slab front face */}
                <rect x={830} y={slabY + 20} width={160} height={15} fill="url(#goldGradient)" stroke="#8d5f38" strokeWidth="0.5" />
              </g>
            );
          })}
        </g>
        
        {/* ── GROUND LEVEL: Luxury Retail Storefronts ── */}
        <g>
          {/* Overall retail cutout background (warm illuminated interior) */}
          <rect x={395} y={BB - 50} width={610} height={50} fill="url(#storeIllum)" />
          
          {/* Shopfronts Loop */}
          {Array.from({ length: 11 }).map((_, i) => {
            const shopW = 610 / 11;
            const shopX = 395 + i * shopW;
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
          <rect x={392} y={BB - 50} width={6} height={50} fill="url(#bronzeGradient)" stroke="#222" strokeWidth="0.5" />
        </g>

        {/* Thick ground foundation line */}
        <line x1={300} x2={1100} y1={BB} y2={BB} stroke="#222" strokeWidth={5} />
      </g>

      """

content = content[:defs_start] + new_defs + content[defs_end:podium_start] + new_podium + content[podium_end:]

# Escape fix
content = content.replace("\\`", "`")
content = content.replace("\\$", "$")

with open('src/app/projects/page.tsx', 'w') as f:
    f.write(content)

print("Detailed podium refactor complete.")
