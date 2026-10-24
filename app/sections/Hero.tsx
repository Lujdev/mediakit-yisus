"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Image from "next/image";

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/0.png"
          alt="Yisus Contreras"
          fill
          className="object-cover object-center opacity-40"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-bg-primary/60 via-bg-primary/40 to-bg-primary" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <p className="text-text-secondary text-sm md:text-base tracking-[0.4em] uppercase mb-4">
            Content Creator · Venezuela
          </p>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="font-display text-[15vw] md:text-[12rem] leading-[0.85] tracking-tight gradient-text mb-6"
        >
          YISUS
          <br />
          CONTRERAS
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="text-text-secondary text-base md:text-xl max-w-2xl mx-auto mb-8"
        >
          Moda · Lifestyle · Storytelling · Contenido para marcas
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex items-center justify-center gap-4"
        >
          <a
            href="#contact"
            className="inline-flex items-center justify-center px-8 py-3 bg-accent-orange text-bg-primary font-semibold rounded-full hover:bg-accent-lime transition-colors duration-300"
          >
            Trabajemos juntos
          </a>
          <a
            href="#about"
            className="inline-flex items-center justify-center px-8 py-3 border border-text-secondary/30 text-text-primary rounded-full hover:border-accent-lime hover:text-accent-lime transition-colors duration-300"
          >
            Conóceme
          </a>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.a
        href="#about"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-text-secondary hover:text-accent-lime transition-colors"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 8, 0] }}
        transition={{
          opacity: { delay: 1.2 },
          y: { repeat: Infinity, duration: 2, ease: "easeInOut" },
        }}
      >
        <span className="text-xs tracking-widest uppercase">Scroll</span>
        <ChevronDown size={20} />
      </motion.a>
    </section>
  );
}
