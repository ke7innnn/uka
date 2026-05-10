"use client";

import { useLenis } from "lenis/react";
import Image from "next/image";
import Link from "next/link";

type Project = {
  id: string;
  title: string;
  year: string;
  slug: string;
};

type FloorData = {
  floor: string;
  name: string;
  category: string;
  projects: Project[];
};

const floorsData: FloorData[] = [
  {
    floor: "7",
    name: "Floor 7",
    category: "Visualisation",
    projects: [
      { id: "p25", title: "Future City Masterplan", year: "2024", slug: "future-city-masterplan" },
    ],
  },
  {
    floor: "6",
    name: "Floor 6",
    category: "Landscape",
    projects: [
      { id: "p22", title: "Urban Park Revival", year: "2023", slug: "urban-park-revival" },
      { id: "p23", title: "Coastal Promenade", year: "2022", slug: "coastal-promenade" },
      { id: "p24", title: "Botanical Gardens", year: "2021", slug: "botanical-gardens" },
    ],
  },
  {
    floor: "5",
    name: "Floor 5",
    category: "Institutional",
    projects: [
      { id: "p19", title: "National Library", year: "2023", slug: "national-library" },
      { id: "p20", title: "State University Campus", year: "2022", slug: "state-university-campus" },
      { id: "p21", title: "Modern Art Museum", year: "2021", slug: "modern-art-museum" },
    ],
  },
  {
    floor: "4",
    name: "Floor 4",
    category: "Hospitality",
    projects: [
      { id: "p15", title: "Boutique Hotel Retreat", year: "2024", slug: "boutique-hotel-retreat" },
      { id: "p16", title: "Mountain Resort", year: "2022", slug: "mountain-resort" },
      { id: "p17", title: "City Center Suites", year: "2021", slug: "city-center-suites" },
      { id: "p18", title: "Heritage Inn Restoration", year: "2020", slug: "heritage-inn-restoration" },
    ],
  },
  {
    floor: "3",
    name: "Floor 3",
    category: "Corporate",
    projects: [
      { id: "p12", title: "Tech Hub Headquarters", year: "2023", slug: "tech-hub-headquarters" },
      { id: "p13", title: "Financial District Tower", year: "2022", slug: "financial-district-tower" },
      { id: "p14", title: "Creative Agency Hub", year: "2021", slug: "creative-agency-hub" },
    ],
  },
  {
    floor: "2",
    name: "Floor 2",
    category: "Commercial",
    projects: [
      { id: "p8", title: "The Grand Atrium", year: "2023", slug: "the-grand-atrium" },
      { id: "p9", title: "Retail Galleria", year: "2022", slug: "retail-galleria" },
      { id: "p10", title: "Mixed-Use Complex", year: "2021", slug: "mixed-use-complex" },
      { id: "p11", title: "Urban Market Space", year: "2020", slug: "urban-market-space" },
    ],
  },
  {
    floor: "1",
    name: "Floor 1",
    category: "Interior Design",
    projects: [
      { id: "p4", title: "Minimalist Loft", year: "2023", slug: "minimalist-loft" },
      { id: "p5", title: "Executive Boardroom", year: "2022", slug: "executive-boardroom" },
      { id: "p6", title: "Luxury Penthouse", year: "2021", slug: "luxury-penthouse" },
      { id: "p7", title: "Artisan Coffee Shop", year: "2020", slug: "artisan-coffee-shop" },
    ],
  },
  {
    floor: "G",
    name: "Ground Floor",
    category: "Residential",
    projects: [
      { id: "p1", title: "The Courtyard House", year: "2023", slug: "the-courtyard-house" },
      { id: "p2", title: "Lakeside Villa", year: "2022", slug: "lakeside-villa" },
      { id: "p3", title: "Urban Townhouses", year: "2021", slug: "urban-townhouses" },
    ],
  },
];

export default function ProjectsPage() {
  const lenis = useLenis();

  const handleFloorClick = (floorId: string) => {
    const el = document.getElementById(`floor-${floorId}`);
    if (el) {
      lenis?.scrollTo(el, { duration: 1.2, offset: -100 });
    }
  };

  return (
    <main className="min-h-screen bg-white text-black font-sans pt-32 pb-24 px-8 md:px-16 selection:bg-[#F59E0B] selection:text-white">
      {/* ── HEADER ── */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row gap-16 md:gap-32 items-start md:items-end mb-32">
        <div className="flex-1">
          <h1 className="text-6xl md:text-8xl font-light tracking-tight mb-6">Index</h1>
          <p className="text-lg md:text-xl text-gray-500 font-light max-w-lg leading-relaxed">
            A comprehensive archive of Umesh Kekre & Associates&apos; architectural
            explorations, categorized by typology across our structural framework.
          </p>
        </div>

        {/* ── BUILDING INTERACTIVE SVG ── */}
        <div className="w-full md:w-auto flex flex-col items-center">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-6 w-full text-center md:text-left">
            Navigate by Typology
          </p>
          <div className="relative w-[280px] h-[400px] border border-gray-200 p-8 flex justify-center">
            <svg
              viewBox="0 0 100 320"
              className="w-full h-full overflow-visible drop-shadow-sm"
              preserveAspectRatio="xMidYMax meet"
            >
              <defs>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              
              {/* Building Base / Ground Line */}
              <line x1="-10" y1="310" x2="110" y2="310" stroke="currentColor" strokeWidth="2" />
              
              {floorsData.map((floorObj, index) => {
                const yPos = index * 40; // 0 is top (Floor 7), 280 is bottom (Ground)
                return (
                  <g
                    key={floorObj.floor}
                    className="group cursor-pointer transition-all duration-300 ease-out"
                    onClick={() => handleFloorClick(floorObj.floor)}
                    data-testid={`svg-floor-${floorObj.floor}`}
                  >
                    {/* Hover Target Area */}
                    <rect
                      x="0"
                      y={yPos}
                      width="100"
                      height="38"
                      fill="transparent"
                    />
                    
                    {/* Floor Structure */}
                    <rect
                      x="10"
                      y={yPos + 5}
                      width="80"
                      height="30"
                      fill="white"
                      stroke="black"
                      strokeWidth="1.5"
                      className="transition-colors duration-300 group-hover:fill-[#F59E0B] group-hover:stroke-[#F59E0B]"
                      style={{ filter: "url(#glow)" }}
                    />
                    
                    {/* Windows */}
                    <rect x="20" y={yPos + 12} width="12" height="16" fill="#e5e7eb" className="group-hover:fill-white/40 transition-colors" />
                    <rect x="44" y={yPos + 12} width="12" height="16" fill="#e5e7eb" className="group-hover:fill-white/40 transition-colors" />
                    <rect x="68" y={yPos + 12} width="12" height="16" fill="#e5e7eb" className="group-hover:fill-white/40 transition-colors" />
                    
                    {/* Floor Label */}
                    <text
                      x="-15"
                      y={yPos + 25}
                      className="text-[10px] fill-gray-400 font-sans tracking-widest group-hover:fill-[#F59E0B] transition-colors"
                      textAnchor="end"
                    >
                      {floorObj.floor}
                    </text>
                    
                    {/* Category Label (shows on hover) */}
                    <text
                      x="115"
                      y={yPos + 25}
                      className="text-[10px] fill-black font-sans tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      textAnchor="start"
                    >
                      {floorObj.category}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </header>

      {/* ── PROJECTS BY FLOOR ── */}
      <div className="max-w-7xl mx-auto flex flex-col gap-32">
        {floorsData.map((floorObj) => (
          <section
            key={floorObj.floor}
            id={`floor-${floorObj.floor}`}
            className="flex flex-col gap-12"
          >
            {/* Floor Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-gray-200 pb-6 gap-4">
              <div className="flex items-baseline gap-6">
                <span className="text-4xl font-light text-gray-300">
                  {floorObj.floor}
                </span>
                <h2 className="text-3xl md:text-5xl font-light tracking-tight">
                  {floorObj.category}
                </h2>
              </div>
              <span className="text-sm uppercase tracking-widest text-gray-400">
                {floorObj.projects.length} Project{floorObj.projects.length > 1 ? "s" : ""}
              </span>
            </div>

            {/* Project Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {floorObj.projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.slug}`}
                  className="group flex flex-col gap-4"
                  data-testid={`project-card-${project.slug}`}
                >
                  <div className="w-full aspect-[4/5] bg-gray-100 relative overflow-hidden">
                    {/* Placeholder for project image, using monochrome filter */}
                    <Image
                      src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop"
                      alt={project.title}
                      fill
                      className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-out"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-gray-400 tracking-widest uppercase">
                      {project.year}
                    </span>
                    <h3 className="text-lg font-normal group-hover:text-[#F59E0B] transition-colors duration-300">
                      {project.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
