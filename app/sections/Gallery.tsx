"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";

const images = [
  { src: "/images/1.jpeg", alt: "Yisus estilo urbano", category: "Outfit" },
  { src: "/images/5.jpeg", alt: "Yisus denim", category: "Moda" },
  { src: "/images/6.jpeg", alt: "Yisus lifestyle", category: "Lifestyle" },
  { src: "/images/7.jpeg", alt: "Yisus fashion", category: "Outfit" },
  { src: "/images/9.jpeg", alt: "Yisus casual", category: "Lifestyle" },
  { src: "/images/IMG_20260903_132153_056.jpg.jpeg", alt: "Yisus portrait", category: "Portrait" },
  { src: "/images/IMG_20260903_132153_220.jpg.jpeg", alt: "Yisus look", category: "Outfit" },
  { src: "/images/_DSC7567 (1).jpg.jpeg", alt: "Yisus editorial", category: "Editorial" },
];

export default function Gallery() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <section id="gallery" className="relative py-24 md:py-32 px-4">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-accent-lime text-sm tracking-[0.3em] uppercase mb-4">
            Portafolio
          </p>
          <h2 className="font-display text-5xl md:text-7xl text-text-primary mb-4">
            GALERÍA
          </h2>
          <p className="text-text-secondary max-w-xl mx-auto">
            Un vistazo a mi mundo visual. Moda, lifestyle y momentos reales.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px] md:auto-rows-[250px]">
          {images.map((img, i) => (
            <motion.div
              key={img.src}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className={`relative rounded-xl overflow-hidden cursor-pointer group ${
                i === 0 || i === 5 ? "md:col-span-2 md:row-span-2" : ""
              }`}
              onClick={() => setSelected(img.src)}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                <span className="text-accent-lime text-xs tracking-wider uppercase">
                  {img.category}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {selected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-bg-primary/95 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div className="relative w-full max-w-4xl aspect-[3/4] md:aspect-[4/5]">
            <Image
              src={selected}
              alt="Gallery preview"
              fill
              className="object-contain"
            />
          </div>
          <button
            className="absolute top-6 right-6 text-text-primary hover:text-accent-lime transition-colors"
            onClick={() => setSelected(null)}
          >
            Cerrar
          </button>
        </motion.div>
      )}
    </section>
  );
}
