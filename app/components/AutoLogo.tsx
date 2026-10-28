"use client";

import { animate, useInView, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import LogoDraw from "./LogoDraw";

/**
 * The monogram that draws itself every time it scrolls into view, and again on hover or tap.
 * Under reduced motion it simply shows the finished logo.
 */
export default function AutoLogo({ className = "", label }: { className?: string; label?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { amount: 0.6 });
  const reduce = useReducedMotion();
  const [progress, setProgress] = useState(1);
  const running = useRef<ReturnType<typeof animate> | null>(null);

  const play = useCallback(() => {
    if (reduce) return;
    running.current?.stop();
    running.current = animate(0, 1, { duration: 1.8, ease: [0.65, 0, 0.35, 1], onUpdate: setProgress });
  }, [reduce]);

  useEffect(() => {
    if (inView) play();
    return () => running.current?.stop();
  }, [inView, play]);

  return (
    <span
      ref={ref}
      role="img"
      aria-label={label}
      onPointerEnter={play}
      onClick={play}
      className={`inline-block cursor-pointer ${className}`}
      style={{ aspectRatio: "588 / 480" }}
    >
      <LogoDraw progress={progress} className="h-full w-full" />
    </span>
  );
}
