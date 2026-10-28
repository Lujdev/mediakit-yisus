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

        {/* Price list: one ruled row per package, price as the loudest element. */}
        <ul className="border-b border-white/10">
          {packages.map((pkg, i) => (
            <Reveal key={pkg.name} delay={i * 0.08}>
              <li className="grid gap-x-10 gap-y-6 border-t border-white/10 py-8 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_auto] md:items-start md:py-12">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="font-display text-4xl md:text-5xl leading-none tracking-wide text-text-primary">
                      {pkg.name}
                    </h3>
                    {pkg.popular && (
                      <span className="bg-accent-orange px-2 py-1 font-mono text-[11px] tracking-widest uppercase text-bg-primary">
                        {t.services.popular}
                      </span>
                    )}
                  </div>
                  <p className="mt-3 max-w-sm text-text-secondary">{pkg.description}</p>
                </div>

                <ul className="space-y-2 text-sm md:text-base text-text-secondary">
                  {pkg.features.map((feature) => (
                    <li key={feature} className="flex gap-3">
                      <span aria-hidden className="text-accent-lime">
                        —
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="flex items-end justify-between gap-4 md:flex-col md:items-end md:justify-start md:gap-6">
                  <p
                    className={`font-display text-7xl md:text-8xl leading-none ${
                      pkg.popular ? "text-accent-lime" : "text-text-primary"
                    }`}
                  >
                    {pkg.price}
                    <span className="ml-2 font-mono text-xs tracking-widest text-text-secondary">USD</span>
                  </p>
                  <a
                    href="#contact"
                    className="inline-flex min-h-11 items-center gap-2 border-b border-text-primary/40 text-sm font-medium text-text-primary transition-colors hover:border-accent-lime hover:text-accent-lime cursor-pointer"
                  >
                    {t.services.cta}
                    <ArrowUpRight size={16} aria-hidden />
                  </a>
                </div>
              </li>
            </Reveal>
          ))}
        </ul>

        <Reveal>
          <p className="mt-8 text-sm text-text-secondary">{t.services.note}</p>
        </Reveal>
      </div>
    </section>
  );
}
