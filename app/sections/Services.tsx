"use client";

import { ArrowUpRight } from "lucide-react";
import { useLang } from "../i18n/LanguageProvider";
import { useSiteData } from "../data/SiteData";
import Reveal from "../components/Reveal";
import SectionHeader from "../components/SectionHeader";

export default function Services() {
  const { t, lang } = useLang();
  const data = useSiteData();
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
        <ul className="border-b border-white/10">
          {packages.map((pkg, i) => {
            const lit = pkg.popular;
            const main = lit ? "text-bg-primary" : "text-text-primary group-hover:text-bg-primary";
            const soft = lit ? "text-bg-primary/70" : "text-text-secondary group-hover:text-bg-primary/70";
            return (
              <Reveal key={pkg.name} delay={i * 0.08}>
                <li className="group relative isolate overflow-hidden border-t border-white/10">
                  <span
                    aria-hidden
                    className={`absolute inset-0 -z-10 origin-bottom bg-accent-lime transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      lit ? "scale-y-100" : "scale-y-0 group-hover:scale-y-100 group-focus-within:scale-y-100"
                    }`}
                  />
                  {pkg.popular && (
                    <span className="absolute right-4 top-4 rotate-[4deg] bg-accent-orange px-3 py-1 font-display text-xl tracking-wide text-bg-primary md:right-8 md:top-6">
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
                            className={`transition-colors ${lit ? "text-bg-primary" : "text-accent-lime group-hover:text-bg-primary"}`}
                          >
                            —
                          </span>
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <div className="flex items-end justify-between gap-4 md:flex-col md:items-end md:justify-start md:gap-6">
                      <p
                        className={`font-display text-8xl md:text-9xl leading-none transition-colors ${
                          lit
                            ? "text-bg-primary"
                            : "text-transparent [-webkit-text-stroke:1.5px_rgba(245,245,240,0.55)] group-hover:text-bg-primary group-hover:[-webkit-text-stroke:0]"
                        }`}
                      >
                        {pkg.price}
                      </p>
                      <a
                        href="#contact"
                        className={`inline-flex min-h-12 items-center gap-2 rounded-full px-6 font-semibold transition-colors cursor-pointer ${
                          lit
                            ? "bg-bg-primary text-accent-lime"
                            : "bg-text-primary text-bg-primary group-hover:bg-bg-primary group-hover:text-accent-lime"
                        }`}
                      >
                        {t.services.cta}
                        <ArrowUpRight size={18} aria-hidden />
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
