"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore, type ReactNode } from "react";
import { dictionary, type Dict, type Lang } from "./dictionary";

type Ctx = { lang: Lang; t: Dict; setLang: (l: Lang) => void };

const LanguageContext = createContext<Ctx | null>(null);
const STORAGE_KEY = "yisus-lang";

// Language lives outside React so SSR renders "es" and the client switches after hydration
// without a mismatch. memoryLang covers browsers where localStorage is blocked.
const listeners = new Set<() => void>();
let memoryLang: Lang | null = null;

/** First language in the browser's preference list that the site supports (es or en); English otherwise. */
function detectLang(): Lang {
  const prefs = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const raw of prefs) {
    const code = raw?.toLowerCase().split("-")[0];
    if (code === "es" || code === "en") return code;
  }
  return "en";
}

function readLang(): Lang {
  if (memoryLang) return memoryLang;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "es" || saved === "en") return saved;
  } catch {}
  return detectLang();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const lang = useSyncExternalStore<Lang>(subscribe, readLang, () => "es");

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = dictionary[lang].meta.title;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", dictionary[lang].meta.description);
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    memoryLang = l;
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {}
    listeners.forEach((cb) => cb());
  }, []);

  const value = useMemo(() => ({ lang, t: dictionary[lang], setLang }), [lang, setLang]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used inside LanguageProvider");
  return ctx;
}
