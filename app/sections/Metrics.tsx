"use client";

import { AnimatePresence, animate, motion, useInView } from "framer-motion";
import { Plus } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { DETAILS, PERIOD, SHOTS, type MetricDetail } from "../data/metrics-detail";
import { useLang } from "../i18n/LanguageProvider";
import Lightbox from "../components/Lightbox";
import Reveal from "../components/Reveal";
import SectionHeader from "../components/SectionHeader";
import { InstagramIcon, TikTokIcon } from "../components/SocialIcons";

function AnimatedCounter({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(0, value, {
      duration: 2,
      ease: "easeOut",
      onUpdate: (latest) => {
        if (value >= 1000000) setDisplay((latest / 1000000).toFixed(1) + "M");
        else if (value >= 1000) setDisplay((latest / 1000).toFixed(1) + "K");
        else setDisplay(Math.floor(latest).toString());
      },
    });
    return () => controls.stop();
  }, [isInView, value]);

  // Digits in the primary colour, the K/M unit in the accent.
  const [, digits = display, unit = ""] = display.match(/^([\d.,]+)(\D*)$/) ?? [];
  return (
    <span ref={ref}>
      {digits}
      <span className="text-accent-lime">{unit}</span>
    </span>
  );
}

function DetailPanel({ detail }: { detail: MetricDetail }) {
  const { lang } = useLang();
  return (
    <div className="space-y-5 pb-6 pt-1 text-sm">
      {detail.bars && (
        <div>
          {detail.barsTitle && (
            <p className="mb-3 font-mono text-[11px] tracking-widest uppercase text-text-secondary">
              {detail.barsTitle[lang]}
            </p>
          )}
          <ul className="space-y-3">
            {detail.bars.map((bar) => (
              <li key={bar.label.es}>
                <div className="mb-1 flex justify-between text-text-primary">
                  <span>{bar.label[lang]}</span>
                  <span className="font-mono">{bar.value}</span>
                </div>
                <div className="h-1.5 w-full bg-white/10">
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    style={{ width: `${Math.max(bar.pct, 2)}%` }}
                    className="h-full origin-left bg-accent-lime"
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      {detail.stats && (
        <ul>
          {detail.stats.map((stat) => (
            <li key={stat.label.es} className="flex justify-between gap-4 border-t border-white/10 py-2.5">
              <span className="text-text-secondary">{stat.label[lang]}</span>
              <span className="font-mono text-text-primary">{stat.value}</span>
            </li>
          ))}
        </ul>
      )}
      {detail.note && <p className="text-text-secondary leading-relaxed">{detail.note[lang]}</p>}
    </div>
  );
}

interface MetricData {
  value: string;
  label: string;
}

type MetricsData = Record<string, Record<string, MetricData>>;

const PLATFORMS: { id: string; name: string; Icon: typeof InstagramIcon }[] = [
  { id: "instagram", name: "Instagram", Icon: InstagramIcon },
  { id: "tiktok", name: "TikTok", Icon: TikTokIcon },
];

export default function Metrics() {
  const { t, lang } = useLang();
  const [metrics, setMetrics] = useState<MetricsData>({});
  const [loading, setLoading] = useState(true);
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [viewer, setViewer] = useState<{ platform: string; index: number } | null>(null);

  useEffect(() => {
    fetch("/api/metrics")
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) setMetrics(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const parseValue = (val: string): number => parseFloat(val.replace(/[^0-9.]/g, "")) || 0;

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

        {PLATFORMS.map(({ id, name, Icon }) => {
          const data = metrics[id];
          if (!data) return null;
          const shots = SHOTS[id] ?? [];

          return (
            <div key={id} className="mb-16 md:mb-24">
              <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="flex items-center gap-3 font-display text-3xl md:text-4xl tracking-wide text-text-primary">
                  <Icon size={22} className="text-accent-lime" />
                  {name}
                </h3>
                {PERIOD[id] && (
                  <p className="font-mono text-[11px] tracking-widest uppercase text-text-secondary">
                    {PERIOD[id][lang]}
                  </p>
                )}
              </div>

              <ul className="grid grid-cols-1 items-start border-y border-white/10 md:grid-cols-3 md:divide-x md:divide-white/10">
                {Object.entries(data).map(([key, metric], i) => {
                  const detailKey = `${id}.${key}`;
                  const detail = DETAILS[detailKey];
                  const open = openKey === detailKey;
                  const head = (
                    <>
                      <span className="order-1 font-display text-6xl md:text-8xl leading-none text-text-primary">
                        {loading ? "…" : <AnimatedCounter value={parseValue(metric.value)} />}
                      </span>
                      <span className="order-2 flex items-center gap-3 text-sm md:text-base text-text-secondary">
                        {t.metrics.labels[key] ?? metric.label}
                        {detail && (
                          <span
                            aria-hidden
                            className={`flex h-7 w-7 items-center justify-center rounded-full border border-white/20 transition-all duration-300 group-hover:border-accent-lime group-hover:text-accent-lime ${
                              open ? "rotate-45 border-accent-lime text-accent-lime" : ""
                            }`}
                          >
                            <Plus size={14} />
                          </span>
                        )}
                      </span>
                    </>
                  );
                  const headClass =
                    "group flex w-full items-baseline justify-between gap-4 py-5 text-left md:flex-col md:items-start md:justify-start md:gap-2 md:py-10";

                  return (
                    <motion.li
                      key={key}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                      className="border-t border-white/10 first:border-t-0 md:border-t-0 md:px-8 md:first:pl-0"
                    >
                      {detail ? (
                        <button
                          type="button"
                          aria-expanded={open}
                          aria-controls={`metric-${detailKey}`}
                          aria-label={`${t.metrics.labels[key] ?? metric.label}: ${open ? t.metrics.less : t.metrics.more}`}
                          onClick={() => setOpenKey(open ? null : detailKey)}
                          className={`${headClass} cursor-pointer`}
                        >
                          {head}
                        </button>
                      ) : (
                        <div className={headClass}>{head}</div>
                      )}
                      <AnimatePresence initial={false}>
                        {open && detail && (
                          <motion.div
                            id={`metric-${detailKey}`}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                            className="overflow-hidden"
                          >
                            <DetailPanel detail={detail} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.li>
                  );
                })}
              </ul>

              {shots.length > 0 && (
                <Reveal>
                  <p className="mb-4 mt-8 font-mono text-[11px] tracking-widest uppercase text-text-secondary">
                    {t.metrics.shots}
                  </p>
                  <ul className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:px-0">
                    {shots.map((shot, i) => (
                      <li key={shot.src} className="w-40 shrink-0 snap-start md:w-48">
                        <button
                          type="button"
                          onClick={() => setViewer({ platform: id, index: i })}
                          aria-label={`${t.metrics.openShot}: ${shot.caption[lang]}`}
                          className="group block w-full cursor-pointer text-left"
                        >
                          <span className="relative block aspect-[540/1170] overflow-hidden rounded-2xl ring-1 ring-white/10 transition-all duration-300 group-hover:-translate-y-1 group-hover:ring-accent-lime/60">
                            <Image
                              src={shot.src}
                              alt=""
                              fill
                              sizes="(max-width: 768px) 160px, 192px"
                              className="object-cover object-top"
                            />
                          </span>
                          <span className="mt-2 block text-xs text-text-secondary transition-colors group-hover:text-text-primary">
                            {shot.caption[lang]}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </Reveal>
              )}
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {viewer && (
          <Lightbox
            items={(SHOTS[viewer.platform] ?? []).map((s) => ({
              src: s.src,
              alt: s.caption[lang],
              caption: s.caption[lang],
            }))}
            index={viewer.index}
            onIndexChange={(i) => setViewer({ ...viewer, index: i })}
            onClose={() => setViewer(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
