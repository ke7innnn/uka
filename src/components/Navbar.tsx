"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLenis } from "lenis/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

const navLinks = [
  { id: "/", num: "", title: "Home" },
  { id: "/projects", num: "1.", title: "Projects" },
  { id: "#concert-organist", num: "2.", title: "The Architect" },
  { id: "#recording-artist", num: "3.", title: "Architect" },
  { id: "#organ-professor", num: "4.", title: "About Umesh Kekre" },
  { id: "#author-composer", num: "5.", title: "Architect & Designer" },
  { id: "#goodies-contact", num: "6.", title: "Resources & Contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const lenis = useLenis();
  const router = useRouter();
  const pathname = usePathname();

  const handleNavClick = (id: string) => {
    setIsOpen(false);
    
    setTimeout(() => {
      if (id.startsWith("#")) {
        const el = document.getElementById(id.replace("#", ""));
        if (el && pathname === "/") {
          lenis?.scrollTo(el, { duration: 1.5, offset: 0 });
        } else {
          router.push("/" + id);
        }
      } else {
        router.push(id);
      }
    }, 500);
  };

  return (
    <>
      {/* Top Left Logo */}
      <Link href="/" className="fixed top-8 -left-2 md:-left-6 z-50 hover:opacity-70 transition-opacity">
        <img src="/logo/uka%20logo.png" alt="Umesh Kekre & Associates" className="h-[100px] md:h-[120px] w-auto object-contain" />
      </Link>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-10 md:top-12 right-8 md:right-10 z-[70] w-12 h-12 flex flex-col justify-center items-center gap-[6px] group cursor-pointer"
      >
        <motion.div
          animate={isOpen ? { rotate: 45, y: 7.5 } : { rotate: 0, y: 0 }}
          transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
          className="w-8 h-[1.5px] bg-white origin-center"
        />
        <motion.div
          animate={isOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="w-8 h-[1.5px] bg-white origin-center"
        />
        <motion.div
          animate={isOpen ? { rotate: -45, y: -7.5 } : { rotate: 0, y: 0 }}
          transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
          className="w-8 h-[1.5px] bg-white origin-center"
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 z-[60] bg-black text-white flex flex-col justify-center px-12 md:px-32"
          >


            <ul className="flex flex-col gap-6 md:gap-10">
              {navLinks.map((link, i) => (
                <div key={link.id} className="overflow-hidden">
                  <motion.li
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{
                      duration: 0.8,
                      ease: [0.76, 0, 0.24, 1],
                      delay: isOpen ? 0.4 + i * 0.05 : 0,
                    }}
                    className="flex items-baseline gap-4 cursor-pointer group"
                    onClick={() => handleNavClick(link.id)}
                  >
                    <span className="text-sm md:text-lg font-sans opacity-50 group-hover:opacity-100 transition-opacity">
                      {link.num}
                    </span>
                    <span className="font-serif text-4xl md:text-6xl group-hover:ml-4 transition-all duration-300">
                      {link.title}
                    </span>
                  </motion.li>
                </div>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[50] flex flex-col md:flex-row-reverse gap-3 items-end md:items-center">
        
        {/* Permanent 'Chat Now' Pill Button */}
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="group relative flex items-center justify-center h-12 md:h-14 px-5 md:px-6 gap-2 rounded-full bg-[#0a0a0a]/80 border border-white/20 backdrop-blur-md shadow-2xl transition-all duration-500 hover:bg-white hover:border-white overflow-hidden cursor-pointer"
          title="Chat with us"
        >
          {/* Icon (Minimalist AI Bot) */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 md:w-5 md:h-5 text-white group-hover:text-black transition-colors duration-300">
            <rect width="16" height="12" x="4" y="8" rx="2"/>
            <path d="M2 14h2"/>
            <path d="M20 14h2"/>
            <path d="M15 13v2"/>
            <path d="M9 13v2"/>
            <path d="M12 8V4H8"/>
          </svg>
          {/* Text */}
          <span className="font-sans text-[13px] md:text-sm font-semibold tracking-wide text-white group-hover:text-black transition-colors duration-300 whitespace-nowrap">
            Chat Now
          </span>
        </button>

        {/* WhatsApp Button */}
        <a
          href="https://wa.me/1234567890" 
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#0a0a0a]/80 border border-white/20 backdrop-blur-md shadow-2xl transition-all duration-500 hover:bg-white overflow-hidden"
          title="WhatsApp Us"
        >
          <div className="absolute inset-0 flex items-center justify-center text-white group-hover:text-black transition-colors duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 md:w-6 md:h-6">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
            </svg>
          </div>
        </a>
      </div>

      {/* Chatbot Floating Window */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
            className="fixed bottom-24 right-6 md:bottom-28 md:right-8 z-[60] w-[320px] md:w-[360px] bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                    <rect width="16" height="12" x="4" y="8" rx="2"/>
                    <path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/><path d="M12 8V4H8"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-serif text-white font-medium text-lg leading-tight">UKA Assistant</h3>
                </div>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="text-white/50 hover:text-white transition-colors cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                </svg>
              </button>
            </div>

            {/* Chat Area */}
            <div className="p-5 h-[320px] overflow-y-auto flex flex-col gap-4">
              <div className="flex flex-col gap-1 items-start">
                <div className="bg-white/10 border border-white/10 text-white text-sm px-4 py-3 rounded-2xl rounded-tl-none max-w-[85%] font-sans leading-relaxed shadow-sm">
                  Hello! How can I assist you today? Let me know if you have any questions about our architectural projects or services.
                </div>
                <span className="text-white/30 text-[10px] uppercase ml-1 tracking-widest mt-1">Just now</span>
              </div>
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/10 bg-black/50">
              <div className="relative flex items-center">
                <input 
                  type="text" 
                  placeholder="Type your message..." 
                  className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-4 pr-12 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors font-sans"
                />
                <button className="absolute right-2 w-8 h-8 flex items-center justify-center rounded-full bg-white text-black hover:bg-gray-200 transition-colors cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 ml-[-2px] mt-[1px]">
                    <path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
