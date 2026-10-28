"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import { GALLERY_IMAGES, type GalleryCategory } from "../data/gallery";
import { useLang } from "../i18n/LanguageProvider";
import Lightbox from "../components/Lightbox";
import Reveal from "../components/Reveal";
import SectionHeader from "../components/SectionHeader";

type Filter = "all" | GalleryCategory;

export default function Gallery() {
  const { t, lang } = useLang();
  const [filter, setFilter] = useState<Filter>("all");
  const [open, setOpen] = useState<number | null>(null);
  const cursorRef = useRef<HTMLDivElement>(null);

  const categories = useMemo(
    () => [...new Set(GALLERY_IMAGES.map((i) => i.category))] as GalleryCategory[],
    []
  );
  const images = useMemo(
    () => (filter === "all" ? GALLERY_IMAGES : GALLERY_IMAGES.filter((i) => i.category === filter)),
    [filter]
  );
  const label = (c: GalleryCategory) => t.gallery.categories[c] ?? c;

  // "View" pill that follows the mouse over photos (fine pointers only).
  const moveCursor = (e: React.PointerEvent) => {
    const el = cursorRef.current;
    if (!el || e.pointerType !== "mouse") return;
    el.style.transform = `translate3d(${e.clientX + 14}px, ${e.clientY + 14}px, 0)`;
  };
  const showCursor = (visible: boolean) => {
    if (cursorRef.current) cursorRef.current.style.opacity = visible ? "1" : "0";
  };

  const chip = (active: boolean) =>
    `shrink-0 min-h-11 rounded-full px-4 text-sm font-medium transition-colors cursor-pointer ${
      active
        ? "bg-accent-lime text-bg-primary"
        : "border border-white/15 text-text-secondary hover:border-accent-lime hover:text-text-primary"
    }`;

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

        <Reveal>
          <div
            role="group"
            aria-label={t.gallery.filtersLabel}
            className="mb-8 flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <button type="button" aria-pressed={filter === "all"} onClick={() => setFilter("all")} className={chip(filter === "all")}>
              {t.gallery.all}
            </button>
            {categories.map((c) => (
              <button key={c} type="button" aria-pressed={filter === c} onClick={() => setFilter(c)} className={chip(filter === c)}>
                {label(c)}
              </button>
            ))}
          </div>
        </Reveal>

        {/* Mobile: snap carousel. Desktop: masonry that keeps each photo's own proportions. */}
        <motion.ul
          key={filter}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          onPointerMove={moveCursor}
          className="flex gap-3 overflow-x-auto snap-x snap-mandatory overscroll-x-contain -mx-4 px-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:px-0 md:block md:columns-3 md:gap-4 md:overflow-visible md:pb-0"
        >
          {images.map((img, i) => (
            <li
              key={img.src}
              className="shrink-0 w-[78%] snap-center md:w-auto md:mb-4 md:break-inside-avoid"
            >
              <button
                type="button"
                onClick={() => setOpen(i)}
                onPointerEnter={(e) => e.pointerType === "mouse" && showCursor(true)}
                onPointerLeave={() => showCursor(false)}
                aria-label={`${t.gallery.viewLarge}: ${img.alt[lang]}`}
                className="group relative block w-full overflow-hidden rounded-2xl cursor-pointer md:cursor-none"
              >
                <div className="relative aspect-[4/5] md:aspect-auto">
                  <Image
                    src={img.src}
                    alt={img.alt[lang]}
                    width={1125}
                    height={1500}
                    sizes="(max-width: 768px) 78vw, 33vw"
                    style={{ objectPosition: img.focal }}
                    className="h-full w-full object-cover md:h-auto grayscale-[35%] transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/80 via-transparent to-transparent opacity-70 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300" />
                <span className="absolute bottom-3 left-3 font-mono text-[11px] tracking-widest uppercase text-accent-lime md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 transition-all duration-300">
                  {label(img.category)}
                </span>
              </button>
            </li>
          ))}
        </motion.ul>
        <p className="mt-2 text-center text-xs text-text-secondary md:hidden" aria-hidden>
          {t.gallery.swipeHint}
        </p>
      </div>

      <div
        ref={cursorRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[65] hidden md:block rounded-full bg-accent-lime px-4 py-2 font-mono text-xs tracking-widest uppercase text-bg-primary opacity-0 transition-opacity duration-200"
      >
        {t.gallery.view}
      </div>

      <AnimatePresence>
        {open !== null && images[open] && (
          <Lightbox
            items={images.map((img) => ({ src: img.src, alt: img.alt[lang], caption: label(img.category) }))}
            index={open}
            onIndexChange={setOpen}
            onClose={() => setOpen(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
