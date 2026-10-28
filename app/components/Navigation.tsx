"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useLang } from "../i18n/LanguageProvider";
import { useSiteData } from "../data/SiteData";
import LanguageToggle from "./LanguageToggle";
import { SocialLinks } from "./SocialIcons";

const ALL_SECTIONS = ["hero", "about", "metrics", "services", "brands", "gallery", "videos", "contact"] as const;

export default function Navigation() {
  const { t } = useLang();
  const hasVideos = Boolean(useSiteData()?.videos.length);
  const sections = ALL_SECTIONS.filter((id) => id !== "videos" || hasVideos);
  const navLinks = sections.map((id) => ({ label: t.nav.links[id], href: `#${id}` }));
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [active, setActive] = useState("#hero");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => e.isIntersecting && setActive(`#${e.target.id}`));
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasVideos]);

  return (
    <motion.nav
      aria-label={t.nav.aria}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
      className="fixed top-0 left-0 right-0 z-40 px-3 pt-3 md:pt-5"
    >
      <div
        className={`mx-auto max-w-5xl rounded-full px-5 transition-all duration-300 ${
          scrolled ? "bg-bg-primary/70 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/40" : "border border-transparent"
        }`}
      >
        <div className="flex h-14 items-center justify-between">
          <a href="#hero" className="inline-flex h-11 items-center font-display text-2xl md:text-3xl text-accent-lime neon-glow cursor-pointer">
            YISUS
          </a>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = active === link.href;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? "true" : undefined}
                  className={`relative px-3 py-2 text-sm tracking-wide rounded-full transition-colors duration-200 cursor-pointer ${
                    isActive ? "text-bg-primary" : "text-text-secondary hover:text-accent-lime"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-accent-lime"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative">{link.label}</span>
                </a>
              );
            })}
            <SocialLinks className="ml-2" />
            <LanguageToggle className="ml-1" />
          </div>

          <div className="md:hidden flex items-center gap-1">
          <SocialLinks size={18} />
          <LanguageToggle />
          <button
            className="flex h-11 w-11 items-center justify-center text-text-primary cursor-pointer"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? t.nav.closeMenu : t.nav.openMenu}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={24} aria-hidden /> : <Menu size={24} aria-hidden />}
          </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden mt-2 mx-auto max-w-5xl rounded-3xl bg-bg-primary/95 backdrop-blur-xl border border-white/10"
          >
            <div className="px-6 py-6 space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block py-3 font-display text-3xl tracking-wide transition-colors cursor-pointer ${
                    active === link.href ? "text-accent-lime" : "text-text-secondary hover:text-accent-lime"
                  }`}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
