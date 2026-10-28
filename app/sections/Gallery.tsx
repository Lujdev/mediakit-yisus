"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

  // Circular "view" badge that follows the mouse over photos (fine pointers only).
  const badgeRef = useRef<HTMLDivElement>(null);

  // Mobile carousel arrows: step one card, and hide the arrow at either end.
  const trackRef = useRef<HTMLUListElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });
  const updateEdge = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setEdge({
      start: el.scrollLeft <= 4,
      end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4,
    });
  }, []);
  useEffect(() => {
    const el = trackRef.current;
    if (el) el.scrollTo({ left: 0 });
    updateEdge();
    window.addEventListener("resize", updateEdge);
    return () => window.removeEventListener("resize", updateEdge);
  }, [filter, updateEdge]);
  const step = (dir: 1 | -1) => {
    const el = trackRef.current;
    const card = el?.children[0] as HTMLElement | undefined;
    if (!el || !card) return;
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * (card.getBoundingClientRect().width + 12), behavior: smooth ? "smooth" : "auto" });
  };
  const moveCursor = (e: React.PointerEvent) => {
    const el = cursorRef.current;
    if (!el || e.pointerType !== "mouse") return;
    el.style.transform = `translate3d(${e.clientX - 48}px, ${e.clientY - 48}px, 0)`;
  };
  const showCursor = (visible: boolean) => {
    if (badgeRef.current) badgeRef.current.style.transform = visible ? "scale(1)" : "scale(0)";
  };

  const filters: { id: Filter; label: string; count: number }[] = [
    { id: "all", label: t.gallery.all, count: GALLERY_IMAGES.length },
    ...categories.map((c) => ({
      id: c as Filter,
      label: label(c),
      count: GALLERY_IMAGES.filter((i) => i.category === c).length,
    })),
  ];
  const pad = (n: number) => String(n).padStart(2, "0");

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
            className="mb-8 flex gap-x-7 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {filters.map((f) => {
              const active = filter === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setFilter(f.id)}
                  className={`group relative shrink-0 min-h-11 py-1 font-display text-3xl uppercase tracking-wide transition-colors cursor-pointer md:text-4xl ${
                    active ? "text-text-primary" : "text-text-secondary/50 hover:text-text-primary"
                  }`}
                >
                  {f.label}
                  <sup className="ml-1 align-super font-mono text-[10px] tracking-widest text-accent-ink">{pad(f.count)}</sup>
                  <span
                    aria-hidden
                    className={`absolute bottom-0 left-0 h-[3px] bg-accent-ink transition-all duration-300 ${
                      active ? "w-full" : "w-0 group-hover:w-1/3"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* Mobile: snap carousel. Desktop: masonry that keeps each photo's own proportions. */}
        <div className="relative">
        <motion.ul
          ref={trackRef}
          onScroll={updateEdge}
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
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4 pt-20">
                  <span className="font-display text-3xl leading-none tracking-wide text-text-primary md:text-4xl">
                    {label(img.category)}
                  </span>
                  <span className="font-mono text-[11px] tracking-widest text-accent-ink">
                    {pad(i + 1)}/{pad(images.length)}
                  </span>
                </div>
              </button>
            </li>
          ))}
        </motion.ul>
        {(["prev", "next"] as const).map((side) => {
          const hidden = side === "prev" ? edge.start : edge.end;
          return (
            <button
              key={side}
              type="button"
              aria-label={side === "prev" ? t.gallery.prev : t.gallery.next}
              onClick={() => step(side === "prev" ? -1 : 1)}
              tabIndex={hidden ? -1 : 0}
              className={`absolute top-[calc(50%-1rem)] z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-line/25 bg-bg-primary/80 text-text-primary backdrop-blur transition-opacity duration-200 md:hidden cursor-pointer ${
                side === "prev" ? "left-1" : "right-1"
              } ${hidden ? "pointer-events-none opacity-0" : "opacity-100"}`}
            >
              {side === "prev" ? <ChevronLeft size={22} aria-hidden /> : <ChevronRight size={22} aria-hidden />}
            </button>
          );
        })}
        </div>
        <p className="mt-2 text-center text-xs text-text-secondary md:hidden" aria-hidden>
          {t.gallery.swipeHint}
        </p>
      </div>

      <div
        ref={cursorRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[65] hidden h-24 w-24 md:block"
      >
        <div
          ref={badgeRef}
          style={{ transform: "scale(0)" }}
          className="relative flex h-full w-full items-center justify-center rounded-full bg-accent-lime text-on-accent transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
        >
          <svg viewBox="0 0 100 100" className="absolute inset-0 animate-[spin_9s_linear_infinite] motion-reduce:animate-none">
            <defs>
              <path id="gallery-cursor-circle" d="M50,50 m-36,0 a36,36 0 1,1 72,0 a36,36 0 1,1 -72,0" />
            </defs>
            <text fill="currentColor" fontSize="11" fontWeight="700" className="font-mono uppercase">
              <textPath href="#gallery-cursor-circle" textLength="224" lengthAdjust="spacing">
                {`${t.gallery.view} · ${t.gallery.view} · ${t.gallery.view} · `}
              </textPath>
            </text>
          </svg>
          <ArrowUpRight size={22} />
        </div>
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
