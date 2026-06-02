import sys

with open('src/app/projects/page.tsx', 'r') as f:
    content = f.read()

# Replace Central Core
core_start = content.find("{/* ── CENTRAL CORE (Cylindrical Glass Shaft) ── */}")
core_end = content.find("{/* ── TOWER WINGS (Volumetric Balconies) ── */}")

if core_start == -1 or core_end == -1:
    print("Could not find core block")
    sys.exit(1)

new_core = """{/* ── CENTRAL CORE (Cylindrical Glass Shaft) ── */}
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
        
        {/* Central Core Cap (Metallic Rounded Rectangle) */}
        <g style={{ animation: "dropCrown 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) 1.8s forwards", opacity: 0, transformBox: "fill-box", transformOrigin: "bottom" }}>
          <rect x={C_L + 2} y={TOWER_TOP - DY_TOP - 8} width={(C_R - C_L) - 4} height={12} fill="url(#bronzeGradient)" rx="4" />
          <rect x={C_L + 6} y={TOWER_TOP - DY_TOP - 12} width={(C_R - C_L) - 12} height={8} fill="url(#goldGradient)" rx="2" />
        </g>
      </g>

      """

content = content[:core_start] + new_core + content[core_end:]

# Now replace the wings block
wings_start = content.find("{/* ── TOWER WINGS (Volumetric Balconies) ── */}")
if wings_start == -1:
    wings_start = content.find("{/* ── TOWER WINGS (Volumetric Balconies & Crowns) ── */}")
    
wings_end = content.find("</g>\n    </g>\n  );\n}")

if wings_start == -1 or wings_end == -1:
    print("Could not find wings block")
    sys.exit(1)

new_wings = """{/* ── TOWER WINGS (Volumetric Balconies & Crowns) ── */}
      {[0, 1].map((wingIdx) => {
        const isLeft = wingIdx === 0;
        const l = isLeft ? L_L : R_L;
        const r = isLeft ? L_R : R_R;
        const cx = (l + r) / 2;
        const curveD = 18; // Depth of the balcony curve bulge
        const slabYOffset = 8; // How far the balcony extends backward (Y perspective depth)
        
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
                       {/* Solid Ceiling Path */}
                       <path 
                         d={`M ${l},${fy} Q ${cx},${fy + curveD} ${r},${fy} L ${r},${fy - 8} Q ${cx},${fy + curveD - 8} ${l},${fy - 8} Z`}
                         fill="#fef3cc"
                       />
                       {/* Ceiling Side Shading (Inner lip) */}
                       <path 
                         d={`M ${l},${fy} Q ${cx},${fy + curveD} ${r},${fy} L ${r},${fy - 2} Q ${cx},${fy + curveD - 2} ${l},${fy - 2} Z`}
                         fill="#dca864"
                       />
                       {/* Recessed Lights (Yellow/White gradient circles) */}
                       {Array.from({ length: 9 }).map((_, lightIdx) => {
                         const t = (lightIdx + 1) / 10;
                         const lx = (1-t)*(1-t)*l + 2*(1-t)*t*cx + t*t*r;
                         const ly = (1-t)*(1-t)*fy + 2*(1-t)*t*(fy + curveD) + t*t*fy - 4; // Shifted up onto the ceiling
                         return <circle key={`light-${lightIdx}`} cx={lx} cy={ly} r={2.5} fill="url(#storeIllum)" />;
                       })}
                     </g>
                  )}

                  {/* 1. Recessed Interior Crescent (Deep shadow behind glass) */}
                  <path 
                    d={`M ${l + 5},${fy - slabYOffset} Q ${cx},${fy + curveD - slabYOffset} ${r - 5},${fy - slabYOffset} L ${r - 5},${fy - FH} L ${l + 5},${fy - FH} Z`}
                    fill="rgba(10, 10, 10, 0.6)"
                  />

                  {/* 2. Top Surface of Slab (Perspective depth) */}
                  <path 
                    d={`M ${l},${fy - slabYOffset} Q ${cx},${fy + curveD - slabYOffset} ${r},${fy - slabYOffset} L ${r},${fy} Q ${cx},${fy + curveD} ${l},${fy} Z`}
                    fill={hot ? "#F59E0B" : "#fef3cc"} 
                  />

                  {/* 3. Bottom Lip (Concrete Thickness) */}
                  <path 
                    d={`M ${l},${fy} Q ${cx},${fy + curveD} ${r},${fy} L ${r},${fy + 4} Q ${cx},${fy + curveD + 4} ${l},${fy + 4} Z`}
                    fill={hot ? "#d48100" : "url(#goldGradient)"} 
                    stroke={hot ? "#fff" : "#8d5f38"} strokeWidth={0.5}
                    style={{ transition: "fill 0.2s" }}
                  />

                  {/* 4. Semi-Transparent Glass Railing */}
                  <path 
                    d={`M ${l + 3},${fy - FH + 12} Q ${cx},${fy + curveD - FH + 12} ${r - 3},${fy - FH + 12} L ${r - 3},${fy} Q ${cx},${fy + curveD} ${l + 3},${fy} Z`}
                    fill={hot ? "rgba(245,158,11,0.5)" : "rgba(160, 210, 240, 0.35)"}
                    stroke="rgba(255, 255, 255, 0.85)" strokeWidth={1}
                    style={{ transition: "fill 0.2s" }}
                  />
                  
                  {/* 5. Invisible Hitbox for Interaction */}
                  <path 
                    d={`M ${l},${fy - FH + 10} Q ${cx},${fy + curveD - FH + 10} ${r},${fy - FH + 10} L ${r},${fy + 4} Q ${cx},${fy + curveD + 4} ${l},${fy + 4} Z`}
                    fill="transparent"
                    style={{ cursor: "pointer" }}
                    onMouseEnter={() => onFloorHover(f)}
                    onMouseLeave={() => onFloorHover(null)}
                    onClick={() => onFloorClick(f)}
                  />

                  {/* 6. Scattered Organic Greenery */}
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
            
            {/* Outer structural pillars merging into crowns */}
            <rect x={l - 5} y={TOWER_TOP} width={8} height={BB - PODIUM_H - TOWER_TOP} fill="url(#goldGradient)" stroke="#8d5f38" strokeWidth="0.5"
              style={{ animation: "growPillar 1.8s cubic-bezier(0.25, 1, 0.5, 1) forwards", transformBox: "fill-box", transformOrigin: "bottom" }} />
            <rect x={r - 3} y={TOWER_TOP} width={8} height={BB - PODIUM_H - TOWER_TOP} fill="url(#goldGradient)" stroke="#8d5f38" strokeWidth="0.5"
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
                  <rect x={isLeft ? colX : colX - 6} y={TOWER_TOP - C_H} width={6} height={C_H} fill="url(#goldGradient)" stroke="#8d5f38" strokeWidth="0.5" />
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
                    <polygon points={`${slatX},${yBase} ${slatX + 3},${yBase - 3} ${slatX + 3},${yBase + 12} ${slatX},${yBase + 15}`} fill="#5c3b24" />
                    {/* Slat Front Face */}
                    <rect x={slatX} y={yBase} width={3} height={15} fill="url(#bronzeGradient)" />
                  </g>
                );
              })}

              {/* Side Shading Face (Outer Edge for depth) */}
              <path 
                d={`M ${isLeft ? CF_L : CF_R},${TOWER_TOP - C_H + 5} L ${isLeft ? CF_L : CF_R},${TOWER_TOP - C_H - 35} L ${isLeft ? CF_L + C_DX : CF_R + C_DX},${TOWER_TOP - C_H - 35 + C_DY} L ${isLeft ? CF_L + C_DX : CF_R + C_DX},${TOWER_TOP - C_H + 5 + C_DY} Z`}
                fill="#a06e39" stroke="#5c3b24" strokeWidth="0.5"
              />

              {/* Solid Top Roof Plane (Diamond/skewed polygon for 2.5D top-down view) */}
              <path 
                d={`M ${CF_L},${TOWER_TOP - C_H - 35} L ${CF_L + C_DX},${TOWER_TOP - C_H - 35 + C_DY} Q ${CF_CX + C_DX},${TOWER_TOP - C_H - 15 + C_DY} ${CF_R + C_DX},${TOWER_TOP - C_H - 35 + C_DY} L ${CF_R},${TOWER_TOP - C_H - 35} Q ${CF_CX},${TOWER_TOP - C_H - 15} ${CF_L},${TOWER_TOP - C_H - 35} Z`}
                fill="#fdf1c5" stroke="#c59146" strokeWidth="0.5"
              />

              {/* Heavy Solid Crown (Front Face Bow-tie) */}
              <path 
                d={`M ${CF_L},${TOWER_TOP - C_H + 5} L ${CF_L},${TOWER_TOP - C_H - 35} Q ${CF_CX},${TOWER_TOP - C_H - 15} ${CF_R},${TOWER_TOP - C_H - 35} L ${CF_R},${TOWER_TOP - C_H + 5} Q ${CF_CX},${TOWER_TOP - C_H + 20} ${CF_L},${TOWER_TOP - C_H + 5} Z`}
                fill="url(#goldGradient)" stroke="#8d5f38" strokeWidth="1.5"
              />

            </g>
          </g>
        );
      })}
"""

content = content[:wings_start] + new_wings + content[wings_end:]

content = content.replace("\\`", "`")
content = content.replace("\\$", "$")

with open('src/app/projects/page.tsx', 'w') as f:
    f.write(content)

print("Crown refactor complete.")
