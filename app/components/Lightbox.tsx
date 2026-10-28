"use client";

import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLang } from "../i18n/LanguageProvider";

export type LightboxItem = { src: string; alt: string; caption: string };

type LightboxProps = {
  items: LightboxItem[];
  index: number;
  onIndexChange: (i: number) => void;
  onClose: () => void;
};

const SWIPE_DISTANCE = 80;
const SWIPE_VELOCITY = 500;

/** Full-screen viewer: swipe/drag, arrow keys, Esc, focus trap, scroll lock, neighbour preload. */
export default function Lightbox({ items, index, onIndexChange, onClose }: LightboxProps) {
  const { t } = useLang();
  const [direction, setDirection] = useState(0);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const count = items.length;
  const item = items[index];

  const go = useCallback(
    (delta: number) => {
      setDirection(delta);
      onIndexChange((index + delta + count) % count);
    },
    [index, count, onIndexChange]
  );

  // Lock scroll, move focus into the dialog, and give it back to the opener on close.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      opener?.focus?.();
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return onClose();
      if (e.key === "ArrowLeft") return go(-1);
      if (e.key === "ArrowRight") return go(1);
      if (e.key !== "Tab") return;
      // Keep Tab inside the dialog.
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>("button:not([disabled])");
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onClose]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (count < 2) return;
    if (info.offset.x < -SWIPE_DISTANCE || info.velocity.x < -SWIPE_VELOCITY) go(1);
    else if (info.offset.x > SWIPE_DISTANCE || info.velocity.x > SWIPE_VELOCITY) go(-1);
  };

  const neighbours = count > 1 ? [items[(index + 1) % count], items[(index - 1 + count) % count]] : [];

  const navButton =
    "flex h-11 w-11 items-center justify-center rounded-full border border-line/20 text-text-primary hover:border-accent-ink hover:text-accent-ink transition-colors cursor-pointer";

  return (
    <motion.div
      ref={dialogRef}
      role="dialog"
      data-theme="dark"
      aria-modal="true"
      aria-label={item.alt}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[70] flex flex-col bg-bg-primary/95 backdrop-blur-md"
      onClick={onClose}
    >
      <div className="flex items-center justify-between px-4 py-3" onClick={(e) => e.stopPropagation()}>
        <p className="font-mono text-xs tracking-widest text-text-secondary" aria-live="polite">
          {index + 1} {t.gallery.of} {count}
        </p>
        <button ref={closeRef} type="button" aria-label={t.gallery.close} onClick={onClose} className={navButton}>
          <X size={20} aria-hidden />
        </button>
      </div>

      <div className="relative flex-1 min-h-0 px-4 overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={item.src}
            custom={direction}
            variants={{
              enter: (d: number) => ({ x: d * 80, opacity: 0 }),
              center: { x: 0, opacity: 1 },
              exit: (d: number) => ({ x: d * -80, opacity: 0 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            drag={count > 1 ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.25}
            onDragEnd={onDragEnd}
            className="absolute inset-0 mx-auto max-w-4xl cursor-grab active:cursor-grabbing touch-pan-y"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={item.src}
              alt={item.alt}
              fill
              sizes="(max-width: 896px) 100vw, 896px"
              className="object-contain select-none pointer-events-none"
              draggable={false}
              priority
            />
          </motion.div>
        </AnimatePresence>

        {/* Preload next/previous at the same size so they come from cache when swiped to. */}
        {neighbours.map((n) => (
          <Image
            key={n.src}
            src={n.src}
            alt=""
            width={16}
            height={16}
            sizes="(max-width: 896px) 100vw, 896px"
            priority
            className="pointer-events-none absolute h-px w-px opacity-0"
            aria-hidden
          />
        ))}
      </div>

      <div
        className="flex items-center justify-between gap-3 px-4 py-4 md:px-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" aria-label={t.gallery.prev} onClick={() => go(-1)} disabled={count < 2} className={navButton}>
          <ChevronLeft size={20} aria-hidden />
        </button>
        <p className="min-w-0 flex-1 text-center text-sm text-text-primary">
          <span className="block font-mono text-[11px] tracking-widest uppercase text-accent-ink">{item.caption}</span>
        </p>
        <button type="button" aria-label={t.gallery.next} onClick={() => go(1)} disabled={count < 2} className={navButton}>
          <ChevronRight size={20} aria-hidden />
        </button>
      </div>
    </motion.div>
  );
}
