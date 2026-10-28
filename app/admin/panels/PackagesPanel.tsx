"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button, Card, Field, StatusText, inputClass, json, move, useAdminRequest } from "../ui";

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
    fetch("/api/site", { cache: "no-store" })
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
    <Card>
      <h2 className="font-display text-2xl text-text-primary mb-1">Tarifas</h2>
      <p className="text-text-secondary text-sm mb-5">
        Cada paquete tiene texto en español e inglés. En las características escribe una por línea.
      </p>

      <div className="space-y-5">
        {rows.map((row, i) => (
          <div key={row.key} className="rounded-xl border border-white/10 p-3 md:p-4 space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-[1fr_8rem_auto] gap-3 items-end">
              <div className="col-span-2 md:col-span-1">
                <Field label="Nombre">
                  <input value={row.name} onChange={(e) => update(i, { name: e.target.value })} className={inputClass} />
                </Field>
              </div>
              <Field label="Precio">
                <input value={row.price} onChange={(e) => update(i, { price: e.target.value })} className={inputClass} />
              </Field>
              <label className="flex min-h-11 items-center gap-2 text-sm text-text-secondary cursor-pointer">
                <input
                  type="checkbox"
                  checked={row.popular}
                  onChange={(e) => update(i, { popular: e.target.checked })}
                  className="h-5 w-5 accent-[#C8FF00]"
                />
                Más popular
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button variant="ghost" onClick={() => setRows([...rows, blank()])}>
          <Plus size={16} aria-hidden /> Agregar paquete
        </Button>
        <Button disabled={state.kind === "saving"} onClick={save}>
          {state.kind === "saving" ? "Guardando..." : "Guardar tarifas"}
        </Button>
        <StatusText state={state} />
      </div>
    </Card>
  );
}
