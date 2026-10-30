"use client";

import dynamic from "next/dynamic";
import { AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import type { FlexCarouselItem } from "../components/FlexCarousel";
import GalleryGrid from "../components/GalleryGrid";
import Lightbox from "../components/Lightbox";
import Reveal from "../components/Reveal";
import SectionHeader from "../components/SectionHeader";
import { GALLERY_IMAGES, type GalleryCategory, type GalleryImage } from "../data/gallery";
import { useSiteData } from "../data/SiteData";
import { useLang } from "../i18n/LanguageProvider";

const FlexCarousel = dynamic(() => import("../components/FlexCarousel"), { ssr: false });

type Filter = "all" | GalleryCategory;

export default function Gallery() {
  const { t, lang } = useLang();
  const siteData = useSiteData();
  // Photos managed in the admin. Bundled ones only until the data loads (never when the admin emptied the list).
  const source: GalleryImage[] = useMemo(
    () =>
      siteData
        ? siteData.media.gallery.map((m) => ({
            src: m.src,
            category: (m.category ?? "Outfit") as GalleryCategory,
            focal: m.focal,
            alt: m.alt,
          }))
        : GALLERY_IMAGES,
    [siteData]
  );
  const [filter, setFilter] = useState<Filter>("all");
  const [open, setOpen] = useState<number | null>(null);
  const [webgl, setWebgl] = useState(false);
  const [webglFailed, setWebglFailed] = useState(false);

  const categories = useMemo(
    () => [...new Set(source.map((i) => i.category))] as GalleryCategory[],
    [source]
  );
  const images = useMemo(
    () => (filter === "all" ? source : source.filter((i) => i.category === filter)),
    [filter, source]
  );
  const label = (c: GalleryCategory) => t.gallery.categories[c] ?? c;

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: no-preference)");
    const update = () => {
      if (!query.matches) {
        setWebgl(false);
        return;
      }
      const probe = document.createElement("canvas");
      const context = probe.getContext("webgl2");
      if (!context) {
        setWebgl(false);
        return;
      }
      context.getExtension("WEBGL_lose_context")?.loseContext();
      setWebgl(true);
    };
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const carouselItems: FlexCarouselItem[] = useMemo(
    () =>
      images.map((img) => ({
        src: img.src,
        alt: img.alt[lang],
        title: t.gallery.categories[img.category] ?? img.category,
      })),
    [images, lang, t]
  );

  const filters: { id: Filter; label: string; count: number }[] = [
    { id: "all", label: t.gallery.all, count: source.length },
    ...categories.map((c) => ({
      id: c as Filter,
      label: label(c),
      count: source.filter((i) => i.category === c).length,
    })),
  ];
  const pad = (n: number) => String(n).padStart(2, "0");
  const useCarousel = webgl && !webglFailed && images.length >= 3;

  if (siteData && source.length === 0) return null;

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

        {useCarousel ? (
          <>
            <div className="relative h-[440px] sm:h-[500px] lg:h-[600px]">
              <FlexCarousel
                key={filter}
                items={carouselItems}
                preset="liquid"
                intro="rise"
                fit="natural"
                cardHeight={0.62}
                gap={12}
                radius={16}
                squeeze={0.12}
                bend={0.24}
                dispersion={0.25}
                captureWheel={false}
                focusOnClick={false}
                captions
                imageWidth={828}
                onSelect={(index) => setOpen(index)}
                onError={() => setWebglFailed(true)}
                ariaLabel={t.gallery.title.join(" ")}
                ofLabel={t.gallery.of}
              />
            </div>
            <p className="mt-2 text-center font-mono text-[10px] uppercase tracking-widest text-text-secondary md:hidden">
              {t.gallery.carouselTouchHint}
            </p>
            <p className="mt-2 hidden text-center font-mono text-[11px] uppercase tracking-widest text-text-secondary md:block">
              {t.gallery.carouselHint}
            </p>
          </>
        ) : (
          <GalleryGrid key={filter} images={images} onSelect={setOpen} />
        )}
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
