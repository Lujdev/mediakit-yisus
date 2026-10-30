"use client";

import { useState } from "react";
import Preloader from "./components/Preloader";
import Navigation from "./components/Navigation";
import Hero from "./sections/Hero";
import About from "./sections/About";
import Metrics from "./sections/Metrics";
import Services from "./sections/Services";
import Brands from "./sections/Brands";
import Gallery from "./sections/Gallery";
import Videos from "./sections/Videos";
import Contact from "./sections/Contact";
import { SiteDataProvider } from "./data/SiteData";
import { LanguageProvider, useLang } from "./i18n/LanguageProvider";
import Ambient from "./components/Ambient";
import SiteBackground from "./components/SiteBackground";
import LogoMark from "./components/LogoMark";
import AttitudeBand from "./components/AttitudeBand";
import Tracker from "./components/Tracker";
import { ThemeProvider } from "./theme/ThemeProvider";
import { MotionConfig } from "framer-motion";

function HomeContent() {
  const { t } = useLang();
  const [loading, setLoading] = useState(true);

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative isolate">
        <SiteBackground />
        <Ambient />
        <Tracker />
        {loading && <Preloader onComplete={() => setLoading(false)} />}
        <Navigation />
        <main>
          <Hero />
          <AttitudeBand />
          <About />
          <Metrics />
          <Services />
          <Brands />
          <Gallery />
          <Videos />
          <Contact />
        </main>
        <footer className="border-t border-line/10 px-4 py-8">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 md:flex-row">
            <LogoMark label="Yisus Contreras" className="h-10" />
            <p className="text-sm text-text-secondary">
              © {new Date().getFullYear()} Yisus Contreras. {t.footer.rights}
            </p>
            <div className="flex flex-col items-center gap-1 md:items-end">
              <p className="text-sm text-text-secondary">{t.footer.madeWith}</p>
              <a
                href="https://www.instagram.com/luii.dev/"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-widest text-text-secondary transition-colors hover:text-accent-ink"
              >
                {t.footer.credit}
                <span aria-hidden className="transition-transform group-hover:-translate-y-0.5">
                  ↗
                </span>
              </a>
            </div>
          </div>
        </footer>
      </div>
    </MotionConfig>
  );
}

export default function Home() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <SiteDataProvider>
          <HomeContent />
        </SiteDataProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
