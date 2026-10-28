"use client";

import { useEffect, useState } from "react";
import { Button, Field, PanelHeader, StatusText, inputClass, json, useAdminRequest } from "../ui";

type Metric = { value: string; label: string };
type MetricsState = Record<string, Record<string, Metric>>;

const PLATFORM_NAMES: Record<string, string> = { instagram: "Instagram", tiktok: "TikTok" };
const METRIC_NAMES: Record<string, string> = {
  followers: "Seguidores",
  views: "Visualizaciones",
  new_followers: "Nuevos seguidores",
  likes: "Me gusta",
};

/** Same short form the site shows (12.1K, 2.1M), so the edit matches what visitors see. */
function preview(raw: string) {
  const n = parseFloat(raw.replace(/[^0-9.]/g, "")) || 0;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(Math.floor(n));
}

export default function MetricsPanel() {
  const [metrics, setMetrics] = useState<MetricsState>({});
  const { state, run } = useAdminRequest();

  useEffect(() => {
    fetch("/api/metrics", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => !d.error && setMetrics(d))
      .catch(() => {});
  }, []);

  const update = (platform: string, type: string, value: string) =>
    setMetrics((prev) => ({
      ...prev,
      [platform]: { ...prev[platform], [type]: { ...prev[platform][type], value } },
    }));

  return (
    <div>
      <PanelHeader
        title="Métricas"
        description="Escribe el número completo, sin comas (por ejemplo 12100). En el sitio se muestra abreviado."
      />
      <div className="space-y-10">
        {Object.entries(metrics).map(([platform, items]) => (
          <section key={platform}>
            <h3 className="mb-3 font-mono text-xs uppercase tracking-widest text-text-secondary">
              {PLATFORM_NAMES[platform] ?? platform}
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {Object.entries(items).map(([type, data]) => (
                <Field key={type} label={METRIC_NAMES[type] ?? type}>
                  <div className="relative">
                    <input
                      inputMode="numeric"
                      value={data.value}
                      onChange={(e) => update(platform, type, e.target.value)}
                      className={`${inputClass} pr-16 font-mono`}
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-display text-xl text-accent-ink">
                      {preview(data.value)}
                    </span>
                  </div>
                </Field>
              ))}
            </div>
          </section>
        ))}
      </div>
      <div className="mt-8 flex items-center gap-4">
        <Button disabled={state.kind === "saving"} onClick={() => run("/api/metrics", json("PUT", metrics))}>
          {state.kind === "saving" ? "Guardando..." : "Guardar"}
        </Button>
        <StatusText state={state} />
      </div>
    </div>
  );
}
