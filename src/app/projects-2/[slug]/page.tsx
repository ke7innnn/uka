"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { PROJECTS_DATA } from "@/lib/projectsData";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function ProjectDetail() {
  const params = useParams();
  const slug = params.slug as string;

  const project = PROJECTS_DATA.find(p => p.slug === slug);
  if (!project || project.isComingSoon) {
    notFound();
  }

  const { title, location, year, area, status, heroImage, images } = project;

  // Filter out the hero image to prevent duplicate rendering in the gallery
  const displayImages = (images || []).filter(img => img !== heroImage);

  // Dynamic aspect ratio detection to split text into blank space on portrait hero renders
  const [isPortrait, setIsPortrait] = useState(false);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    if (naturalHeight > naturalWidth) {
      setIsPortrait(true);
    }
  };

  // Premium GSAP ScrollTrigger Parallax effect
  useEffect(() => {
    // Hero image parallax (translates slightly slower/faster than page)
    const heroEl = document.querySelector(".hero-parallax");
    let heroTween: gsap.core.Tween | null = null;
    
    if (heroEl) {
      heroTween = gsap.to(heroEl, {
        y: 40,
        ease: "none",
        scrollTrigger: {
          trigger: heroEl,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    }

    // Gallery images parallax (creates multi-layered floating organic offsets)
    const galleryItems = document.querySelectorAll(".gallery-parallax");
    const galleryTweens: gsap.core.Tween[] = [];

    galleryItems.forEach((item, index) => {
      const direction = index % 2 === 0 ? 30 : -30;
      const t = gsap.to(item, {
        y: direction,
        ease: "none",
        scrollTrigger: {
          trigger: item,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
      galleryTweens.push(t);
    });

    return () => {
      if (heroTween) heroTween.kill();
      galleryTweens.forEach(t => t.kill());
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, [isPortrait]);

  // ──────────────────────────────────────────────────────────────────────────
  // 1. SPECIFIC PREMIUM LAYOUT FOR PORTRAIT RENDERS (Splits screen & utilizes blank space)
  // ──────────────────────────────────────────────────────────────────────────
  if (isPortrait) {
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

        {/* ── TWO-COLUMN SPLIT (No frames, text in blank space) ── */}
        <div className="max-w-7xl mx-auto mb-32">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">
            
            {/* PORTRAIT IMAGE (Occupies Left half beautifully, clean without grey frames) */}
            <div className="lg:col-span-5 w-full flex justify-center overflow-hidden rounded-lg">
              <img
                src={heroImage}
                alt={title}
                onLoad={handleImageLoad}
                className="hero-parallax w-full h-auto object-contain rounded-lg grayscale hover:grayscale-0 transition-all duration-1000 ease-in-out shadow-sm"
              />
            </div>

            {/* CONTENT & METADATA (Occupies Right half blank space, premium editorial typography) */}
            <div className="lg:col-span-7 flex flex-col justify-start lg:sticky lg:top-32">
              <h1 className="text-4xl md:text-6xl font-light tracking-tight mb-8">
                {title}
              </h1>
              
              <div className="grid grid-cols-2 gap-8 border-t border-b border-gray-150 py-8 mb-12">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Status</span>
                  <span className="text-sm font-medium">{status}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Year</span>
                  <span className="text-sm font-medium">{year}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Location</span>
                  <span className="text-sm font-medium">{location}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Area</span>
                  <span className="text-sm font-medium">{area}</span>
                </div>
              </div>

              <div>
                <h2 className="text-xs uppercase tracking-[0.2em] text-[#F59E0B] font-semibold mb-6">Concept &amp; Context</h2>
                <div className="flex flex-col gap-6 text-gray-600 font-light text-base leading-relaxed">
                  <p>
                    The project explores the dialogue between natural topography and structural intervention. By terracing the volumes along the site&apos;s natural contours, we minimized the ecological footprint while maximizing panoramic views.
                  </p>
                  <p>
                    Materiality plays a crucial role in grounding the structure. Locally sourced stone, exposed concrete, and warm timber create a tactile experience that ages gracefully, rooting the architecture firmly in its context.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── PORTRAIT LAYOUT GALLERY (Standard vertical flow, no frames) ── */}
        {displayImages.length > 0 && (
          <div className="max-w-7xl mx-auto pt-16 border-t border-gray-100">
            <div className="mb-12">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#F59E0B]">Gallery Portfolio</span>
              <h3 className="text-3xl font-light tracking-tight text-black mt-1">Archived Renders &amp; Drawings</h3>
            </div>
            
            <div className="columns-1 md:columns-2 lg:columns-3 gap-8 [column-fill:_balance]">
              {displayImages.map((imgUrl, i) => (
                <div key={imgUrl} className="break-inside-avoid mb-8 overflow-hidden rounded-lg group">
                  <img
                    src={imgUrl}
                    alt={`Gallery image ${i + 1}`}
                    className="gallery-parallax w-full h-auto object-contain rounded-lg grayscale group-hover:grayscale-0 group-hover:scale-[1.02] transition-all duration-1000"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 2. STANDARD PREMIUM LAYOUT FOR LANDSCAPE RENDERS (Clean, no grey frames)
  // ──────────────────────────────────────────────────────────────────────────
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
              <span className="text-sm">{status}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-widest text-gray-400">Year</span>
              <span className="text-sm">{year}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-widest text-gray-400">Location</span>
              <span className="text-sm">{location}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-widest text-gray-400">Area</span>
              <span className="text-sm">{area}</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── LANDSCAPE HERO IMAGE (Clean, zero grey borders/frames) ── */}
      <div className="max-w-7xl mx-auto w-full mb-32 overflow-hidden rounded-lg">
        <img
          src={heroImage}
          alt={title}
          onLoad={handleImageLoad}
          className="hero-parallax w-full h-auto object-contain grayscale hover:grayscale-0 transition-all duration-1000 ease-in-out"
        />
      </div>

      {/* ── CONTENT BODY ── */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-16 mb-32">
        <div className="md:col-span-4">
          <h2 className="text-2xl font-light">Concept &amp; Context</h2>
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

      {/* ── GALLERY GRID (Clean gallery flow, zero grey borders/frames) ── */}
      {displayImages.length > 0 && (
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 mb-32">
          {displayImages.map((imgUrl, i) => (
            <div key={imgUrl} className="relative overflow-hidden group rounded-lg">
              <img
                src={imgUrl}
                alt={`Gallery image ${i + 1}`}
                className="gallery-parallax w-full h-auto object-contain grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      )}

    </main>
  );
}

