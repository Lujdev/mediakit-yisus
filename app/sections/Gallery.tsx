"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useLang } from "../i18n/LanguageProvider";
import Reveal from "../components/Reveal";
import SectionHeader from "../components/SectionHeader";

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
  const { t } = useLang();
  const [selected, setSelected] = useState<(typeof images)[number] | null>(null);

  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSelected(null);
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [selected]);

  return (
    <section id="gallery" className="relative py-16 md:py-36 px-4">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          index="05"
          eyebrow={t.gallery.eyebrow}
          title={t.gallery.title}
          accentLine={0}
          description={t.gallery.description}
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 auto-rows-[200px] md:auto-rows-[260px]">
          {images.map((img, i) => (
            <Reveal
              key={img.src}
              delay={(i % 4) * 0.07}
              className={i === 0 || i === 5 ? "md:col-span-2 md:row-span-2" : ""}
            >
              <button
                type="button"
                onClick={() => setSelected(img)}
                aria-label={`${t.gallery.viewLarge}: ${img.alt}`}
                className="relative block h-full w-full rounded-2xl overflow-hidden cursor-pointer group"
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes={i === 0 || i === 5 ? "(max-width: 768px) 50vw, 50vw" : "(max-width: 768px) 50vw, 25vw"}
                  className="object-cover grayscale-[40%] transition-all duration-700 group-hover:grayscale-0 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/85 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10 group-hover:ring-accent-lime/60 transition-all duration-300" />
                <span className="absolute bottom-4 left-4 font-mono text-xs tracking-widest uppercase text-accent-lime translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  {t.gallery.categories[img.category] ?? img.category}
                </span>
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={selected.alt}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[70] bg-bg-primary/95 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-4xl aspect-[3/4] md:aspect-[4/5] max-h-[90svh]"
            >
              <Image src={selected.src} alt={selected.alt} fill sizes="90vw" className="object-contain" />
            </motion.div>
            <button
              type="button"
              aria-label={t.gallery.close}
              className="absolute top-5 right-5 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 text-text-primary hover:border-accent-lime hover:text-accent-lime transition-colors cursor-pointer"
              onClick={() => setSelected(null)}
            >
              <X size={22} aria-hidden />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
