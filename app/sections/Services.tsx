"use client";

import { Check, Star } from "lucide-react";
import { useLang } from "../i18n/LanguageProvider";
import Reveal from "../components/Reveal";
import SectionHeader from "../components/SectionHeader";
import SpotlightCard from "../components/SpotlightCard";

export default function Services() {
  const { t } = useLang();
  return (
    <section id="services" className="relative py-16 md:py-36 px-4 overflow-hidden">
      <div aria-hidden className="aurora top-1/3 -right-32 h-96 w-96 bg-accent-orange/30" />
      <div className="relative mx-auto max-w-7xl">
        <SectionHeader
          index="03"
          eyebrow={t.services.eyebrow}
          title={t.services.title}
          accentLine={0}
          description={t.services.description}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-stretch">
          {t.services.packages.map((pkg, i) => {
            const popular = i === 0;
            return (
            <Reveal key={pkg.name} delay={i * 0.12} className="h-full">
              <SpotlightCard
                className={`h-full rounded-3xl p-8 transition-transform duration-300 hover:-translate-y-2 ${
                  popular
                    ? "shimmer-border bg-bg-secondary/60 backdrop-blur"
                    : "glass hover:border-accent-lime/30"
                }`}
              >
                {popular && (
                  <div className="absolute top-5 right-5 bg-accent-orange text-bg-primary text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <Star size={12} fill="currentColor" aria-hidden />
                    {t.services.popular}
                  </div>
                )}

                <h3 className="font-display text-3xl tracking-wide text-text-primary mb-2">
                  {pkg.name}
                </h3>
                <p className="text-text-secondary text-sm mb-8 min-h-10">{pkg.description}</p>

                <div className="font-display text-7xl text-accent-lime mb-8 leading-none">
                  {pkg.price}
                  <span className="ml-2 font-mono text-xs tracking-widest text-text-secondary">USD</span>
                </div>

                <ul className="space-y-3 mb-10">
                  {pkg.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-text-secondary text-sm">
                      <Check className="text-accent-lime shrink-0 mt-0.5" size={16} aria-hidden />
                      {feature}
                    </li>
                  ))}
                </ul>

                <a
                  href="#contact"
                  className={`block w-full text-center py-3.5 rounded-full font-semibold transition-colors duration-300 cursor-pointer ${
                    popular
                      ? "bg-accent-lime text-bg-primary hover:bg-accent-orange"
                      : "bg-white/10 text-text-primary hover:bg-accent-lime hover:text-bg-primary"
                  }`}
                >
                  {t.services.cta}
                </a>
              </SpotlightCard>
            </Reveal>
            );
          })}
        </div>

        <Reveal>
          <p className="text-center text-text-secondary text-sm mt-10">
            {t.services.note}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
