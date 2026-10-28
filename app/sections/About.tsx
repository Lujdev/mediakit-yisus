"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";
import { useLang } from "../i18n/LanguageProvider";
import { useSiteData } from "../data/SiteData";
import Reveal from "../components/Reveal";
import SectionHeader from "../components/SectionHeader";

export default function About() {
  const { t } = useLang();
  const aboutSrc = useSiteData()?.media.about ?? "/images/1.jpeg";
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  const frameRotate = useTransform(scrollYProgress, [0, 1], [-3, 3]);

  return (
    <section id="about" className="relative py-16 md:py-36 px-4">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Image */}
          <div ref={ref} className="lg:col-span-5 lg:sticky lg:top-28">
            <div className="relative">
              <motion.div
                aria-hidden
                style={{ rotate: frameRotate }}
                className="absolute inset-0 rounded-3xl border border-accent-ink/40 translate-x-4 translate-y-4"
              />
              <Reveal y={50}>
                <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-bg-secondary">
                  <motion.div style={{ y: imgY }} className="absolute -inset-[10%]">
                    <Image
                      src={aboutSrc}
                      alt="Yisus Contreras"
                      fill
                      sizes="(max-width: 1024px) 100vw, 40vw"
                      className="object-cover"
                    />
                  </motion.div>
                  <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/70 via-transparent to-transparent" />
                  <p className="absolute bottom-5 left-5 font-mono text-xs tracking-widest uppercase text-text-primary/80">
                    {t.about.photoCaption}
                  </p>
                </div>
              </Reveal>
            </div>
          </div>

          {/* Text */}
          <div className="lg:col-span-7 lg:pl-8">
            <SectionHeader
              index="01"
              eyebrow={t.about.eyebrow}
              title={t.about.title}
              accentLine={1}
            />
            <Reveal>
              <p className="text-text-primary text-xl md:text-2xl leading-snug mb-6 font-medium">
                {t.about.lead}
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="text-text-secondary leading-relaxed mb-12 max-w-2xl">
                {t.about.body}
              </p>
            </Reveal>

            {/* Editorial index: numbered rows divided by hairlines, no cards or icons. */}
            <ol className="border-b border-line/10">
              {t.about.pillars.map((pillar, i) => (
                <Reveal key={pillar.title} delay={i * 0.06}>
                  <li className="group relative grid grid-cols-[2.5rem_1fr] md:grid-cols-[3.5rem_minmax(0,1fr)_minmax(0,1.1fr)] gap-x-3 gap-y-1 border-t border-line/10 py-5 md:py-6 md:items-baseline">
                    <span
                      aria-hidden
                      className="absolute left-0 top-0 h-px w-full origin-left scale-x-0 bg-accent-ink transition-transform duration-500 group-hover:scale-x-100"
                    />
                    <span className="font-mono text-xs tracking-widest text-text-secondary pt-2 md:pt-0">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="font-display text-4xl md:text-5xl leading-none tracking-wide text-text-primary transition-all duration-300 group-hover:translate-x-1 group-hover:text-accent-ink">
                      {pillar.title}
                    </h3>
                    <p className="col-start-2 md:col-start-3 text-text-secondary text-sm md:text-base leading-relaxed">
                      {pillar.desc}
                    </p>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
