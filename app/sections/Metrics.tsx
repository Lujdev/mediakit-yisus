"use client";

import { motion, useInView, animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Users, Eye, Heart } from "lucide-react";
import InstagramIcon from "../components/InstagramIcon";

function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(0, value, {
      duration: 2,
      ease: "easeOut",
      onUpdate: (latest) => {
        if (value >= 1000000) {
          setDisplay((latest / 1000000).toFixed(1) + "M");
        } else if (value >= 1000) {
          setDisplay((latest / 1000).toFixed(1) + "K");
        } else {
          setDisplay(Math.floor(latest).toString());
        }
      },
    });
    return () => controls.stop();
  }, [isInView, value]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}

const instagramMetrics = [
  { label: "Seguidores", value: 12100, icon: Users, suffix: "" },
  { label: "Visualizaciones (30d)", value: 2051810, icon: Eye, suffix: "" },
  { label: "Nuevos seguidores", value: 1610, icon: InstagramIcon, suffix: "" },
];

const tiktokMetrics = [
  { label: "Seguidores", value: 14000, icon: Users, suffix: "" },
  { label: "Visualizaciones", value: 1100000, icon: Eye, suffix: "" },
  { label: "Me gusta", value: 171600, icon: Heart, suffix: "" },
];

export default function Metrics() {
  return (
    <section id="metrics" className="relative py-24 md:py-32 px-4">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-accent-lime text-sm tracking-[0.3em] uppercase mb-4">
            Alcance real
          </p>
          <h2 className="font-display text-5xl md:text-7xl text-text-primary mb-4">
            MÉTRICAS
          </h2>
          <p className="text-text-secondary max-w-xl mx-auto">
            Audiencia que crece. Contenido que conecta. Resultados que se ven.
          </p>
        </motion.div>

        {/* Instagram */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <InstagramIcon className="text-accent-orange" size={28} />
            <h3 className="font-display text-3xl text-text-primary">INSTAGRAM</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {instagramMetrics.map((metric, i) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass rounded-2xl p-6 md:p-8 text-center hover:border-accent-lime/20 transition-colors"
              >
                <metric.icon className="mx-auto text-accent-lime mb-4" size={32} />
                <div className="font-display text-4xl md:text-5xl text-text-primary mb-2">
                  <AnimatedCounter value={metric.value} suffix={metric.suffix} />
                </div>
                <p className="text-text-secondary text-sm">{metric.label}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* TikTok */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <svg
              className="text-accent-orange"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
            </svg>
            <h3 className="font-display text-3xl text-text-primary">TIKTOK</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tiktokMetrics.map((metric, i) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass rounded-2xl p-6 md:p-8 text-center hover:border-accent-lime/20 transition-colors"
              >
                <metric.icon className="mx-auto text-accent-lime mb-4" size={32} />
                <div className="font-display text-4xl md:text-5xl text-text-primary mb-2">
                  <AnimatedCounter value={metric.value} suffix={metric.suffix} />
                </div>
                <p className="text-text-secondary text-sm">{metric.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
