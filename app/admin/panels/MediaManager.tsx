"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import type { MediaItem } from "@/lib/site-data";
import { compressImage } from "../image";
import { Button, Disclosure, Field, StatusText, inputClass, json, move, useAdminRequest } from "../ui";

export const FILE_INPUT =
  "block text-sm text-text-secondary file:mr-3 file:min-h-11 file:cursor-pointer file:rounded-full file:border-0 file:bg-line/10 file:px-4 file:text-text-primary";

const CATEGORIES = ["Outfit", "Moda", "Lifestyle", "Portrait", "Editorial"];
const CATEGORY_NAMES: Record<string, string> = {
  Outfit: "Outfit", Moda: "Moda", Lifestyle: "Lifestyle", Portrait: "Retrato", Editorial: "Editorial",
};
const FOCALS = [
  { label: "Arriba (rostros)", value: "50% 20%" },
  { label: "Centro", value: "50% 50%" },
  { label: "Abajo", value: "50% 80%" },
];

function Thumb({ src, alt }: { src: string; alt: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className="h-14 w-11 shrink-0 rounded-md object-cover" />
  );
}

/** Adds a photo from a file input: compress first, then POST. Returns an error message or null. */
async function upload(file: File, fields: Record<string, string>): Promise<{ ok: boolean; error?: string }> {
  try {
    const small = await compressImage(file);
    const form = new FormData();
    Object.entries(fields).forEach(([k, v]) => form.set(k, v));
    form.set("file", small);
    const res = await fetch("/api/media", { method: "POST", body: form });
    if (res.ok) return { ok: true };
    const body = await res.json().catch(() => ({}));
    return { ok: false, error: body.error ?? "No se pudo subir la foto" };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "No se pudo subir la foto" };
  }
}

function Row({
  item,
  index,
  count,
  gallery,
  onMove,
  onChanged,
}: {
  item: MediaItem;
  index: number;
  count: number;
  gallery: boolean;
  onMove: (to: number) => void;
  onChanged: () => void;
}) {
  const [category, setCategory] = useState(item.category ?? "Outfit");
  const [focal, setFocal] = useState(item.focal);
  const [altEs, setAltEs] = useState(item.alt.es);
  const [altEn, setAltEn] = useState(item.alt.en);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const { state, run } = useAdminRequest();

  const save = async () => {
    setFileError("");
    const form = new FormData();
    form.set("alt_es", altEs);
    form.set("alt_en", altEn);
    if (gallery) {
      form.set("category", category);
      form.set("focal", focal);
    }
    if (file) {
      try {
        form.set("file", await compressImage(file));
      } catch (err) {
        return setFileError(err instanceof Error ? err.message : "Imagen no válida");
      }
    }
    if (await run(`/api/media/${item.id}`, { method: "PUT", body: form })) {
      setFile(null);
      onChanged();
    }
  };

  const remove = async () => {
    if (!window.confirm("¿Eliminar esta foto?")) return;
    if (await run(`/api/media/${item.id}`, { method: "DELETE" })) onChanged();
  };

  const focalKnown = FOCALS.some((f) => f.value === focal);

  return (
    <Disclosure
      summary={
        <span className="flex items-center gap-4">
          <Thumb src={item.src} alt={item.alt.es} />
          <span className="min-w-0">
            {gallery && <span className="block font-display text-xl tracking-wide text-text-primary">{CATEGORY_NAMES[category] ?? category}</span>}
            <span className="block truncate text-sm text-text-secondary">{altEs || "Sin descripción"}</span>
          </span>
        </span>
      }
    >
      <div className="space-y-4">
        {gallery && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Categoría">
              <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{CATEGORY_NAMES[c]}</option>
                ))}
              </select>
            </Field>
            <Field label="Encuadre cuando se recorta" hint="Elige dónde está la cara para que no se corte.">
              <select value={focal} onChange={(e) => setFocal(e.target.value)} className={inputClass}>
                {!focalKnown && <option value={focal}>Actual ({focal})</option>}
                {FOCALS.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </Field>
          </div>
        )}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label={gallery ? "Descripción de la foto (ES)" : "Título (ES)"} hint={gallery ? "Se lee en voz alta a quien usa lector de pantalla." : undefined}>
            <input value={altEs} onChange={(e) => setAltEs(e.target.value)} className={inputClass} />
          </Field>
          <Field label={gallery ? "Photo description (EN)" : "Title (EN)"}>
            <input value={altEn} onChange={(e) => setAltEn(e.target.value)} className={inputClass} />
          </Field>
        </div>
        <Field label="Reemplazar la imagen" hint="JPG, PNG o WebP. Se ajusta sola al tamaño correcto.">
          <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className={FILE_INPUT} />
        </Field>
        {fileError && <p role="alert" className="text-sm text-red-300">{fileError}</p>}
        <div className="flex flex-wrap items-center gap-2">
          <Button disabled={state.kind === "saving"} onClick={save}>Guardar</Button>
          <Button variant="ghost" aria-label="Subir en la lista" disabled={index === 0} onClick={() => onMove(index - 1)}>
            <ArrowUp size={16} aria-hidden />
          </Button>
          <Button variant="ghost" aria-label="Bajar en la lista" disabled={index === count - 1} onClick={() => onMove(index + 1)}>
            <ArrowDown size={16} aria-hidden />
          </Button>
          <Button variant="danger" onClick={remove}><Trash2 size={16} aria-hidden /> Eliminar</Button>
          <StatusText state={state} />
        </div>
      </div>
    </Disclosure>
  );
}

/**
 * List of photos with add / edit / replace / delete / reorder.
 * kind "gallery" has category + framing; kind "shot" (analytics screenshots) only has a title.
 */
export default function MediaManager({
  kind,
  groupKey,
  items,
  onChanged,
}: {
  kind: "gallery" | "shot";
  groupKey?: string;
  items: MediaItem[];
  onChanged: () => void;
}) {
  const gallery = kind === "gallery";
  const [list, setList] = useState(items);
  const [prev, setPrev] = useState(items);
  const [adding, setAdding] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState("Outfit");
  const [altEs, setAltEs] = useState("");
  const [altEn, setAltEn] = useState("");
  const [fileKey, setFileKey] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const { run } = useAdminRequest();

  // Keep the local order in step with fresh data from the server.
  if (items !== prev) {
    setPrev(items);
    setList(items);
  }

  const add = async () => {
    if (!file) return;
    setBusy(true);
    setError("");
    const result = await upload(file, {
      kind,
      ...(groupKey ? { group_key: groupKey } : {}),
      ...(gallery ? { category } : {}),
      alt_es: altEs,
      alt_en: altEn,
    });
    setBusy(false);
    if (!result.ok) return setError(result.error ?? "No se pudo subir");
    setFile(null);
    setAltEs("");
    setAltEn("");
    setFileKey((k) => k + 1);
    setAdding(false);
    onChanged();
  };

  const reorder = async (from: number, to: number) => {
    const next = move(list, from, to);
    setList(next);
    await run("/api/media", json("PUT", { order: next.map((m) => m.id) }));
  };

  return (
    <div>
      <div className="mb-4">
        {adding ? (
          <div className="space-y-4 rounded-xl border border-accent-ink/40 p-4 md:p-5">
            <Field label="Foto">
              <input key={fileKey} type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className={FILE_INPUT} />
            </Field>
            {gallery && (
              <Field label="Categoría">
                <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{CATEGORY_NAMES[c]}</option>
                  ))}
                </select>
              </Field>
            )}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label={gallery ? "Descripción (ES)" : "Título (ES)"}>
                <input value={altEs} onChange={(e) => setAltEs(e.target.value)} className={inputClass} />
              </Field>
              <Field label={gallery ? "Description (EN)" : "Title (EN)"}>
                <input value={altEn} onChange={(e) => setAltEn(e.target.value)} className={inputClass} />
              </Field>
            </div>
            {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
            <div className="flex flex-wrap items-center gap-2">
              <Button disabled={!file || busy} onClick={add}>{busy ? "Subiendo..." : "Agregar"}</Button>
              <Button variant="ghost" onClick={() => { setAdding(false); setError(""); }}>Cancelar</Button>
            </div>
          </div>
        ) : (
          <Button variant="ghost" onClick={() => setAdding(true)}>
            <Plus size={16} aria-hidden /> Agregar foto
          </Button>
        )}
      </div>

      <div className="rounded-xl border border-line/10 px-3 md:px-5">
        {list.map((item, i) => (
          <Row
            key={`${item.id}-${item.src}`}
            item={item}
            index={i}
            count={list.length}
            gallery={gallery}
            onMove={(to) => reorder(i, to)}
            onChanged={onChanged}
          />
        ))}
        {list.length === 0 && <p className="py-6 text-sm text-text-secondary">No hay fotos todavía.</p>}
      </div>
    </div>
  );
}
