"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button, Card, Field, StatusText, inputClass, json, move, useAdminRequest } from "../ui";

type Row = { key: number; title: string; url: string };
let nextKey = 1;

export default function VideosPanel() {
  const [rows, setRows] = useState<Row[]>([]);
  const { state, run } = useAdminRequest();

  useEffect(() => {
    fetch("/api/site", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) =>
        setRows((d.videos ?? []).map((v: { title: string; url: string }) => ({ key: nextKey++, title: v.title, url: v.url })))
      )
      .catch(() => {});
  }, []);

  const update = (i: number, patch: Partial<Row>) =>
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));

  return (
    <Card>
      <h2 className="font-display text-2xl text-text-primary mb-1">Videos</h2>
      <p className="text-text-secondary text-sm mb-5">
        Pega un enlace de YouTube (se reproduce en el sitio), TikTok o Instagram (abre en su app), o un archivo directo
        .mp4. Sin videos, la sección no se muestra.
      </p>

      <div className="space-y-4">
        {rows.map((row, i) => (
          <div key={row.key} className="rounded-xl border border-white/10 p-3 md:p-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="Título (opcional)">
                <input value={row.title} onChange={(e) => update(i, { title: e.target.value })} className={inputClass} />
              </Field>
              <Field label="Enlace">
                <input
                  type="url"
                  value={row.url}
                  placeholder="https://"
                  onChange={(e) => update(i, { url: e.target.value })}
                  className={inputClass}
                />
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
        {rows.length === 0 && <p className="text-text-secondary text-sm">No hay videos todavía.</p>}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button variant="ghost" onClick={() => setRows([...rows, { key: nextKey++, title: "", url: "" }])}>
          <Plus size={16} aria-hidden /> Agregar video
        </Button>
        <Button
          disabled={state.kind === "saving"}
          onClick={() => run("/api/videos", json("PUT", { videos: rows.map(({ title, url }) => ({ title, url })) }))}
        >
          {state.kind === "saving" ? "Guardando..." : "Guardar videos"}
        </Button>
        <StatusText state={state} />
      </div>
    </Card>
  );
}
