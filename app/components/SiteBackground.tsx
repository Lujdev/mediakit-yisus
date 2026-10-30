"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useTheme } from "../theme/ThemeProvider";

const DotGrid = dynamic(() => import("./DotGrid"), { ssr: false });

const COLORS = {
  dark: { base: "#7a7a6e", active: "#d4f23a" },
  light: { base: "#9a8d7a", active: "#a63d22" },
};

export default function SiteBackground() {
  const { theme } = useTheme();
  const [interactive, setInteractive] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: no-preference)");
    const update = () => setInteractive(motion.matches);
    update();
    motion.addEventListener("change", update);
    return () => motion.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const requestIdle = window.requestIdleCallback?.bind(window);
    if (requestIdle) {
      const id = requestIdle(() => setReady(true), { timeout: 1800 });
      return () => window.cancelIdleCallback?.(id);
    }
    const id = setTimeout(() => setReady(true), 600);
    return () => clearTimeout(id);
  }, []);

  if (!ready) return null;

  const colors = COLORS[theme];

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <DotGrid
        dotSize={2}
        gap={28}
        baseColor={colors.base}
        activeColor={colors.active}
        proximity={150}
        strength={0.35}
        bounce={0.65}
        tension={0.2}
        returnDuration={0.9}
        swell={0.45}
        stretch={0.15}
        glow={0}
        fade={0.55}
        opacity={0.26}
        intro={false}
        mouseInteraction={interactive}
        clickShock={false}
        dpr={1.5}
      />
    </div>
  );
}
