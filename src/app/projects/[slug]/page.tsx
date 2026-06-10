"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, notFound, useRouter } from "next/navigation";
import { PROJECTS_DATA } from "@/lib/projectsData";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { motion } from "framer-motion";
import ArchitecturalTransition from "@/components/ArchitecturalTransition";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function ProjectDetail() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();

  const project = PROJECTS_DATA.find(p => p.slug === slug);
  if (!project || project.isComingSoon) {
    notFound();
  }

  const { title, heroImage, images } = project;

  const [introFinished, setIntroFinished] = useState(false);
  const [exitTransition, setExitTransition] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIntroFinished(true);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleBackToIndex = (e: React.MouseEvent) => {
    e.preventDefault();
    setExitTransition(true);
    setTimeout(() => {
      router.push(`/projects?from=${slug}`);
    }, 900);
  };

  // Filter out the hero image and remove duplicate photos using filename normalization
  const displayImages = (() => {
    const seenKeys = new Set<string>();
    return (images || [])
      .filter(img => img !== heroImage)
      .filter(img => {
        const filename = img.substring(img.lastIndexOf('/') + 1).toLowerCase();
        let baseKey = filename.replace(/\.(jpg|jpeg|png|webp|gif|psd)/g, '');
        baseKey = baseKey.replace(/[\s_-]copy/g, '')
                         .replace(/\(\d+\)/g, '')
                         .replace(/[\s_-]\d+$/g, '')
                         .trim();
        if (seenKeys.has(baseKey)) {
          return false;
        }
        seenKeys.add(baseKey);
        return true;
      });
  })();

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
      <>
        {!introFinished && <ArchitecturalTransition mode="enter" title={title} />}
        {exitTransition && <ArchitecturalTransition mode="exit" title={title} />}
        <motion.main
          className="min-h-screen bg-white text-black font-sans pt-20 md:pt-32 pb-16 md:pb-32 px-5 md:px-16 selection:bg-[#F59E0B] selection:text-white"
        >
        
        {/* ── BREADCRUMB / BACK ── */}
        <div className="max-w-7xl mx-auto mb-8 md:mb-16 flex justify-end">
          <Link 
            href={`/projects?from=${slug}`} 
            onClick={handleBackToIndex}
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
              <h1 className="text-3xl md:text-6xl font-light tracking-tight mb-6 md:mb-8">
                {title}
              </h1>
              



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

        </motion.main>
      </>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 2. STANDARD PREMIUM LAYOUT FOR LANDSCAPE RENDERS (Clean, no grey frames)
  // ──────────────────────────────────────────────────────────────────────────
  return (
    <>
      {!introFinished && <ArchitecturalTransition mode="enter" title={title} />}
      {exitTransition && <ArchitecturalTransition mode="exit" title={title} />}
      <motion.main
        className="min-h-screen bg-white text-black font-sans pt-20 md:pt-32 pb-16 md:pb-32 px-8 md:px-16 selection:bg-[#F59E0B] selection:text-white"
      >
      
      {/* ── BREADCRUMB / BACK ── */}
      <div className="max-w-7xl mx-auto mb-8 md:mb-16 flex justify-end">
        <Link 
          href={`/projects?from=${slug}`} 
          onClick={handleBackToIndex}
          className="text-xs uppercase tracking-widest text-gray-400 hover:text-[#F59E0B] transition-colors inline-flex items-center gap-2"
          data-testid="back-to-projects-link"
        >
          <span>←</span> Back to Index
        </Link>
      </div>

      {/* ── HEADER ── */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row gap-16 items-end mb-16 md:mb-24">
        <div className="flex-1">
          <h1 className="text-3xl md:text-7xl font-light tracking-tight mb-6 md:mb-8">
            {title}
          </h1>
          

        </div>
      </header>

      {/* ── LANDSCAPE HERO IMAGE (Clean, zero grey borders/frames) ── */}
      <div className="max-w-7xl mx-auto w-full mb-16 md:mb-32 overflow-hidden rounded-lg">
        <img
          src={heroImage}
          alt={title}
          onLoad={handleImageLoad}
          className="hero-parallax w-full h-auto object-contain grayscale hover:grayscale-0 transition-all duration-1000 ease-in-out"
        />
      </div>



      {/* ── GALLERY GRID (Clean gallery flow, zero grey borders/frames) ── */}
      {displayImages.length > 0 && (
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8 mb-16 md:mb-32">
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

      </motion.main>
    </>
  );
}

