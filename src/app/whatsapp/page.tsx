"use client";

import { useEffect, useState } from "react";

export default function WhatsAppRedirect() {
  const [status, setStatus] = useState("Connecting you to WhatsApp...");
  const [showWebLink, setShowWebLink] = useState(false);

  useEffect(() => {
    const phoneNumber = "919860146006";
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

    let appOpened = false;

    const handleBlur = () => {
      appOpened = true;
      setStatus("Opening chat in WhatsApp app...");
    };

    window.addEventListener("blur", handleBlur);

    // Attempt to open the WhatsApp Desktop/Mobile Application directly
    window.location.replace(`whatsapp://send?phone=${phoneNumber}`);

    const start = Date.now();
    const checkTimeout = setTimeout(() => {
      window.removeEventListener("blur", handleBlur);

      // If the page did not blur/lose focus within 1.5 seconds,
      // it means the WhatsApp app is likely not installed.
      if (Date.now() - start < 1500 && !appOpened && document.hasFocus()) {
        if (isMobile) {
          // Mobile fallback to standard universal link
          window.location.replace(`https://wa.me/${phoneNumber}`);
        } else {
          // Desktop fallback to WhatsApp Web
          setStatus("Opening WhatsApp Web...");
          window.location.replace(`https://web.whatsapp.com/send?phone=${phoneNumber}`);
        }
      } else {
        // App opened or prompt shown. Show options to open manually if it failed.
        setShowWebLink(true);
      }
    }, 1200);

    return () => {
      clearTimeout(checkTimeout);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-6 bg-black text-white font-sans">
      <div className="max-w-md w-full p-8 rounded-2xl border border-white/10 bg-[#0a0a0a]/90 backdrop-blur-xl shadow-2xl space-y-6">
        {/* Modern Premium Spinner */}
        <div className="relative w-16 h-16 mx-auto">
          <div className="absolute inset-0 rounded-full border-2 border-white/5"></div>
          <div className="absolute inset-0 rounded-full border-2 border-t-white border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
        </div>

        <div className="space-y-2">
          <h1 className="text-xl md:text-2xl font-serif italic text-white/90 font-medium">
            {status}
          </h1>
          <p className="text-white/40 text-sm">
            We are opening a chat session with Umesh Kekre & Associates.
          </p>
        </div>

        {showWebLink && (
          <div className="pt-4 border-t border-white/5 space-y-3">
            <p className="text-xs text-white/30">
              Not opening? You can choose a method below:
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="whatsapp://send?phone=919860146006"
                className="px-4 py-2 text-xs font-medium rounded-full bg-white text-black hover:bg-white/90 transition-all duration-300"
              >
                Launch App
              </a>
              <a
                href="https://web.whatsapp.com/send?phone=919860146006"
                className="px-4 py-2 text-xs font-medium rounded-full border border-white/10 text-white hover:bg-white/5 transition-all duration-300"
              >
                Use WhatsApp Web
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
