"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const letters = ["Y", "I", "S", "U", "S"];

export default function Preloader({ onComplete }: { onComplete: () => void }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onComplete, 600);
    }, 2800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.5, ease: "easeInOut" as const },
    },
  };

  const letterVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut" as const,
      },
    },
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div className="flex items-center gap-2 md:gap-4">
            {letters.map((letter, i) => (
              <motion.span
                key={i}
                variants={letterVariants}
                className="font-display text-6xl md:text-9xl text-accent-lime neon-glow"
                animate={
                  i === letters.length - 1
                    ? {
                        scale: [1, 1.05, 1],
                        opacity: [1, 0.85, 1, 0.9, 1],
                        transition: {
                          delay: 0.15 * letters.length + 0.2,
                          duration: 0.4,
                          times: [0, 0.3, 0.5, 0.7, 1],
                        },
                      }
                    : {}
                }
              >
                {letter}
              </motion.span>
            ))}
          </div>
          <motion.div
            className="absolute bottom-12 left-1/2 -translate-x-1/2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 1.2 } }}
          >
            <p className="text-text-secondary text-sm tracking-[0.3em] uppercase">
              Cargando actitud...
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
