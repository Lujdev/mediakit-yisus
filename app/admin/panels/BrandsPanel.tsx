"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import type { Brand } from "@/lib/site-data";
import { Button, Card, Field, StatusText, inputClass, json, move, useAdminRequest } from "../ui";

function LogoThumb({ src, name }: { src: string | null; name: string }) {
  return (
    <div className="flex h-16 w-28 shrink-0 items-center justify-center rounded-lg bg-white/10 p-2">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className="max-h-full max-w-full object-contain" />
      ) : (
        <span className="text-center text-[11px] text-text-secondary">Sin logo</span>
      )}
    </div>
  );
}

function BrandRow({
  brand,
  index,
  count,
  onMove,
  onChanged,
}: {
  brand: Brand;
  index: number;
  count: number;
  onMove: (to: number) => void;
  onChanged: () => void;
}) {
  const [name, setName] = useState(brand.name);
  const [url, setUrl] = useState(brand.url ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [removeLogo, setRemoveLogo] = useState(false);
  const { state, run } = useAdminRequest();

  const save = async () => {
    const form = new FormData();
    form.set("name", name);
    form.set("url", url);
    if (file) form.set("logo", file);
    if (removeLogo) form.set("removeLogo", "1");
    if (await run(`/api/brands/${brand.id}`, { method: "PUT", body: form })) {
      setFile(null);
      setRemoveLogo(false);
      onChanged();
    }
  };

  const remove = async () => {
    if (!window.confirm(`¿Eliminar la marca ${brand.name}?`)) return;
    if (await run(`/api/brands/${brand.id}`, { method: "DELETE" })) onChanged();
  };

  return (
    <div className="rounded-xl border border-white/10 p-3 md:p-4 space-y-3">
      <div className="flex gap-3">
        <LogoThumb src={brand.logo} name={brand.name} />
        <div className="grid flex-1 grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Nombre">
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Enlace (opcional)">
            <input type="url" value={url} placeholder="https://" onChange={(e) => setUrl(e.target.value)} className={inputClass} />
          </Field>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Field label={brand.logo ? "Reemplazar logo" : "Subir logo"}>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block text-sm text-text-secondary file:mr-3 file:min-h-11 file:cursor-pointer file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:text-text-primary"
          />
        </Field>
        {brand.logo && (
          <label className="flex min-h-11 items-center gap-2 text-sm text-text-secondary cursor-pointer">
            <input type="checkbox" checked={removeLogo} onChange={(e) => setRemoveLogo(e.target.checked)} className="h-5 w-5 accent-[#C8FF00]" />
            Quitar logo
          </label>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="ghost" aria-label="Subir" disabled={index === 0} onClick={() => onMove(index - 1)}>
          <ArrowUp size={16} aria-hidden />
        </Button>
        <Button variant="ghost" aria-label="Bajar" disabled={index === count - 1} onClick={() => onMove(index + 1)}>
          <ArrowDown size={16} aria-hidden />
        </Button>
        <Button disabled={state.kind === "saving"} onClick={save}>Guardar</Button>
        <Button variant="danger" onClick={remove}><Trash2 size={16} aria-hidden /> Eliminar</Button>
        <StatusText state={state} />
      </div>
    </div>
  );
}

export default function BrandsPanel() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newFile, setNewFile] = useState<File | null>(null);
  const [fileKey, setFileKey] = useState(0);
  const { state, run } = useAdminRequest();

  const load = useCallback(() => {
    fetch("/api/site", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setBrands(d.brands ?? []))
      .catch(() => {});
  }, []);
  useEffect(load, [load]);

  const add = async () => {
    const form = new FormData();
    form.set("name", newName);
    form.set("url", newUrl);
    if (newFile) form.set("logo", newFile);
    if (await run("/api/brands", { method: "POST", body: form })) {
      setNewName("");
      setNewUrl("");
      setNewFile(null);
      setFileKey((k) => k + 1);
      load();
    }
  };

  const reorder = async (from: number, to: number) => {
    const next = move(brands, from, to);
    setBrands(next);
    await run("/api/brands", json("PUT", { order: next.map((b) => b.id) }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="font-display text-2xl text-text-primary mb-1">Agregar marca</h2>
        <p className="text-text-secondary text-sm mb-4">
          Sube el logo en PNG, JPG o WebP (máx. 4 MB). Si tiene fondo blanco, se elimina automáticamente.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Nombre">
            <input value={newName} onChange={(e) => setNewName(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Enlace (opcional)">
            <input type="url" value={newUrl} placeholder="https://" onChange={(e) => setNewUrl(e.target.value)} className={inputClass} />
          </Field>
        </div>
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <Field label="Logo">
            <input
              key={fileKey}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => setNewFile(e.target.files?.[0] ?? null)}
              className="block text-sm text-text-secondary file:mr-3 file:min-h-11 file:cursor-pointer file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:text-text-primary"
            />
          </Field>
          <Button disabled={!newName.trim() || state.kind === "saving"} onClick={add}>
            <Plus size={16} aria-hidden /> Agregar
          </Button>
          <StatusText state={state} />
        </div>
      </Card>

      <Card>
        <h2 className="font-display text-2xl text-text-primary mb-4">Marcas ({brands.length})</h2>
        <div className="space-y-4">
          {brands.map((b, i) => (
            <BrandRow
              key={`${b.id}-${b.logo}`}
              brand={b}
              index={i}
              count={brands.length}
              onMove={(to) => reorder(i, to)}
              onChanged={load}
            />
          ))}
          {brands.length === 0 && <p className="text-text-secondary text-sm">No hay marcas todavía.</p>}
        </div>
      </Card>
    </div>
  );
}
