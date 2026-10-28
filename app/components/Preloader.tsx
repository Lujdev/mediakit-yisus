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
const RING_R = 50;
const RING_LEN = 2 * Math.PI * RING_R;

/**
 * Intro screen: the YC monogram inside a progress ring. The logo tilts toward the pointer
 * (or a finger drag) and spins when clicked, tapped or activated with the keyboard.
 */
export default function Preloader({ onComplete }: { onComplete: () => void }) {
  const { t } = useLang();
  const reduceMotion = useReducedMotion();
  const [count, setCount] = useState(0);
  const [visible, setVisible] = useState(true);

  const tiltX = useSpring(useMotionValue(0), { stiffness: 140, damping: 14 });
  const tiltY = useSpring(useMotionValue(0), { stiffness: 140, damping: 14 });
  const spin = useMotionValue(0);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const controls = animate(0, 100, {
      duration: 2.6,
      ease: [0.65, 0, 0.35, 1],
      onUpdate: (v) => setCount(Math.round(v)),
      onComplete: () => {
        timer = setTimeout(() => setVisible(false), 350);
      },
    });
    document.body.style.overflow = "hidden";
    return () => {
      controls.stop();
      if (timer) clearTimeout(timer);
      document.body.style.overflow = "";
    };
  }, []);

  // Tilt toward the pointer anywhere on screen (mouse hover or touch drag).
  useEffect(() => {
    if (reduceMotion) return;
    const move = (e: PointerEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      tiltY.set(x * 22);
      tiltX.set(-y * 22);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [reduceMotion, tiltX, tiltY]);

  const spinLogo = () => {
    if (reduceMotion) return;
    animate(spin, spin.get() + 360, { duration: 0.9, ease: [0.22, 1, 0.36, 1] });
  };

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {visible && (
        <motion.div
          role="status"
          aria-label={`${t.preloader} ${count}%`}
          className="fixed inset-0 z-[80] flex flex-col justify-between overflow-hidden bg-bg-primary p-5 md:p-10"
          exit={{ y: "-100%" }}
          transition={{ duration: 0.9, ease }}
        >
          <div className="flex items-start justify-between font-mono text-[11px] tracking-[0.25em] uppercase text-text-secondary">
            <span>Yisus Contreras</span>
            <span>MediaKit</span>
          </div>

          <div className="flex justify-center">
            <div className="relative aspect-square w-[78vw] max-w-[440px]" style={{ perspective: 800 }}>
              {/* Progress ring + rotating "loading attitude" text */}
              <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full" aria-hidden>
                <defs>
                  <path id="preloader-text-circle" d="M60,60 m-56,0 a56,56 0 1,1 112,0 a56,56 0 1,1 -112,0" />
                </defs>
                <g className="origin-center animate-[spin_16s_linear_infinite] motion-reduce:animate-none">
                  <text fill="currentColor" fontSize="6.5" letterSpacing="2" className="font-mono uppercase text-text-secondary">
                    <textPath href="#preloader-text-circle" textLength="350" lengthAdjust="spacing">
                      {`${t.preloader} · ${t.preloader} · ${t.preloader} · `}
                    </textPath>
                  </text>
                </g>
                <circle cx="60" cy="60" r={RING_R} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                <circle
                  cx="60"
                  cy="60"
                  r={RING_R}
                  fill="none"
                  stroke="#D4F23A"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray={RING_LEN}
                  strokeDashoffset={RING_LEN * (1 - count / 100)}
                  transform="rotate(-90 60 60)"
                />
              </svg>

              <motion.button
                type="button"
                onClick={spinLogo}
                aria-label={t.preloaderSpin}
                style={{ rotateX: tiltX, rotateY: tiltY, rotateZ: spin }}
                whileTap={{ scale: 0.92 }}
                className="absolute inset-[22%] flex cursor-pointer items-center justify-center"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo-yc.png" alt="" width={458} height={480} draggable={false} className="h-full w-full select-none object-contain" />
              </motion.button>
            </div>
          </div>

          <div className="flex items-end justify-between gap-4">
            <p className="font-display text-[26vw] leading-[0.8] tabular-nums text-text-primary md:text-[10rem]">
              {count}
              <span className="text-accent-lime text-[0.4em]">%</span>
            </p>
            <p className="max-w-[9rem] pb-2 text-right font-mono text-[11px] tracking-[0.25em] uppercase text-text-secondary">
              {t.preloaderHint}
            </p>
          </div>

          <span aria-hidden className="absolute bottom-0 left-0 h-1 bg-accent-lime" style={{ width: `${count}%` }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
