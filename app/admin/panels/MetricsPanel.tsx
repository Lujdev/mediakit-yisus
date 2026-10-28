"use client";

import { useEffect, useState } from "react";
import { Button, Card, Field, StatusText, inputClass, json, useAdminRequest } from "../ui";

type Metric = { value: string; label: string };
type MetricsState = Record<string, Record<string, Metric>>;

const PLATFORM_NAMES: Record<string, string> = { instagram: "Instagram", tiktok: "TikTok" };

export default function MetricsPanel() {
  const [metrics, setMetrics] = useState<MetricsState>({});
  const { state, run } = useAdminRequest();

  useEffect(() => {
    fetch("/api/metrics", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => !d.error && setMetrics(d))
      .catch(() => {});
  }, []);

  const update = (platform: string, type: string, field: keyof Metric, value: string) =>
    setMetrics((prev) => ({
      ...prev,
      [platform]: { ...prev[platform], [type]: { ...prev[platform][type], [field]: value } },
    }));

  return (
    <div className="space-y-6">
      {Object.entries(metrics).map(([platform, items]) => (
        <Card key={platform}>
          <h2 className="font-display text-2xl text-text-primary mb-4">{PLATFORM_NAMES[platform] ?? platform}</h2>
          <div className="space-y-4">
            {Object.entries(items).map(([type, data]) => (
              <div key={type} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label={`${type} — valor`}>
                  <input value={data.value} onChange={(e) => update(platform, type, "value", e.target.value)} className={inputClass} />
                </Field>
                <Field label={`${type} — etiqueta`}>
                  <input value={data.label} onChange={(e) => update(platform, type, "label", e.target.value)} className={inputClass} />
                </Field>
              </div>
            ))}
          </div>
        </Card>
      ))}
      <div className="flex items-center gap-4">
        <Button
          disabled={state.kind === "saving"}
          onClick={() => run("/api/metrics", json("PUT", metrics))}
        >
          {state.kind === "saving" ? "Guardando..." : "Guardar métricas"}
        </Button>
        <StatusText state={state} />
      </div>
    </div>
  );
}
