"use client";

import { useLang } from "../i18n/LanguageProvider";

export default function AttitudeBand() {
  const { t } = useLang();
  const words = t.band;

  const track = (hidden: boolean) => (
    <ul className="attitude-track" aria-hidden={hidden || undefined}>
      {words.map((word, index) => (
        <li key={`${word}-${index}`} className="flex shrink-0 items-center gap-6 md:gap-10">
          <span
            className={`font-serif text-3xl italic leading-none sm:text-4xl md:text-6xl ${
              index % 3 === 0 ? "text-accent-ink" : index % 3 === 1 ? "text-text-primary" : "text-outline"
            }`}
          >
            {word}
          </span>
          <span aria-hidden className="h-1.5 w-1.5 rotate-45 bg-accent-ink/80 md:h-2 md:w-2" />
        </li>
      ))}
    </ul>
  );

  return (
    <section aria-hidden className="attitude-band relative overflow-hidden border-y border-line/10">
      <div className="relative z-10 flex items-center justify-between gap-4 border-b border-line/10 px-4 py-2 md:px-7">
        <span className="flex items-center gap-2.5">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-ink opacity-60 motion-reduce:hidden" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent-ink" />
          </span>
          <span className="font-mono text-[9px] uppercase tracking-[0.26em] text-text-secondary">
            {t.bandLabel}
          </span>
        </span>

        <span className="flex items-baseline gap-2">
          <span className="font-display text-lg uppercase tracking-wide text-text-primary md:text-2xl">
            {t.bandStamp}
          </span>
          <span className="font-serif text-sm italic text-accent-ink md:text-base">2026</span>
        </span>
      </div>

      <div className="relative flex min-h-[64px] items-center overflow-hidden py-3 md:min-h-[86px] md:py-4">
        <div className="attitude-mask flex min-w-0 flex-1 items-center overflow-hidden">
          {track(false)}
          {track(true)}
        </div>
      </div>
    </section>
  );
}
