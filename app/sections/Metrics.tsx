"use client";

import { useLang } from "../i18n/LanguageProvider";
import SectionHeader from "../components/SectionHeader";
import { motion, useInView, animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";
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

  const [, digits = display, unit = ""] = display.match(/^([\d.,]+)(\D*)$/) ?? [];
  return (
    <span ref={ref}>
      {digits}
      <span className="text-accent-lime">
        {unit}
        {suffix}
      </span>
    </span>
  );
}

interface MetricData {
  value: string;
  label: string;
}

interface MetricsData {
  instagram?: Record<string, MetricData>;
  tiktok?: Record<string, MetricData>;
}

export default function Metrics() {
  const { t } = useLang();
  const [metrics, setMetrics] = useState<MetricsData>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/metrics")
      .then((r) => r.json())
      .then((data) => {
        setMetrics(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const parseValue = (val: string): number => {
    const clean = val.replace(/[^0-9.]/g, "");
    return parseFloat(clean) || 0;
  };

  const renderPlatform = (
    platform: string,
    data: Record<string, MetricData> | undefined,
    platformIcon: React.ReactNode
  ) => {
    if (!data) return null;

    return (
      <div className="mb-14 md:mb-20">
        <div className="mb-2 flex items-center gap-3 text-text-secondary">
          {platformIcon}
          <h3 className="font-mono text-xs tracking-[0.3em] uppercase">{platform}</h3>
        </div>
        <dl className="grid grid-cols-1 md:grid-cols-3 md:divide-x md:divide-white/10 border-y border-white/10">
          {Object.entries(data).map(([key, metric], i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-baseline justify-between gap-4 py-5 md:flex-col md:items-start md:justify-start md:gap-2 md:py-10 md:px-8 md:first:pl-0 border-t border-white/10 first:border-t-0 md:border-t-0"
            >
              <dt className="order-2 md:order-2 text-text-secondary text-sm md:text-base">
                {t.metrics.labels[key] ?? metric.label}
              </dt>
              <dd className="order-1 font-display text-6xl md:text-8xl leading-none text-text-primary">
                {loading ? "…" : <AnimatedCounter value={parseValue(metric.value)} />}
              </dd>
            </motion.div>
          ))}
        </dl>
      </div>
    );
  };

  return (
    <section id="metrics" className="relative py-16 md:py-36 px-4">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          index="02"
          eyebrow={t.metrics.eyebrow}
          title={t.metrics.title}
          accentLine={0}
          description={t.metrics.description}
        />

        {renderPlatform(
          "instagram",
          metrics.instagram,
          <InstagramIcon className="text-text-secondary" size={18} />
        )}

        {renderPlatform(
          "tiktok",
          metrics.tiktok,
          <svg
            className="text-text-secondary"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
          </svg>
        )}
      </div>
    </section>
  );
}
