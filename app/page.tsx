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
import LogoMark from "./components/LogoMark";
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
      <footer className="border-t border-line/10 px-4 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 md:flex-row">
          <LogoMark label="Yisus Contreras" className="h-10" />
          <p className="text-sm text-text-secondary">
            © {new Date().getFullYear()} Yisus Contreras. {t.footer.rights}
          </p>
          <p className="text-sm text-text-secondary">{t.footer.madeWith}</p>
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
