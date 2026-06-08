"use client";

import Image from "next/image";

const logos = [
  "/uka_logos/1.jpg",
  "/uka_logos/2.jpg",
  "/uka_logos/3.jpg",
  "/uka_logos/4.jpg",
  "/uka_logos/5.jpg",
  "/uka_logos/6.jpg",
  "/uka_logos/7.jpg",
  "/uka_logos/8.jpg",
  "/uka_logos/9.jpg",
  "/uka_logos/10.jpg",
];

export default function LogoMarquee() {
  return (
    <div className="w-screen -mx-8 md:-mx-32 bg-black py-4 md:py-6 overflow-hidden relative z-10 border-t border-white/10">
      <div className="w-full inline-flex flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]">
        <ul 
          className="flex items-center justify-start [&_li]:mx-2 [&_img]:max-w-none animate-marquee w-max"
          style={{ animationDuration: "50s" }}
        >
          {[...logos, ...logos].map((logo, i) => (
            <li key={i} className="relative w-64 h-36 md:w-96 md:h-56 flex-shrink-0 mix-blend-screen">
              <Image
                src={logo}
                alt={`Client Logo ${i}`}
                fill
                className="object-contain grayscale invert opacity-60 hover:opacity-100 transition-all duration-500 cursor-pointer"
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
