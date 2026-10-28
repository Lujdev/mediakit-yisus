"use client";

import { useLang } from "../i18n/LanguageProvider";
import Marquee from "../components/Marquee";
import Reveal from "../components/Reveal";
import SectionHeader from "../components/SectionHeader";

const brands = ["COVAS", "SAMOS", "ANCDESIGN", "FVPS", "ROCKSTAR"];

export default function Brands() {
  const { t } = useLang();
  return (
    <section id="brands" className="relative py-16 md:py-36 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeader
          index="04"
          eyebrow={t.brands.eyebrow}
          title={t.brands.title}
          accentLine={0}
          description={t.brands.description}
        />
      </div>

      <Reveal>
        <div className="border-y border-white/10 py-8 md:py-10 space-y-6">
          <Marquee items={brands} className="text-text-primary" />
          <Marquee items={brands} reverse className="text-outline" />
        </div>
      </Reveal>
    </section>
  );
}
