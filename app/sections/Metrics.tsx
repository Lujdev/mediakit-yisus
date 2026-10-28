"use client";

import { useLang } from "../i18n/LanguageProvider";
import SectionHeader from "../components/SectionHeader";
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

interface MetricData {
  value: string;
  label: string;
}

interface MetricsData {
  instagram?: Record<string, MetricData>;
  tiktok?: Record<string, MetricData>;
}

const iconMap: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
  followers: Users,
  views: Eye,
  new_followers: Users,
  likes: Heart,
};

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
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          {platformIcon}
          <h3 className="font-display text-3xl text-text-primary uppercase">
            {platform}
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(data).map(([key, metric], i) => {
            const Icon = iconMap[key] || Eye;
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass rounded-2xl p-6 md:p-8 text-center hover:border-accent-lime/20 transition-colors"
              >
                <Icon className="mx-auto text-accent-lime mb-4" size={32} />
                <div className="font-display text-4xl md:text-5xl text-text-primary mb-2">
                  {loading ? (
                    "..."
                  ) : (
                    <AnimatedCounter value={parseValue(metric.value)} />
                  )}
                </div>
                <p className="text-text-secondary text-sm">{t.metrics.labels[key] ?? metric.label}</p>
              </motion.div>
            );
          })}
        </div>
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
          <InstagramIcon className="text-accent-orange" size={28} />
        )}

        {renderPlatform(
          "tiktok",
          metrics.tiktok,
          <svg
            className="text-accent-orange"
            width="28"
            height="28"
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
