"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

type SplitHeadingProps = {
  lines: string[];
  className?: string;
  accentLine?: number;
};

/** Line-by-line mask reveal. Observes the unclipped wrapper, not the translated child. */
export default function SplitHeading({ lines, className = "", accentLine }: SplitHeadingProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -60px 0px" });

  return (
    <span ref={ref} className={`block ${className}`}>
      {lines.map((line, i) => (
        <span key={line} className="block overflow-hidden pb-[0.06em]">
          <motion.span
            className={`block ${accentLine === i ? "text-accent-ink" : ""}`}
            initial={{ y: "110%" }}
            animate={inView ? { y: 0 } : undefined}
            transition={{ duration: 0.9, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </span>
  );
}
