"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, notFound, useRouter } from "next/navigation";
import { PROJECTS_DATA } from "@/lib/projectsData";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { motion, AnimatePresence } from "framer-motion";
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

  // Lightbox logic states
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right
  const allImages = [heroImage, ...displayImages];

  const openLightbox = (index: number) => {
    setDirection(0);
    setActiveImageIndex(index);
  };

  // Handle keyboard events for modal navigation (ArrowLeft, ArrowRight, Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeImageIndex === null) return;
      if (e.key === "Escape") {
        setActiveImageIndex(null);
      } else if (e.key === "ArrowLeft" && activeImageIndex > 0) {
        setDirection(-1);
        setActiveImageIndex(activeImageIndex - 1);
      } else if (e.key === "ArrowRight" && activeImageIndex < allImages.length - 1) {
        setDirection(1);
        setActiveImageIndex(activeImageIndex + 1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeImageIndex, allImages.length]);

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 80 : dir < 0 ? -80 : 0,
      scale: dir === 0 ? 0.95 : 1,
      opacity: 0,
    }),
    center: {
      x: 0,
      scale: 1,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -80 : dir < 0 ? 80 : 0,
      scale: dir === 0 ? 0.95 : 1,
      opacity: 0,
    }),
  };

  const renderLightbox = () => (
    <AnimatePresence initial={false} custom={direction}>
      {activeImageIndex !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center select-none"
          onClick={() => setActiveImageIndex(null)}
        >
          {/* Close Button */}
          <button
            onClick={() => setActiveImageIndex(null)}
            className="absolute top-8 right-8 text-white/60 hover:text-white text-xs uppercase tracking-widest font-sans transition-colors z-[60] border border-white/20 rounded-full px-4 py-2 bg-black/40 hover:bg-black/60"
          >
            Close [X]
          </button>
          {/* Prev Button */}
          {activeImageIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDirection(-1);
                setActiveImageIndex(activeImageIndex - 1);
              }}
              className="absolute left-8 text-white/50 hover:text-white text-2xl font-serif transition-colors z-[60] bg-black/40 border border-white/10 w-12 h-12 rounded-full flex items-center justify-center hover:border-white/30 hover:bg-black/60"
            >
              {"<"}
            </button>
          )}
          {/* Next Button */}
          {activeImageIndex < allImages.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDirection(1);
                setActiveImageIndex(activeImageIndex + 1);
              }}
              className="absolute right-8 text-white/50 hover:text-white text-2xl font-serif transition-colors z-[60] bg-black/40 border border-white/10 w-12 h-12 rounded-full flex items-center justify-center hover:border-white/30 hover:bg-black/60"
            >
              {">"}
            </button>
          )}
          {/* Image Container with Animation */}
          <motion.div
            key={activeImageIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
              scale: { duration: 0.3 }
            }}
            className="relative w-[90vw] h-[80vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={allImages[activeImageIndex]}
              alt={`Quick view image ${activeImageIndex + 1}`}
              className="max-w-full max-h-full object-contain rounded-md shadow-2xl"
            />
            <div className="absolute bottom-[-40px] left-1/2 -translate-x-1/2 text-center text-xs uppercase tracking-widest text-white/50">
              {activeImageIndex + 1} / {allImages.length}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Premium GSAP ScrollTrigger Parallax effect
  useEffect(() => {
    // Hero image parallax
    const heroEl = document.querySelector(".hero-parallax");
    let heroTween: gsap.core.Tween | null = null;
    
    if (heroEl) {
      heroTween = gsap.to(heroEl, {
        y: 30,
        ease: "none",
        scrollTrigger: {
          trigger: heroEl,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    }

    // Gallery images parallax
    const galleryItems = document.querySelectorAll(".gallery-parallax");
    const galleryTweens: gsap.core.Tween[] = [];

    galleryItems.forEach((item, index) => {
      const direction = index % 2 === 0 ? 20 : -20;
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
  }, []);

  return (
    <>
      {!introFinished && <ArchitecturalTransition mode="enter" title={title} />}
      {exitTransition && <ArchitecturalTransition mode="exit" title={title} />}
      <motion.main
        className="min-h-screen bg-white text-black font-sans pt-20 md:pt-32 pb-16 md:pb-32 px-6 md:px-16 selection:bg-[#F59E0B] selection:text-white"
      >
        {/* ── BREADCRUMB / BACK ── */}
        <div className="max-w-5xl mx-auto mb-8 md:mb-16 flex justify-end">
          <Link 
            href={`/projects?from=${slug}`} 
            onClick={handleBackToIndex}
            className="text-xs uppercase tracking-widest text-gray-400 hover:text-[#F59E0B] transition-colors inline-flex items-center gap-2"
            data-testid="back-to-projects-link"
          >
            <span>←</span> Back to Index
          </Link>
        </div>

        {/* ── TITLE BLOCK ── */}
        <header className="max-w-5xl mx-auto mb-12 md:mb-20">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#F59E0B] font-sans font-semibold">
            Project Profile
          </span>
          <h1 
            className="text-4xl md:text-7xl font-light tracking-tight mt-2 text-black leading-tight"
            style={{ fontFamily: "var(--font-cormorant), serif" }}
          >
            {title}
          </h1>
        </header>

        {/* ── HERO IMAGE (Clean, zero borders, fits aspect ratio) ── */}
        <div 
          className="max-w-5xl mx-auto w-full mb-12 md:mb-24 overflow-hidden rounded-lg flex justify-center cursor-zoom-in"
          onClick={() => openLightbox(0)}
        >
          <img
            src={heroImage}
            alt={title}
            className="hero-parallax w-full h-auto max-h-[85vh] object-contain rounded-lg grayscale hover:grayscale-0 transition-all duration-1000 ease-in-out shadow-sm"
          />
        </div>

        {/* ── GALLERY SECTION (Responsive Grid) ── */}
        {displayImages.length > 0 && (
          <div className="max-w-5xl mx-auto pt-12 border-t border-gray-100">
            <div className="mb-12">
              <span className="text-[9px] uppercase tracking-[0.25em] text-gray-400">Portfolio Details</span>
              <h3 className="text-2xl font-light tracking-tight text-black mt-1">Archived Renders &amp; Drawings</h3>
            </div>
            
            <div className="columns-1 md:columns-2 gap-6 md:gap-8 [column-fill:_balance]">
              {displayImages.map((imgUrl, i) => (
                <div 
                  key={imgUrl} 
                  className="break-inside-avoid mb-6 md:mb-8 overflow-hidden rounded-lg group cursor-zoom-in"
                  onClick={() => openLightbox(i + 1)}
                >
                  <img
                    src={imgUrl}
                    alt={`Gallery image ${i + 1}`}
                    className="gallery-parallax w-full h-auto object-contain rounded-lg grayscale group-hover:grayscale-0 group-hover:scale-[1.02] transition-all duration-1000"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.main>
      {renderLightbox()}
    </>
  );
}
