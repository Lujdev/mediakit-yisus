"use client";

import { useLang } from "../i18n/LanguageProvider";
import { useSiteData } from "../data/SiteData";
import Marquee, { type MarqueeItem } from "../components/Marquee";
import Reveal from "../components/Reveal";
import SectionHeader from "../components/SectionHeader";

const FALLBACK: MarqueeItem[] = ["COVAS", "SAMOS", "ANCDESIGN", "FVPS", "ROCKSTAR"].map((name) => ({ name }));

export default function Brands() {
  const { t } = useLang();
  const data = useSiteData();
  const brands: MarqueeItem[] = data?.brands.length ? data.brands : FALLBACK;

  return (
    <section id="brands" className="relative bg-bg-secondary/50 py-16 md:py-36 overflow-hidden">
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
        <div className="space-y-6 border-y border-line/10 py-8 md:py-10">
          <Marquee items={brands} className="text-text-primary" />
          <Marquee items={brands} reverse variant="outline" className="text-outline" />
        </div>
      </Reveal>
    </section>
  );
}
