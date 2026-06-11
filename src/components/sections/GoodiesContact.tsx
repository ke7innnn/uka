"use client";

import { motion } from "framer-motion";
import LogoMarquee from "./LogoMarquee";

export default function GoodiesContact() {
  const contactText = "For inquiries and collaborations, you can write to Umesh Kekre".split(" ");

  return (
    <div id="goodies-contact" className="horizontal-section w-screen min-h-screen h-auto md:h-screen flex-shrink-0 relative flex flex-col justify-between bg-black text-white px-6 md:px-32 py-10 md:py-24 gap-8 md:gap-12">
      <div className="flex flex-col mt-4 md:mt-0">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="font-serif text-5xl md:text-8xl mb-6 md:mb-16"
        >
          Resources & Contact
        </motion.h2>

        <LogoMarquee />
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12 mt-8 md:mt-0 pb-6 md:pb-12">
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
            className="font-sans text-base md:text-2xl border-b border-white pb-1 hover:text-gray-400 hover:border-gray-400 transition-colors break-all"
          >
            umesh.s.kekre@gmail.com
          </motion.a>
        </div>

        <div className="flex flex-col items-start md:items-end gap-4 w-full md:w-auto" />
      </div>
    </div>
  );
}
