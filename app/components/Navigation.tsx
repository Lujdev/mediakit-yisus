"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useLang } from "../i18n/LanguageProvider";
import { useSiteData } from "../data/SiteData";
import LanguageToggle from "./LanguageToggle";
import { SocialLinks } from "./SocialIcons";
import LogoMark from "./LogoMark";
import ThemeToggle from "./ThemeToggle";

const ALL_SECTIONS = ["hero", "about", "metrics", "services", "brands", "gallery", "videos", "contact"] as const;

export default function Navigation({ ready = true }: { ready?: boolean }) {
  const { t } = useLang();
  const siteData = useSiteData();
  const hasVideos = Boolean(siteData?.videos.length);
  const hasGallery = !siteData || siteData.media.gallery.length > 0;
  const sections = ALL_SECTIONS.filter((id) => (id !== "videos" || hasVideos) && (id !== "gallery" || hasGallery));
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
  }, [hasVideos, hasGallery]);

  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    const desktop = window.matchMedia("(min-width: 768px)");
    const closeOnDesktop = () => desktop.matches && setMobileOpen(false);
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    desktop.addEventListener("change", closeOnDesktop);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
      desktop.removeEventListener("change", closeOnDesktop);
    };
  }, [mobileOpen]);

  return (
    <motion.nav
      aria-label={t.nav.aria}
      data-theme={scrolled ? undefined : "dark"}
      initial={{ y: -100 }}
      animate={{ y: ready ? 0 : -100 }}
      transition={{ duration: 0.6, ease: "easeOut", delay: ready ? 0.15 : 0 }}
      className="fixed left-0 right-0 top-0 z-40 px-3 pt-3 md:pt-5"
    >
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            id="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-0 flex h-[100svh] flex-col bg-bg-primary/95 backdrop-blur-2xl md:hidden"
          >
            <div className="flex min-h-0 flex-1 flex-col px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[calc(env(safe-area-inset-top)+5.25rem)]">
              <nav aria-label={t.nav.aria} className="flex min-h-0 flex-1 flex-col justify-evenly">
                {navLinks.map((link, index) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-baseline gap-3 border-b border-line/10 py-[clamp(0.45rem,1.3vh,0.9rem)] font-display text-[clamp(1.8rem,6vh,2.8rem)] leading-none tracking-wide transition-colors cursor-pointer ${
                      active === link.href ? "text-accent-ink" : "text-text-primary"
                    }`}
                  >
                    <span className="font-mono text-[10px] tracking-widest text-text-secondary">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {link.label}
                  </a>
                ))}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className={`relative z-10 mx-auto max-w-5xl rounded-full px-5 transition-all duration-300 ${
          scrolled ? "bg-bg-primary/70 backdrop-blur-xl border border-line/10 shadow-2xl shadow-black/40" : "border border-transparent"
        }`}
      >
        <div className="flex h-14 items-center justify-between">
          <a
            href="https://yisuscontreras.com"
            aria-label="Yisus Contreras — yisuscontreras.com"
            className="inline-flex h-11 items-center cursor-pointer"
          >
            <LogoMark className="h-9" glint />
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
                    isActive ? "text-on-accent" : "text-text-secondary hover:text-accent-ink"
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
            <ThemeToggle />
          </div>

          <div className="md:hidden flex items-center gap-1">
            <SocialLinks size={18} />
            <LanguageToggle />
            <ThemeToggle />
            <button
              className="flex h-11 w-11 items-center justify-center text-text-primary cursor-pointer"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? t.nav.closeMenu : t.nav.openMenu}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
            >
              {mobileOpen ? <X size={24} aria-hidden /> : <Menu size={24} aria-hidden />}
            </button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
