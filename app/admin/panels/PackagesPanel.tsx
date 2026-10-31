"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button, Disclosure, Field, PanelHeader, StatusText, inputClass, json, move, useAdminRequest } from "../ui";

type Row = {
  key: number;
  name: string;
  price: string;
  popular: boolean;
  descEs: string;
  descEn: string;
  featEs: string;
  featEn: string;
};
let nextKey = 1;
const blank = (): Row => ({ key: nextKey++, name: "", price: "$", popular: false, descEs: "", descEn: "", featEs: "", featEn: "" });

export default function PackagesPanel() {
  const [rows, setRows] = useState<Row[]>([]);
  const { state, run } = useAdminRequest();

  useEffect(() => {
    fetch("/api/packages", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) =>
        setRows(
          (d.packages ?? []).map(
            (p: {
              name: string;
              price: string;
              popular: boolean;
              description: { es: string; en: string };
              features: { es: string[]; en: string[] };
            }): Row => ({
              key: nextKey++,
              name: p.name,
              price: p.price,
              popular: p.popular,
              descEs: p.description.es,
              descEn: p.description.en,
              featEs: p.features.es.join("\n"),
              featEn: p.features.en.join("\n"),
            })
          )
        )
      )
      .catch(() => {});
  }, []);

  const update = (i: number, patch: Partial<Row>) =>
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));

  // Only one package can carry the "popular" badge.
  const setPopular = (i: number, on: boolean) =>
    setRows((r) => r.map((row, idx) => ({ ...row, popular: on && idx === i })));

  const save = () =>
    run(
      "/api/packages",
      json("PUT", {
        packages: rows.map((r) => ({
          name: r.name,
          price: r.price,
          popular: r.popular,
          description: { es: r.descEs, en: r.descEn },
          features: { es: r.featEs.split("\n"), en: r.featEn.split("\n") },
        })),
      })
    );

  return (
    <div>
      <PanelHeader title="Tarifas" description="Los precios solo se muestran en el panel de administración. Cada paquete tiene su texto en español e inglés; las características van una por línea." />

      <div className="rounded-xl border border-line/10 px-3 md:px-5">
        {rows.map((row, i) => (
          <Disclosure
            key={row.key}
            defaultOpen={!row.name}
            summary={
              <span className="flex items-center justify-between gap-4">
                <span className="flex min-w-0 items-center gap-3">
                  <span className="truncate font-display text-2xl tracking-wide text-text-primary">{row.name || "Nuevo paquete"}</span>
                  {row.popular && (
                    <span className="shrink-0 bg-accent-orange px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-on-accent">popular</span>
                  )}
                </span>
                <span className="font-display text-2xl text-accent-ink">{row.price}</span>
              </span>
            }
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 items-end gap-4 md:grid-cols-[1fr_8rem_auto]">
                <div className="col-span-2 md:col-span-1">
                  <Field label="Nombre">
                    <input value={row.name} onChange={(e) => update(i, { name: e.target.value })} className={inputClass} />
                  </Field>
                </div>
                <Field label="Precio">
                  <input value={row.price} onChange={(e) => update(i, { price: e.target.value })} className={inputClass} />
                </Field>
                <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm text-text-secondary">
                  <input type="checkbox" checked={row.popular} onChange={(e) => setPopular(i, e.target.checked)} className="h-5 w-5 accent-[#D4F23A]" />
                  Más popular
                </label>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Descripción (ES)">
                  <input value={row.descEs} onChange={(e) => update(i, { descEs: e.target.value })} className={inputClass} />
                </Field>
                <Field label="Description (EN)">
                  <input value={row.descEn} onChange={(e) => update(i, { descEn: e.target.value })} className={inputClass} />
                </Field>
                <Field label="Características (ES)">
                  <textarea rows={5} value={row.featEs} onChange={(e) => update(i, { featEs: e.target.value })} className={inputClass} />
                </Field>
                <Field label="Features (EN)">
                  <textarea rows={5} value={row.featEn} onChange={(e) => update(i, { featEn: e.target.value })} className={inputClass} />
                </Field>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="ghost" aria-label="Subir" disabled={i === 0} onClick={() => setRows(move(rows, i, i - 1))}>
                  <ArrowUp size={16} aria-hidden />
                </Button>
                <Button variant="ghost" aria-label="Bajar" disabled={i === rows.length - 1} onClick={() => setRows(move(rows, i, i + 1))}>
                  <ArrowDown size={16} aria-hidden />
                </Button>
                <Button variant="danger" onClick={() => setRows(rows.filter((_, idx) => idx !== i))}>
                  <Trash2 size={16} aria-hidden /> Quitar
                </Button>
              </div>
            </div>
          </Disclosure>
        ))}
        {rows.length === 0 && <p className="py-6 text-sm text-text-secondary">No hay paquetes todavía.</p>}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button variant="ghost" onClick={() => setRows([...rows, blank()])}>
          <Plus size={16} aria-hidden /> Agregar paquete
        </Button>
        <Button disabled={state.kind === "saving"} onClick={save}>
          {state.kind === "saving" ? "Guardando..." : "Guardar"}
        </Button>
        <StatusText state={state} />
      </div>
    </div>
  );
}
