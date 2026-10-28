"use client";

import { useLang } from "../i18n/LanguageProvider";
import Marquee from "./Marquee";

/** The brand phrase from the intro, kept alive on the page as an italic ticker. */
export default function AttitudeBand() {
  const { t } = useLang();
  return (
    <div aria-hidden className="border-y border-line/10 py-6 md:py-8 overflow-hidden">
      <Marquee items={t.band.map((name) => ({ name }))} serif variant="outline" className="text-text-primary" />
    </div>
  );
}
