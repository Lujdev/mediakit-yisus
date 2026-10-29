"use client";

import { useLang } from "../i18n/LanguageProvider";
import { useSiteData } from "../data/SiteData";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Magnetic from "../components/Magnetic";
import Threads from "../components/Threads";

const ease = [0.22, 1, 0.36, 1] as const;

export default function Hero() {
  const { t } = useLang();
  // Photo set from the admin; the bundled one until it loads or when none was uploaded.
  const heroSrc = useSiteData()?.media.hero ?? "/images/0.jpg";
  const ref = useRef<HTMLElement>(null);
  // The WebGL threads are desktop-only and off for reduced-motion visitors: the hero stays light on phones.
  const [threads, setThreads] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px) and (prefers-reduced-motion: no-preference)");
    const update = () => setThreads(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
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
      className="relative min-h-[100svh] flex items-center justify-center overflow-hidden"
    >
      {/* Parallax background */}
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

      {/* React Bits Threads: fine lime filaments drifting over the photo, parting around the pointer. */}
      {threads && (
        <div aria-hidden className="hero-threads pointer-events-none absolute inset-0 z-[1] mix-blend-screen">
          <Threads
            color="#d4f23a"
            accentColor="#f5f5f0"
            lineCount={64}
            thickness={0.55}
            amplitude={1.7}
            speed={0.45}
            angle={18}
            split={0.06}
            fray={0.45}
            taper={0.9}
            brightness={1.5}
            fade={0.35}
            opacity={0.38}
            parting={0.6}
            enableMouseInteraction
          />
        </div>
      )}

      {/* Content */}
      <motion.div
        style={{ y: titleY, opacity: fade }}
        className="relative z-10 text-center px-4 max-w-6xl mx-auto pt-20"
      >
        <p className="mb-8 flex items-center justify-center gap-4 text-[13px] md:text-sm font-medium tracking-[0.18em] uppercase text-text-primary/80 [text-shadow:0_1px_14px_rgba(0,0,0,0.7)]">
          <span aria-hidden className="h-px w-8 md:w-12 bg-text-primary/40" />
          {t.hero.badge}
          <span aria-hidden className="h-px w-8 md:w-12 bg-text-primary/40" />
        </p>

        <h1 className="font-display text-[26vw] sm:text-[18vw] md:text-[13rem] leading-[0.82] tracking-tight mb-8">
          {["YISUS", "CONTRERAS"].map((word, i) => (
            <span key={word} className="block overflow-hidden pb-[0.05em]">
              <motion.span
                className={`block ${i === 1 ? "text-accent-ink" : "text-text-primary"}`}
                initial={{ y: "110%", rotate: 2 }}
                animate={{ y: 0, rotate: 0 }}
                transition={{ duration: 1, delay: 0.35 + i * 0.15, ease }}
              >
                {word}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9, ease }}
          className="mx-auto mb-10 max-w-2xl font-serif text-xl italic text-text-secondary md:text-3xl"
        >
          {t.hero.tagline}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.05, ease }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 max-w-xs sm:max-w-none mx-auto"
        >
          <Magnetic className="block sm:inline-block">
            <a
              href="#contact"
              className="group flex sm:inline-flex items-center justify-center gap-2 px-8 py-4 bg-accent-lime text-on-accent font-semibold rounded-full hover:bg-accent-orange transition-colors duration-300 cursor-pointer"
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
              className="flex sm:inline-flex items-center justify-center px-8 py-4 border border-line/20 text-text-primary rounded-full hover:border-accent-ink hover:text-accent-ink transition-colors duration-300 cursor-pointer backdrop-blur"
            >
              {t.hero.ctaSecondary}
            </a>
          </Magnetic>
        </motion.div>
      </motion.div>

      {/* Scroll cue */}
      <motion.a
        href="#about"
        aria-label={`${t.hero.scroll} — ${t.hero.scrollAria}`}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-text-secondary hover:text-accent-ink transition-colors cursor-pointer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 8, 0] }}
        transition={{
          opacity: { delay: 1.4 },
          y: { repeat: Infinity, duration: 2, ease: "easeInOut" },
        }}
      >
        <span className="text-xs tracking-widest uppercase">{t.hero.scroll}</span>
        <ArrowDown size={18} />
      </motion.a>
    </section>
  );
}
