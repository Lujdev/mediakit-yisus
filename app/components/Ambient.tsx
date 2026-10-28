"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/** Scroll progress bar + faint film grain. Purely decorative. */
export default function Ambient() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  return (
    <>
      <motion.div
        aria-hidden
        style={{ scaleX }}
        className="fixed top-0 left-0 right-0 h-[2px] origin-left z-[60] bg-accent-lime"
      />
      <div aria-hidden className="grain" />
    </>
  );
}
