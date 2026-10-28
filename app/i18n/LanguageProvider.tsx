"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { dictionary, type Dict, type Lang } from "./dictionary";

type Ctx = { lang: Lang; t: Dict; setLang: (l: Lang) => void };

const LanguageContext = createContext<Ctx | null>(null);
const STORAGE_KEY = "yisus-lang";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("es");

  // Resolve saved or browser language after hydration (keeps SSR markup stable).
  useEffect(() => {
    let next: Lang = navigator.language?.toLowerCase().startsWith("es") ? "es" : "en";
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "es" || saved === "en") next = saved;
    } catch {}
    setLangState(next);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = dictionary[lang].meta.title;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", dictionary[lang].meta.description);
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {}
  }, []);

  const value = useMemo(() => ({ lang, t: dictionary[lang], setLang }), [lang, setLang]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used inside LanguageProvider");
  return ctx;
}
