"use client";

import { useLang } from "../i18n/LanguageProvider";
import { useSiteData } from "../data/SiteData";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";
import Magnetic from "../components/Magnetic";

const ease = [0.22, 1, 0.36, 1] as const;

export default function Hero({ introReady = true }: { introReady?: boolean }) {
  const { t } = useLang();
  const heroSrc = useSiteData()?.media.hero ?? "/images/0.jpg";
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1.05, 1.25]);
  const titleY = useTransform(scrollYProgress, [0, 1], ["0%", "-18%"]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section
      ref={ref}
      id="hero"
      data-theme="dark"
      className="relative flex min-h-[100svh] flex-col overflow-hidden"
    >
      <motion.div style={{ y: imgY, scale: imgScale }} className="absolute inset-0 z-0">
        <Image
          src={heroSrc}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-40"
        />
      </motion.div>
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-bg-primary/70 via-bg-primary/30 to-bg-primary" />

      <motion.div
        style={{ y: titleY, opacity: fade }}
        className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-4 pb-6 pt-24 md:pb-10 md:pt-24"
      >
        <p className="mb-5 flex items-center justify-center gap-4 text-center text-[11px] font-medium uppercase tracking-[0.18em] text-text-primary/80 [text-shadow:0_1px_14px_rgba(0,0,0,0.7)] sm:text-[13px] md:mb-8 md:text-sm">
          <span aria-hidden className="hidden h-px w-8 bg-text-primary/40 sm:block md:w-12" />
          {t.hero.badge}
          <span aria-hidden className="hidden h-px w-8 bg-text-primary/40 sm:block md:w-12" />
        </p>

        <h1 className="mb-6 font-display text-[24vw] leading-[0.82] tracking-tight sm:text-[18vw] md:mb-8 md:text-[13rem]">
          {["YISUS", "CONTRERAS"].map((word, i) => (
            <span key={word} className="block overflow-hidden pb-[0.05em]">
              <motion.span
                className={`block ${i === 1 ? "text-accent-ink" : "text-text-primary"}`}
                initial={{ y: "110%", rotate: 2 }}
                animate={introReady ? { y: 0, rotate: 0 } : { y: "110%", rotate: 2 }}
                transition={{ duration: 1, delay: introReady ? 0.25 + i * 0.14 : 0, ease }}
              >
                {word}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={introReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: introReady ? 0.75 : 0, ease }}
          className="mx-auto mb-7 max-w-2xl font-serif text-lg italic text-text-secondary sm:text-xl md:mb-10 md:text-3xl"
        >
          {t.hero.tagline}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={introReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: introReady ? 0.9 : 0, ease }}
          className="mx-auto flex w-full max-w-xs flex-col items-stretch justify-center gap-3 sm:max-w-none sm:flex-row sm:items-center sm:gap-4"
        >
          <Magnetic className="block sm:inline-block">
            <a
              href="#contact"
              className="group flex items-center justify-center gap-2 rounded-full bg-accent-lime px-8 py-4 font-semibold text-on-accent transition-colors duration-300 hover:bg-accent-orange sm:inline-flex cursor-pointer"
            >
              {t.hero.cta}
              <ArrowUpRight
                size={18}
                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </a>
          </Magnetic>
          <Magnetic className="block sm:inline-block">
            <a
              href="#about"
              className="flex items-center justify-center rounded-full border border-line/20 px-8 py-4 text-text-primary backdrop-blur transition-colors duration-300 hover:border-accent-ink hover:text-accent-ink sm:inline-flex cursor-pointer"
            >
              {t.hero.ctaSecondary}
            </a>
          </Magnetic>
        </motion.div>
      </motion.div>

      <motion.a
        href="#about"
        aria-label={`${t.hero.scroll} — ${t.hero.scrollAria}`}
        className="relative z-10 mx-auto mb-[max(1.25rem,env(safe-area-inset-bottom))] flex flex-col items-center gap-2 text-text-secondary transition-colors hover:text-accent-ink cursor-pointer"
        initial={{ opacity: 0 }}
        animate={introReady ? { opacity: 1, y: [0, 8, 0] } : { opacity: 0 }}
        transition={{
          opacity: { delay: introReady ? 1.2 : 0 },
          y: { repeat: Infinity, duration: 2, ease: "easeInOut" },
        }}
      >
        <span className="text-xs uppercase tracking-widest">{t.hero.scroll}</span>
        <ArrowDown size={18} />
      </motion.a>
    </section>
  );
}
