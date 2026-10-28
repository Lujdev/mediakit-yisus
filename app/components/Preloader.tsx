"use client";

import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import { useEffect, useState } from "react";
import { useLang } from "../i18n/LanguageProvider";

const ease = [0.76, 0, 0.24, 1] as const;

const GLINT =
  "linear-gradient(105deg, transparent 38%, rgba(255,255,255,0.95) 50%, transparent 62%)";

/**
 * Intro: the YC monogram comes into focus like a photograph being developed (blur to sharp,
 * dim to bright) while a glint of light sweeps across it. Tilts with the pointer, extra glint on tap.
 */
export default function Preloader({ onComplete }: { onComplete: () => void }) {
  const { t } = useLang();
  const reduceMotion = useReducedMotion();
  const [count, setCount] = useState(0);
  const [visible, setVisible] = useState(true);
  const [burst, setBurst] = useState(0);

  const tiltX = useSpring(useMotionValue(0), { stiffness: 120, damping: 16 });
  const tiltY = useSpring(useMotionValue(0), { stiffness: 120, damping: 16 });

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const controls = animate(0, 100, {
      duration: 2.8,
      ease: [0.65, 0, 0.35, 1],
      onUpdate: (v) => setCount(Math.round(v)),
      onComplete: () => {
        timer = setTimeout(() => setVisible(false), 450);
      },
    });
    document.body.style.overflow = "hidden";
    return () => {
      controls.stop();
      if (timer) clearTimeout(timer);
      document.body.style.overflow = "";
    };
  }, []);

  // Subtle 3D tilt toward the pointer (mouse hover or touch drag).
  useEffect(() => {
    if (reduceMotion) return;
    const move = (e: PointerEvent) => {
      tiltY.set((e.clientX / window.innerWidth - 0.5) * 2 * 14);
      tiltX.set(-(e.clientY / window.innerHeight - 0.5) * 2 * 14);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [reduceMotion, tiltX, tiltY]);

  const progress = count / 100;

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {visible && (
        <motion.div
          role="status"
          data-theme="dark"
          aria-label={`${t.preloader} ${count}%`}
          className="fixed inset-0 z-[80] flex flex-col justify-between overflow-hidden bg-bg-primary p-5 md:p-10"
          exit={{ y: "-100%" }}
          transition={{ duration: 0.9, ease }}
        >
          <div className="flex items-start justify-between font-serif text-lg italic text-text-secondary md:text-2xl">
            <span>Yisus Contreras</span>
            <span>Media Kit · 2026</span>
          </div>

          <div className="flex justify-center" style={{ perspective: 900 }}>
            <motion.button
              type="button"
              onClick={() => setBurst((b) => b + 1)}
              aria-label={t.preloaderSpin}
              style={{ rotateX: tiltX, rotateY: tiltY }}
              className="relative aspect-[458/480] w-[64vw] max-w-[400px] cursor-pointer"
            >
              {/* Focus pull: sharpness and brightness follow progress. */}
              <span
                aria-hidden
                className="logo-mark absolute inset-0"
                style={{
                  filter: `blur(${((1 - progress) * 16).toFixed(1)}px)`,
                  opacity: 0.25 + progress * 0.75,
                  transform: `scale(${0.94 + progress * 0.06})`,
                }}
              />
              {/* Continuous glint, plus a faster one each time it is tapped. */}
              <span
                aria-hidden
                className="logo-mark glint absolute inset-0 animate-[glint_2.4s_ease-in-out_infinite]"
                style={{ backgroundColor: "transparent", backgroundImage: GLINT, backgroundSize: "260% 100%", backgroundRepeat: "no-repeat" }}
              />
              {burst > 0 && (
                <span
                  key={burst}
                  aria-hidden
                  className="logo-mark glint absolute inset-0 animate-[glint_0.9s_ease-out_1]"
                  style={{ backgroundColor: "transparent", backgroundImage: GLINT, backgroundSize: "260% 100%", backgroundRepeat: "no-repeat" }}
                />
              )}
            </motion.button>
          </div>

          <div className="flex items-end justify-between gap-4">
            <p className="font-serif text-[28vw] italic leading-[0.8] tabular-nums text-text-primary md:text-[11rem]">
              {count}
              <span className="align-top text-[0.28em] not-italic text-accent-ink">%</span>
            </p>
            <p className="pb-2 text-right font-serif text-xl italic text-text-secondary md:text-3xl">{t.preloader}…</p>
          </div>

          <span aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-line/15" />
          <span aria-hidden className="absolute bottom-0 left-0 h-px bg-accent-ink" style={{ width: `${count}%` }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
