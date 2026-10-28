"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { useEffect, useRef } from "react";

/** Scroll progress bar + cursor glow + film grain. Purely decorative. */
export default function Ambient() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });
  const glow = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let raf = 0;
    let tx = 0;
    let ty = 0;
    const move = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!raf) {
        raf = requestAnimationFrame(() => {
          raf = 0;
          if (glow.current) {
            glow.current.style.transform = `translate3d(${tx - 250}px, ${ty - 250}px, 0)`;
            glow.current.style.opacity = "1";
          }
        });
      }
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <motion.div
        aria-hidden
        style={{ scaleX }}
        className="fixed top-0 left-0 right-0 h-[3px] origin-left z-[60] bg-gradient-to-r from-accent-lime to-accent-orange"
      />
      <div ref={glow} aria-hidden className="cursor-glow" />
      <div aria-hidden className="grain" />
    </>
  );
}
