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
import AutoLogo from "./components/AutoLogo";
import AttitudeBand from "./components/AttitudeBand";
import { ThemeProvider } from "./theme/ThemeProvider";
import { MotionConfig } from "framer-motion";

function HomeContent() {
  const { t } = useLang();
  const [loading, setLoading] = useState(true);

  return (
    <MotionConfig reducedMotion="user">
      <Ambient />
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
      <footer className="border-t border-line/10 px-4 py-14 md:py-20">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 text-center">
          <AutoLogo label="Yisus Contreras" className="h-24 md:h-32" />
          <p className="font-serif text-4xl italic text-text-primary md:text-6xl">
            {t.preloader}
            <span aria-hidden className="inline-flex">
              {[0, 1, 2].map((i) => (
                <span key={i} className="animate-[dot-blink_1.4s_infinite]" style={{ animationDelay: `${i * 0.2}s` }}>
                  .
                </span>
              ))}
            </span>
          </p>
          <div className="flex w-full flex-col items-center justify-between gap-3 border-t border-line/10 pt-6 text-sm text-text-secondary md:flex-row">
            <p>
              © {new Date().getFullYear()} Yisus Contreras. {t.footer.rights}
            </p>
            <p>{t.footer.madeWith}</p>
          </div>
        </div>
      </footer>
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
