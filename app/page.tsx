"use client";

import Image from "next/image";
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
        <About />
        <Metrics />
        <Services />
        <Brands />
        <Gallery />
        <Videos />
        <Contact />
      </main>
      <footer className="border-t border-white/5 py-8 px-4">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4">
          <Image src="/logo-yc.png" alt="Yisus Contreras" width={458} height={480} className="h-14 w-auto" />
          <p className="text-text-secondary text-sm">
            © {new Date().getFullYear()} Yisus Contreras. {t.footer.rights}
          </p>
          <p className="text-text-secondary text-sm">
            {t.footer.madeWith}
          </p>
        </div>
      </footer>
    </MotionConfig>
  );
}

export default function Home() {
  return (
    <LanguageProvider>
      <SiteDataProvider>
        <HomeContent />
      </SiteDataProvider>
    </LanguageProvider>
  );
}
