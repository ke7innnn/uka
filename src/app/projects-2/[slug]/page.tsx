"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function ProjectDetail() {
  const params = useParams();
  const slug = params.slug as string;

  // Formatting slug to a readable title
  const title = slug.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");

  return (
    <main className="min-h-screen bg-white text-black font-sans pt-32 pb-32 px-8 md:px-16 selection:bg-[#F59E0B] selection:text-white">
      
      {/* ── BREADCRUMB / BACK ── */}
      <div className="max-w-7xl mx-auto mb-16">
        <Link 
          href="/projects-2" 
          className="text-xs uppercase tracking-widest text-gray-400 hover:text-[#F59E0B] transition-colors inline-flex items-center gap-2"
          data-testid="back-to-projects-link"
        >
          <span>←</span> Back to Index
        </Link>
      </div>

      {/* ── HEADER ── */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row gap-16 items-end mb-24">
        <div className="flex-1">
          <h1 className="text-5xl md:text-7xl font-light tracking-tight mb-8">
            {title}
          </h1>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-gray-200 pt-8">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-widest text-gray-400">Status</span>
              <span className="text-sm">Completed</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-widest text-gray-400">Year</span>
              <span className="text-sm">2023</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-widest text-gray-400">Location</span>
              <span className="text-sm">Mumbai, India</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-widest text-gray-400">Area</span>
              <span className="text-sm">12,500 sq.ft</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── HERO IMAGE ── */}
      <div className="max-w-7xl mx-auto w-full aspect-[21/9] bg-gray-100 relative mb-32 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2000&auto=format&fit=crop"
          alt={title}
          fill
          className="object-cover grayscale hover:grayscale-0 transition-all duration-1000 ease-in-out"
        />
      </div>

      {/* ── CONTENT BODY ── */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-16 mb-32">
        <div className="md:col-span-4">
          <h2 className="text-2xl font-light">Concept & Context</h2>
        </div>
        <div className="md:col-span-8 flex flex-col gap-8">
          <p className="text-lg leading-relaxed font-light text-gray-700">
            The project explores the dialogue between natural topography and structural intervention. By terracing the volumes along the site&apos;s natural contours, we minimized the ecological footprint while maximizing panoramic views.
          </p>
          <p className="text-lg leading-relaxed font-light text-gray-700">
            Materiality plays a crucial role in grounding the structure. Locally sourced stone, exposed concrete, and warm timber create a tactile experience that ages gracefully, rooting the architecture firmly in its context.
          </p>
        </div>
      </div>

      {/* ── GALLERY GRID ── */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 mb-32">
        <div className="aspect-[4/5] bg-gray-100 relative overflow-hidden group">
          <Image
            src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1200&auto=format&fit=crop"
            alt="Interior view"
            fill
            className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000"
          />
        </div>
        <div className="aspect-[4/5] bg-gray-100 relative overflow-hidden group">
          <Image
            src="https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=1200&auto=format&fit=crop"
            alt="Exterior detail"
            fill
            className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000"
          />
        </div>
      </div>

    </main>
  );
}
