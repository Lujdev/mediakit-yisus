"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";
import { Shirt, Palmtree, Clapperboard, Briefcase } from "lucide-react";
import { useLang } from "../i18n/LanguageProvider";
import Reveal from "../components/Reveal";
import SectionHeader from "../components/SectionHeader";
import SpotlightCard from "../components/SpotlightCard";

const pillarIcons = [Shirt, Palmtree, Clapperboard, Briefcase];

export default function About() {
  const { t } = useLang();
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
                className="absolute inset-0 rounded-3xl border border-accent-lime/40 translate-x-4 translate-y-4"
              />
              <Reveal y={50}>
                <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-bg-secondary">
                  <motion.div style={{ y: imgY }} className="absolute -inset-[10%]">
                    <Image
                      src="/images/1.jpeg"
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {t.about.pillars.map((pillar, i) => {
                const Icon = pillarIcons[i];
                return (
                <Reveal key={pillar.title} delay={i * 0.08}>
                  <SpotlightCard className="glass rounded-2xl p-6 h-full hover:border-accent-lime/30 transition-colors duration-300 group">
                    <Icon
                      className="text-accent-lime mb-4 transition-transform duration-300 group-hover:-translate-y-1 group-hover:rotate-6"
                      size={28}
                      aria-hidden
                    />
                    <h3 className="font-display text-2xl tracking-wide text-text-primary mb-1">
                      {pillar.title}
                    </h3>
                    <p className="text-text-secondary text-sm">{pillar.desc}</p>
                  </SpotlightCard>
                </Reveal>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
