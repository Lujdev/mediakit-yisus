"use client";

import { useLang } from "../i18n/LanguageProvider";

/** Understated ES / EN switch: plain mono text, active one underlined. 44px touch targets via padding. */
export default function LanguageToggle({ className = "" }: { className?: string }) {
  const { lang, setLang, t } = useLang();
  return (
    <div
      role="group"
      aria-label={t.nav.langLabel}
      className={`inline-flex items-center font-mono text-[11px] tracking-[0.2em] ${className}`}
    >
      {(["es", "en"] as const).map((l, i) => (
        <span key={l} className="inline-flex items-center">
          {i === 1 && (
            <span aria-hidden className="text-white/20">
              /
            </span>
          )}
          <button
            type="button"
            onClick={() => setLang(l)}
            aria-pressed={lang === l}
            lang={l}
            className={`relative h-11 px-2.5 uppercase transition-colors duration-200 cursor-pointer ${
              lang === l ? "text-text-primary" : "text-text-secondary/60 hover:text-text-primary"
            }`}
          >
            {l}
            <span
              aria-hidden
              className={`absolute left-2.5 right-2.5 bottom-[9px] h-px bg-accent-lime transition-opacity duration-200 ${
                lang === l ? "opacity-100" : "opacity-0"
              }`}
            />
          </button>
        </span>
      ))}
    </div>
  );
}
