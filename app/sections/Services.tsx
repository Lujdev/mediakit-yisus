"use client";

import { ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { useLang } from "../i18n/LanguageProvider";
import { useSiteData } from "../data/SiteData";
import Reveal from "../components/Reveal";
import SectionHeader from "../components/SectionHeader";

export default function Services() {
  const { t, lang } = useLang();
  const data = useSiteData();
  // Row under the pointer/focus. While one is active it wins over the default "popular" highlight.
  const [active, setActive] = useState<number | null>(null);
  const packages = data?.packages.length
    ? data.packages.map((p) => ({
        name: p.name,
        price: p.price,
        popular: p.popular,
        description: p.description[lang],
        features: p.features[lang],
      }))
    : t.services.packages.map((p, i) => ({ ...p, popular: i === 0 }));

  return (
    <section id="services" className="relative py-16 md:py-36 px-4">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          index="03"
          eyebrow={t.services.eyebrow}
          title={t.services.title}
          accentLine={0}
          description={t.services.description}
        />

        {/* Price list: ruled rows that flood with lime on hover; the popular one is always lit. */}
        <ul className="border-b border-line/10">
          {packages.map((pkg, i) => {
            const lit = active === null ? pkg.popular : active === i;
            const main = lit ? "text-on-accent" : "text-text-primary";
            const soft = lit ? "text-on-accent/70" : "text-text-secondary";
            return (
              <Reveal key={pkg.name} delay={i * 0.08}>
                <li
                  onMouseEnter={() => setActive(i)}
                  onMouseLeave={() => setActive(null)}
                  onFocusCapture={() => setActive(i)}
                  onBlurCapture={() => setActive(null)}
                  className="relative isolate overflow-hidden border-t border-line/10"
                >
                  <span
                    aria-hidden
                    className={`absolute inset-0 -z-10 origin-bottom bg-accent-lime transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      lit ? "scale-y-100" : "scale-y-0"
                    }`}
                  />
                  {pkg.popular && (
                    <span className="absolute right-4 top-4 rotate-[4deg] bg-accent-orange px-3 py-1 font-display text-xl tracking-wide text-on-accent md:right-8 md:top-6">
                      {t.services.popular}
                    </span>
                  )}
                  <div className="grid gap-x-10 gap-y-6 px-4 py-10 md:grid-cols-[2.5rem_minmax(0,1fr)_minmax(0,1fr)_auto] md:items-start md:px-8 md:py-14">
                    <span className={`font-mono text-xs tracking-widest transition-colors ${soft} md:pt-3`}>
                      {String(i + 1).padStart(2, "0")}
                    </span>

                    <div>
                      <h3 className={`font-display text-5xl md:text-6xl leading-none tracking-wide transition-colors ${main}`}>
                        {pkg.name}
                      </h3>
                      <p className={`mt-3 max-w-sm transition-colors ${soft}`}>{pkg.description}</p>
                    </div>

                    <ul className={`space-y-2 text-sm md:text-base transition-colors ${soft}`}>
                      {pkg.features.map((feature) => (
                        <li key={feature} className="flex gap-3">
                          <span
                            aria-hidden
                            className={`transition-colors ${lit ? "text-on-accent" : "text-accent-ink"}`}
                          >
                            —
                          </span>
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <div className="flex flex-col gap-5 md:items-end md:gap-6">
                      <p
                        className={`font-display text-8xl md:text-9xl leading-none transition-colors ${
                          lit
                            ? "text-on-accent"
                            : "text-transparent [-webkit-text-stroke:1.5px_rgb(var(--text-primary)/0.55)]"
                        }`}
                      >
                        {pkg.price}
                      </p>
                      <a
                        href="#contact"
                        className={`inline-flex min-h-14 w-full items-center justify-between gap-3 whitespace-nowrap rounded-full px-7 text-base font-semibold transition-colors cursor-pointer md:min-h-12 md:w-auto md:justify-center md:px-6 ${
                          lit
                            ? "bg-on-accent text-accent-lime"
                            : "bg-text-primary text-bg-primary"
                        }`}
                      >
                        {t.services.cta}
                        <ArrowUpRight size={20} aria-hidden />
                      </a>
                    </div>
                  </div>
                </li>
              </Reveal>
            );
          })}
        </ul>

        <Reveal>
          <p className="mt-8 text-sm text-text-secondary">{t.services.note}</p>
        </Reveal>
      </div>
    </section>
  );
}
