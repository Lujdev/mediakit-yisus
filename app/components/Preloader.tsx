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
import LogoDraw from "./LogoDraw";

const ease = [0.76, 0, 0.24, 1] as const;

const GLINT =
  "linear-gradient(105deg, transparent 38%, rgba(255,255,255,0.95) 50%, transparent 62%)";

/** Full-screen monogram reveal with a counter, then a vertical curtain wipe into the hero. */
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
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (!window.location.hash) window.scrollTo(0, 0);

    const controls = animate(0, 100, {
      duration: reduceMotion ? 0.45 : 1.75,
      ease: [0.65, 0, 0.35, 1],
      onUpdate: (v) => setCount(Math.round(v)),
      onComplete: () => {
        timer = setTimeout(() => setVisible(false), reduceMotion ? 80 : 260);
      },
    });

    return () => {
      controls.stop();
      if (timer) clearTimeout(timer);
      document.body.style.overflow = previousOverflow;
    };
  }, [reduceMotion]);

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
          className="preloader-glow fixed inset-0 z-[80] flex h-[100svh] flex-col justify-between overflow-hidden bg-bg-primary px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))] md:px-10 md:py-10"
          exit={{ y: "-100%" }}
          transition={{ duration: reduceMotion ? 0.25 : 0.65, ease }}
        >
          <div className="relative flex items-start justify-between font-serif text-base italic text-text-secondary md:text-2xl">
            <span>Yisus Contreras</span>
            <span>Media Kit · 2026</span>
          </div>

          <div className="relative flex justify-center" style={{ perspective: 900 }}>
            <motion.button
              type="button"
              onClick={() => setBurst((b) => b + 1)}
              aria-label={t.preloaderSpin}
              style={{ rotateX: tiltX, rotateY: tiltY }}
              className="relative aspect-[588/480] w-[74vw] max-w-[420px] cursor-pointer"
            >
              <LogoDraw progress={progress} className="absolute inset-0 h-full w-full" />
              <span
                aria-hidden
                className={`logo-mark glint absolute inset-0 animate-[glint_2.4s_ease-in-out_infinite] transition-opacity duration-500 ${progress > 0.97 ? "opacity-100" : "opacity-0"}`}
                style={{
                  backgroundColor: "transparent",
                  backgroundImage: GLINT,
                  backgroundSize: "260% 100%",
                  backgroundRepeat: "no-repeat",
                }}
              />
              {burst > 0 && (
                <span
                  key={burst}
                  aria-hidden
                  className="logo-mark glint absolute inset-0 animate-[glint_0.9s_ease-out_1]"
                  style={{
                    backgroundColor: "transparent",
                    backgroundImage: GLINT,
                    backgroundSize: "260% 100%",
                    backgroundRepeat: "no-repeat",
                  }}
                />
              )}
            </motion.button>
          </div>

          <div className="relative flex items-end justify-between gap-3">
            <p className="font-serif text-[30vw] italic leading-[0.78] tabular-nums text-text-primary md:text-[11rem]">
              {count}
              <span className="align-top text-[0.28em] not-italic text-accent-ink">%</span>
            </p>
            <p className="max-w-[7.5rem] pb-1 text-right font-serif text-base italic leading-tight text-text-secondary sm:max-w-none md:pb-2 md:text-3xl">
              {t.preloader}…
            </p>
          </div>

          <span aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-line/15" />
          <span aria-hidden className="absolute bottom-0 left-0 h-px bg-accent-ink" style={{ width: `${count}%` }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
