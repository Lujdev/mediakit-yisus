"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { SiteData } from "@/lib/site-data";

/** null while loading or if the request failed; consumers fall back to built-in defaults. */
const SiteDataContext = createContext<SiteData | null>(null);

export function SiteDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<SiteData | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/site")
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (!cancelled && json && Array.isArray(json.brands)) setData(json);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return <SiteDataContext.Provider value={data}>{children}</SiteDataContext.Provider>;
}

export const useSiteData = () => useContext(SiteDataContext);
