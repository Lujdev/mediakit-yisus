"use client";

import { AnimatePresence, animate, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useLang } from "../i18n/LanguageProvider";

const letters = ["Y", "I", "S", "U", "S"];
const ease = [0.76, 0, 0.24, 1] as const;

/** Full-screen intro: oversized name, a 0-100 counter, then a curtain that lifts away. */
export default function Preloader({ onComplete }: { onComplete: () => void }) {
  const { t } = useLang();
  const [count, setCount] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const controls = animate(0, 100, {
      duration: 1.8,
      ease: [0.65, 0, 0.35, 1],
      onUpdate: (v) => setCount(Math.round(v)),
      onComplete: () => {
        timer = setTimeout(() => setVisible(false), 250);
      },
    });
    document.body.style.overflow = "hidden";
    return () => {
      controls.stop();
      if (timer) clearTimeout(timer);
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {visible && (
        <motion.div
          role="status"
          aria-label={t.preloader}
          className="fixed inset-0 z-[80] flex flex-col justify-between overflow-hidden bg-bg-primary p-5 md:p-10"
          exit={{ y: "-100%" }}
          transition={{ duration: 0.9, ease }}
        >
          <div className="flex items-start justify-between font-mono text-[11px] tracking-[0.25em] uppercase text-text-secondary">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-yc.png" alt="" width={458} height={480} className="h-10 w-auto md:h-14" />
            <span>MediaKit</span>
          </div>

          <div aria-hidden className="flex justify-center font-display leading-[0.8] text-[34vw] md:text-[20rem]">
            {letters.map((letter, i) => (
              <span key={i} className="block overflow-hidden pb-[0.04em]">
                <motion.span
                  className={`block ${i === letters.length - 1 ? "text-accent-lime" : "text-text-primary"}`}
                  initial={{ y: "105%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.8, delay: 0.1 + i * 0.09, ease }}
                >
                  {letter}
                </motion.span>
              </span>
            ))}
          </div>

          <div className="flex items-end justify-between gap-4">
            <p className="font-display text-[26vw] leading-[0.8] tabular-nums text-text-primary md:text-[10rem]">
              {count}
              <span className="text-accent-lime text-[0.4em]">%</span>
            </p>
            <p className="max-w-[10rem] pb-2 text-right font-mono text-[11px] tracking-[0.25em] uppercase text-text-secondary">
              {t.preloader}
            </p>
          </div>

          <span
            aria-hidden
            className="absolute bottom-0 left-0 h-1 bg-accent-lime"
            style={{ width: `${count}%` }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
