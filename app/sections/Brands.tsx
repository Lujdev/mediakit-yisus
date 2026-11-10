"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLang } from "../i18n/LanguageProvider";
import { useSiteData } from "../data/SiteData";
import Marquee, { type MarqueeItem } from "../components/Marquee";
import Reveal from "../components/Reveal";
import SectionHeader from "../components/SectionHeader";
import { VideoCard } from "./Videos";

const FALLBACK: MarqueeItem[] = ["COVAS", "SAMOS", "ANCDESIGN", "FVPS", "ROCKSTAR"].map((name) => ({ name }));

export default function Brands() {
  const { t } = useLang();
  const data = useSiteData();
  const brands: MarqueeItem[] = data?.brands.length ? data.brands : FALLBACK;
  const videos = data?.videos ?? [];
  const counts = new Map<number, number>();
  for (const video of videos) if (video.brandId != null) counts.set(video.brandId, (counts.get(video.brandId) ?? 0) + 1);
  const [open, setOpen] = useState<MarqueeItem | null>(null);
  const [peek, setPeek] = useState<{ item: MarqueeItem; left: number; top: number } | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (open && dialog.current && !dialog.current.open) dialog.current.showModal();
    if (!open && dialog.current?.open) dialog.current.close();
  }, [open]);
  useEffect(() => {
    if (!peek) return;
    const hide = () => setPeek(null);
    window.addEventListener("scroll", hide, { passive: true, once: true });
    return () => window.removeEventListener("scroll", hide);
  }, [peek]);

  const showPeek = (item: MarqueeItem | null, element?: HTMLElement) => {
    if (!item || !element) return setPeek(null);
    const r = element.getBoundingClientRect();
    setPeek({ item, left: Math.max(8, Math.min(r.left, window.innerWidth - 288)), top: Math.max(8, Math.min(r.bottom + 8, window.innerHeight - 160)) });
  };
  const marquee = { items: brands, videoCounts: counts, videoLabel: t.brands.videoLabel, onOpen: (item: MarqueeItem) => { setPeek(null); setOpen(item); }, onPeek: showPeek, paused: !!open || !!peek };
  const selected = videos.filter((video) => video.brandId === open?.id);
  const preview = videos.filter((video) => video.brandId === peek?.item.id).slice(0, 3);

  return (
    <section id="brands" className="relative bg-bg-secondary/50 py-16 md:py-36 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeader index="04" eyebrow={t.brands.eyebrow} title={t.brands.title} accentLine={0} description={t.brands.description} />
        {counts.size > 0 && <p className="mb-4 text-sm text-text-secondary">{t.brands.videoHint}</p>}
      </div>
      <Reveal>
        <div className="space-y-6 border-y border-line/10 py-8 md:py-10">
          <Marquee {...marquee} className="text-text-primary" />
          <Marquee {...marquee} reverse variant="outline" className="text-outline" />
        </div>
      </Reveal>
      {peek && !open && createPortal(<div aria-hidden className="pointer-events-none fixed z-50 w-72 max-w-[calc(100vw-16px)] rounded-xl border border-line/20 bg-bg-primary p-3 shadow-xl" style={{ left: peek.left, top: peek.top }}>
        <strong className="text-sm">{t.brands.videoHeading} {peek.item.name}</strong>
        <ul className="mt-2 flex gap-2">{preview.map((v) => <li key={v.id} className="min-w-0 flex-1 text-xs text-text-secondary">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={v.url.includes("res.cloudinary.com") ? v.url.replace("/f_mp4,q_auto/", "/so_0,q_auto/").replace(/\.mp4$/, ".jpg") : `/api/videos/preview?url=${encodeURIComponent(v.url)}`} alt="" className="h-16 w-full rounded object-cover" onError={(e) => { e.currentTarget.hidden = true; }} />
          <span className="block truncate">{v.title || "▶"}</span>
        </li>)}</ul>
      </div>, document.body)}
      <dialog ref={dialog} onClose={() => setOpen(null)} onClick={(e) => { if (e.target === e.currentTarget) setOpen(null); }} aria-label={open ? `${t.brands.videoHeading} ${open.name}` : undefined} className="max-h-[90vh] w-[min(96vw,70rem)] rounded-2xl border border-line/20 bg-bg-primary p-5 text-text-primary backdrop:bg-black/80 md:p-8">
        <div className="mb-6 flex items-center justify-between gap-4"><h3 className="font-display text-3xl">{t.brands.videoHeading} {open?.name}</h3><button type="button" className="min-h-11 min-w-11 text-xl focus-visible:outline focus-visible:outline-2" aria-label={t.gallery.close} onClick={() => setOpen(null)}>×</button></div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">{selected.map((video) => <VideoCard key={video.id} video={video} />)}</div>
      </dialog>
    </section>
  );
}
