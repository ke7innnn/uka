"use client";

import { motion } from "framer-motion";
import LogoMarquee from "./LogoMarquee";

export default function GoodiesContact() {
  const contactText = "For inquiries and collaborations, you can write to Umesh Kekre".split(" ");

  return (
    <div id="goodies-contact" className="horizontal-section w-screen h-screen flex-shrink-0 relative flex flex-col justify-between bg-black text-white px-8 md:px-32 py-12 md:py-24">
      <div className="absolute top-8 left-8 text-white/50 font-sans tracking-widest text-sm z-10 hidden md:block">
        6.
      </div>

      <div className="flex flex-col mt-12 md:mt-0">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="font-serif text-5xl md:text-8xl mb-16"
        >
          Resources & Contact
        </motion.h2>

        <LogoMarquee />
      </div>

      <div className="flex flex-col md:flex-row justify-between items-end gap-12 mt-16 md:mt-0 pb-12">
        <div className="flex-1 max-w-2xl">
          <div className="flex flex-wrap gap-x-3 gap-y-2 mb-8">
            {contactText.map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="font-serif text-3xl md:text-5xl italic"
              >
                {word}
              </motion.span>
            ))}
          </div>

          <motion.a
            href="mailto:umesh.s.kekre@gmail.com"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            viewport={{ once: true }}
            className="font-sans text-lg md:text-2xl border-b border-white pb-1 hover:text-gray-400 hover:border-gray-400 transition-colors"
          >
            umesh.s.kekre@gmail.com
          </motion.a>
        </div>

        <div className="flex flex-col items-start md:items-end gap-4 w-full md:w-auto">
          <div className="flex gap-6 mb-4">
            {["YouTube", "Twitter", "Instagram", "Facebook"].map((social, i) => (
              <motion.a
                key={i}
                href="#"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="font-sans text-xs uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
              >
                {social}
              </motion.a>
            ))}
          </div>


        </div>
      </div>
    </div>
  );
}
