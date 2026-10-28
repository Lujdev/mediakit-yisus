"use client";

import { useContext, useEffect, useMemo, useState } from "react";
import { AuthLostContext, Button, PanelHeader, json } from "../ui";

type Row = { k: string; c: number };
type Recent = {
  ip: string | null;
  country: string | null;
  city: string | null;
  device: string;
  os: string;
  browser: string;
  lang: string | null;
  referrer: string | null;
  path: string;
  at: string;
};
type Stats = {
  days: number;
  today: string;
  totals: { visits: number; visitors: number };
  daily: { d: string; c: number }[];
  device: Row[];
  os: Row[];
  browser: Row[];
  country: Row[];
  lang: Row[];
  referrer: Row[];
  path: Row[];
  recent: Recent[];
};

const RANGES = [7, 30, 90] as const;
const DEVICES: Record<string, string> = { mobile: "Móvil", tablet: "Tableta", desktop: "Escritorio" };

const regionNames = typeof Intl !== "undefined" && "DisplayNames" in Intl ? new Intl.DisplayNames(["es"], { type: "region" }) : null;
const countryName = (code: string) => {
  try {
    return regionNames?.of(code.toUpperCase()) ?? code;
  } catch {
    return code;
  }
};

function BarList({ title, rows, label }: { title: string; rows: Row[]; label?: (k: string) => string }) {
  const max = Math.max(1, ...rows.map((r) => r.c));
  return (
    <section>
      <h3 className="mb-3 font-mono text-xs uppercase tracking-widest text-text-secondary">{title}</h3>
      {rows.length === 0 ? (
        <p className="text-sm text-text-secondary">Sin datos todavía.</p>
      ) : (
        <ul className="space-y-2.5">
          {rows.map((r) => (
            <li key={r.k}>
              <div className="mb-1 flex justify-between gap-3 text-sm">
                <span className="truncate text-text-primary">{label ? label(r.k) : r.k || "—"}</span>
                <span className="font-mono text-text-secondary">{r.c}</span>
              </div>
              <div className="h-1.5 bg-line/10">
                <div className="h-full bg-accent-ink" style={{ width: `${(r.c / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function VisitsPanel() {
  const authLost = useContext(AuthLostContext);
  const [days, setDays] = useState<(typeof RANGES)[number]>(30);
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");
  const [ignored, setIgnored] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/admin/ignore", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setIgnored(d.ignored))
      .catch(() => {});
  }, []);

  const toggleIgnored = async () => {
    const next = !ignored;
    const res = await fetch("/api/admin/ignore", json("POST", { ignore: next }));
    if (res.ok) setIgnored(next);
  };

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/admin/visits?days=${days}`, { cache: "no-store" })
      .then(async (r) => {
        if (r.status === 401) return authLost();
        if (!r.ok) throw new Error();
        const data = await r.json();
        if (!cancelled) {
          setStats(data);
          setError("");
        }
      })
      .catch(() => !cancelled && setError("No se pudieron cargar las visitas."));
    return () => {
      cancelled = true;
    };
  }, [days, authLost]);

  // One bar per day, zero-filled so quiet days show as gaps.
  const bars = useMemo(() => {
    if (!stats) return [];
    const byDay = new Map(stats.daily.map((d) => [d.d, d.c]));
    const end = new Date(`${stats.today}T00:00:00Z`).getTime();
    return Array.from({ length: stats.days }, (_, i) => {
      const date = new Date(end - (stats.days - 1 - i) * 86_400_000).toISOString().slice(0, 10);
      return { date, c: byDay.get(date) ?? 0 };
    });
  }, [stats]);
  const maxBar = Math.max(1, ...bars.map((b) => b.c));

  return (
    <div>
      <PanelHeader
        title="Visitas"
        description="Se guardan la IP y los datos del dispositivo durante 90 días; después se borran solas. Los bots no se cuentan y una misma persona no se repite al recargar."
      />

      <div className="mb-8 flex flex-wrap items-center gap-3 rounded-xl border border-line/10 p-4 text-sm">
        <p className="min-w-0 flex-1 text-text-secondary">
          {ignored === null
            ? "Comprobando este dispositivo..."
            : ignored
            ? "Este dispositivo no se cuenta (entraste al admin desde aquí)."
            : "Este dispositivo sí se está contando."}
        </p>
        {ignored !== null && (
          <Button variant="ghost" onClick={toggleIgnored}>
            {ignored ? "Volver a contarlo" : "No contar este dispositivo"}
          </Button>
        )}
      </div>

      <div role="group" aria-label="Rango de días" className="mb-8 flex gap-2">
        {RANGES.map((r) => (
          <button
            key={r}
            type="button"
            aria-pressed={days === r}
            onClick={() => setDays(r)}
            className={`min-h-11 cursor-pointer rounded-full px-4 text-sm font-medium transition-colors ${
              days === r ? "bg-line/10 text-text-primary" : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {r} días
          </button>
        ))}
      </div>

      {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
      {!stats && !error && <p className="text-sm text-text-secondary">Cargando...</p>}

      {stats && (
        <div className="space-y-12">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="font-display text-6xl leading-none text-text-primary md:text-7xl">{stats.totals.visits}</p>
              <p className="mt-1 text-sm text-text-secondary">Visitas</p>
            </div>
            <div>
              <p className="font-display text-6xl leading-none text-text-primary md:text-7xl">{stats.totals.visitors}</p>
              <p className="mt-1 text-sm text-text-secondary">Visitantes distintos</p>
            </div>
          </div>

          <section aria-label="Visitas por día">
            <div className="flex h-24 items-end gap-px">
              {bars.map((b) => (
                <div
                  key={b.date}
                  title={`${b.date}: ${b.c}`}
                  className="flex-1 bg-accent-ink/70"
                  style={{ height: `${Math.max(b.c ? 6 : 1, (b.c / maxBar) * 100)}%`, opacity: b.c ? 1 : 0.25 }}
                />
              ))}
            </div>
            <div className="mt-1 flex justify-between font-mono text-[10px] text-text-secondary">
              <span>{bars[0]?.date}</span>
              <span>{bars[bars.length - 1]?.date}</span>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
            <BarList title="Dispositivo" rows={stats.device} label={(k) => DEVICES[k] ?? k} />
            <BarList title="Sistema" rows={stats.os} />
            <BarList title="Navegador" rows={stats.browser} />
            <BarList title="País" rows={stats.country} label={(k) => (k ? countryName(k) : "Desconocido")} />
            <BarList title="Idioma del navegador" rows={stats.lang} label={(k) => k || "—"} />
            <BarList title="Origen" rows={stats.referrer} label={(k) => k || "Directo"} />
          </div>

          <section>
            <h3 className="mb-3 font-mono text-xs uppercase tracking-widest text-text-secondary">Últimas visitas</h3>
            {stats.recent.length === 0 ? (
              <p className="text-sm text-text-secondary">Todavía no hay visitas registradas.</p>
            ) : (
              <ul className="rounded-xl border border-line/10 px-4 md:px-5">
                {stats.recent.map((r, i) => (
                  <li key={i} className="border-t border-line/10 py-3 text-sm first:border-t-0">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                      <span className="font-mono text-text-primary">{r.ip ?? "IP desconocida"}</span>
                      <span className="font-mono text-[11px] text-text-secondary">{new Date(r.at).toLocaleString()}</span>
                    </div>
                    <p className="mt-0.5 text-text-secondary">
                      {[r.city, r.country ? countryName(r.country) : null].filter(Boolean).join(", ") || "Ubicación desconocida"}
                      {" · "}
                      {DEVICES[r.device] ?? r.device} · {r.os} · {r.browser}
                    </p>
                    <p className="text-xs text-text-secondary/80">
                      {r.referrer ? `desde ${r.referrer}` : "acceso directo"} · {r.path}
                      {r.lang ? ` · ${r.lang}` : ""}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
