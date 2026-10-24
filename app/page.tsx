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
import Contact from "./sections/Contact";

export default function Home() {
  const [loading, setLoading] = useState(true);

  return (
    <>
      {loading && <Preloader onComplete={() => setLoading(false)} />}
      <Navigation />
      <main>
        <Hero />
        <About />
        <Metrics />
        <Services />
        <Brands />
        <Gallery />
        <Contact />
      </main>
      <footer className="border-t border-white/5 py-8 px-4">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-display text-xl text-accent-lime neon-glow">
            YISUS
          </p>
          <p className="text-text-secondary text-sm">
            © {new Date().getFullYear()} Yisus Contreras. Todos los derechos
            reservados.
          </p>
          <p className="text-text-secondary text-sm">
            Hecho con actitud desde Venezuela 🇻🇪
          </p>
        </div>
      </footer>
    </>
  );
}
