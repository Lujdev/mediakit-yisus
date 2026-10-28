"use client";

import { Play, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import type { Video } from "@/lib/site-data";
import { useLang } from "../i18n/LanguageProvider";
import { useSiteData } from "../data/SiteData";
import Reveal from "../components/Reveal";
import SectionHeader from "../components/SectionHeader";

type Kind =
  | { type: "youtube"; id: string }
  | { type: "file" }
  | { type: "link"; platform: string };

function classify(raw: string): Kind {
  try {
    const u = new URL(raw);
    const host = u.hostname.replace(/^www\.|^m\./, "");
    if (host === "youtu.be") return { type: "youtube", id: u.pathname.slice(1) };
    if (host === "youtube.com") {
      const id = u.searchParams.get("v") ?? u.pathname.match(/^\/(?:shorts|embed)\/([\w-]+)/)?.[1];
      if (id) return { type: "youtube", id };
    }
    if (/\.(mp4|webm|mov)$/i.test(u.pathname)) return { type: "file" };
    if (host.includes("tiktok")) return { type: "link", platform: "TikTok" };
    if (host.includes("instagram")) return { type: "link", platform: "Instagram" };
    return { type: "link", platform: host };
  } catch {
    return { type: "link", platform: "" };
  }
}

/** Cloudinary delivery URLs get a first-frame poster so the card is not black before playback. */
function posterFor(url: string) {
  return url.includes("res.cloudinary.com") && url.includes("/f_mp4,q_auto/")
    ? url.replace("/f_mp4,q_auto/", "/so_0,q_auto/").replace(/\.mp4$/, ".jpg")
    : undefined;
}

function YouTubeLite({ id, title }: { id: string; title: string }) {
  const { t } = useLang();
  const [playing, setPlaying] = useState(false);
  if (playing) {
    return (
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
        title={title || "YouTube"}
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        className="absolute inset-0 h-full w-full"
      />
    );
  }
  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label={`${t.videos.play}: ${title || "YouTube"}`}
      className="group absolute inset-0 cursor-pointer"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
        alt=""
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <span className="absolute inset-0 bg-bg-primary/30 group-hover:bg-bg-primary/10 transition-colors" />
      <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-accent-lime text-on-accent shadow-xl shadow-black/40 transition-transform group-hover:scale-110">
        <Play size={26} fill="currentColor" aria-hidden />
      </span>
    </button>
  );
}

function VideoCard({ video }: { video: Video }) {
  const { t } = useLang();
  const kind = classify(video.url);

  return (
    <figure className="flex flex-col gap-3">
      <div className="relative aspect-video overflow-hidden rounded-2xl bg-bg-secondary ring-1 ring-line/10">
        {kind.type === "youtube" && <YouTubeLite id={kind.id} title={video.title} />}
        {kind.type === "file" && (
          <video
            src={video.url}
            controls
            playsInline
            preload="metadata"
            poster={posterFor(video.url)}
            className="absolute inset-0 h-full w-full bg-black object-contain"
          />
        )}
        {kind.type === "link" && (
          <a
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-bg-secondary to-bg-primary cursor-pointer"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-lime text-on-accent transition-transform group-hover:scale-110">
              <Play size={22} fill="currentColor" aria-hidden />
            </span>
            <span className="inline-flex items-center gap-1 font-mono text-xs tracking-widest uppercase text-text-secondary group-hover:text-accent-ink transition-colors">
              {t.videos.watchOn} {kind.platform}
              <ArrowUpRight size={14} aria-hidden />
            </span>
          </a>
        )}
      </div>
      {video.title && <figcaption className="text-text-primary text-sm md:text-base">{video.title}</figcaption>}
    </figure>
  );
}

export default function Videos() {
  const { t } = useLang();
  const videos = useSiteData()?.videos ?? [];
  if (videos.length === 0) return null;

  return (
    <section id="videos" className="relative py-16 md:py-36 px-4">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          index="06"
          eyebrow={t.videos.eyebrow}
          title={t.videos.title}
          accentLine={0}
          description={t.videos.description}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {videos.map((video, i) => (
            <Reveal key={video.id} delay={(i % 3) * 0.08}>
              <VideoCard video={video} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
