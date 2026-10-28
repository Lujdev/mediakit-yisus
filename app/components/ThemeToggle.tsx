"use client";

import { Moon, Sun } from "lucide-react";
import { useLang } from "../i18n/LanguageProvider";
import { useTheme } from "../theme/ThemeProvider";

/** Sun/moon switch. Shows the theme you would switch to. 44px touch target. */
export default function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const { t } = useLang();
  const toLight = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={toLight ? t.nav.themeToLight : t.nav.themeToDark}
      className={`flex h-11 w-11 items-center justify-center text-text-secondary transition-colors hover:text-accent-ink cursor-pointer ${className}`}
    >
      {toLight ? <Sun size={18} aria-hidden /> : <Moon size={18} aria-hidden />}
    </button>
  );
}
