"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { GalleryCategory, GalleryImage } from "../data/gallery";
import { useChromaSpotlight } from "../hooks/useChromaSpotlight";
import { useLang } from "../i18n/LanguageProvider";

type GalleryGridProps = {
  images: GalleryImage[];
  onSelect: (index: number) => void;
};

export default function GalleryGrid({ images, onSelect }: GalleryGridProps) {
  const { t, lang } = useLang();
  const chromaRef = useChromaSpotlight<HTMLDivElement>();
  const cursorRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  const label = (category: GalleryCategory) => t.gallery.categories[category] ?? category;
  const pad = (n: number) => String(n).padStart(2, "0");

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
  }, [updateEdge]);

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

  return (
    <>
      <div ref={chromaRef} className="chroma relative">
        <motion.ul
          ref={trackRef}
          onScroll={updateEdge}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          onPointerMove={moveCursor}
          className="flex gap-3 overflow-x-auto snap-x snap-mandatory overscroll-x-contain -mx-4 px-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:grid md:grid-cols-3 md:gap-4 md:overflow-visible md:px-0 md:pb-0"
        >
          {images.map((img, i) => (
            <li key={img.src} data-chroma-card className="shrink-0 w-[78%] snap-center md:w-auto">
              <button
                type="button"
                onClick={() => onSelect(i)}
                onPointerEnter={(e) => e.pointerType === "mouse" && showCursor(true)}
                onPointerLeave={() => showCursor(false)}
                aria-label={`${label(img.category)} ${pad(i + 1)}/${pad(images.length)} · ${t.gallery.viewLarge}: ${img.alt[lang]}`}
                className="chroma-card group relative block w-full overflow-hidden rounded-2xl bg-bg-secondary cursor-pointer md:cursor-none"
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-bg-secondary">
                  <Image
                    src={img.src}
                    alt={img.alt[lang]}
                    width={1125}
                    height={1500}
                    sizes="(max-width: 768px) 78vw, 33vw"
                    style={{ objectPosition: img.focal }}
                    className="chroma-photo h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  />
                  <Image
                    src={img.src}
                    alt=""
                    aria-hidden
                    width={1125}
                    height={1500}
                    sizes="(max-width: 768px) 78vw, 33vw"
                    style={{ objectPosition: img.focal }}
                    className="chroma-colour absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  />
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/15 transition-colors duration-300 group-hover:ring-accent-lime/70"
                  />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-black/85 via-black/25 to-transparent p-4 pt-24">
                    <span className="font-display text-3xl leading-none tracking-wide text-white md:text-4xl">
                      {label(img.category)}
                    </span>
                    <span className="font-mono text-[11px] tracking-widest text-accent-lime">
                      {pad(i + 1)}/{pad(images.length)}
                    </span>
                  </div>
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

      <p className="mt-3 hidden text-center font-mono text-[11px] uppercase tracking-widest text-text-secondary md:block">
        {t.gallery.chromaHint}
      </p>
      <p className="mt-2 text-center text-xs text-text-secondary md:hidden" aria-hidden>
        {t.gallery.swipeHint}
      </p>

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
          <svg
            viewBox="0 0 100 100"
            className="absolute inset-0 animate-[spin_9s_linear_infinite] motion-reduce:animate-none"
          >
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
    </>
  );
}
