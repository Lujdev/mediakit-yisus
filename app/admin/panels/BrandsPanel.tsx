"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import type { Brand } from "@/lib/site-data";
import { Button, Disclosure, Field, FilePicker, PanelHeader, StatusText, inputClass, json, move, useAdminRequest } from "../ui";

function LogoThumb({ src, name }: { src: string | null; name: string }) {
  return (
    <span className="flex h-12 w-20 shrink-0 items-center justify-center rounded-md bg-line/10 p-1.5">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className="max-h-full max-w-full object-contain" />
      ) : (
        <span className="text-[10px] text-text-secondary">sin logo</span>
      )}
    </span>
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
    <Disclosure
      summary={
        <span className="flex items-center gap-4">
          <LogoThumb src={brand.logo} name={brand.name} />
          <span className="truncate font-medium text-text-primary">{brand.name}</span>
        </span>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Nombre">
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Enlace (opcional)">
            <input type="url" value={url} placeholder="https://" onChange={(e) => setUrl(e.target.value)} className={inputClass} />
          </Field>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Field label={brand.logo ? "Reemplazar logo" : "Subir logo"}>
            <FilePicker accept="image/png,image/jpeg,image/webp" file={file} onFile={setFile} />
          </Field>
          {brand.logo && (
            <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm text-text-secondary">
              <input type="checkbox" checked={removeLogo} onChange={(e) => setRemoveLogo(e.target.checked)} className="h-5 w-5 accent-[#D4F23A]" />
              Quitar logo
            </label>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button disabled={state.kind === "saving"} onClick={save}>Guardar</Button>
          <Button variant="ghost" aria-label="Subir en la lista" disabled={index === 0} onClick={() => onMove(index - 1)}>
            <ArrowUp size={16} aria-hidden />
          </Button>
          <Button variant="ghost" aria-label="Bajar en la lista" disabled={index === count - 1} onClick={() => onMove(index + 1)}>
            <ArrowDown size={16} aria-hidden />
          </Button>
          <Button variant="danger" onClick={remove}>
            <Trash2 size={16} aria-hidden /> Eliminar
          </Button>
          <StatusText state={state} />
        </div>
      </div>
    </Disclosure>
  );
}

export default function BrandsPanel() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [adding, setAdding] = useState(false);
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
      setAdding(false);
      load();
    }
  };

  const reorder = async (from: number, to: number) => {
    const next = move(brands, from, to);
    setBrands(next);
    await run("/api/brands", json("PUT", { order: next.map((b) => b.id) }));
  };

  return (
    <div>
      <PanelHeader title="Marcas" description="Sube el logo en PNG, JPG o WebP. Si tiene fondo blanco, se elimina solo." />

      <div className="mb-6">
        {adding ? (
          <div className="space-y-4 rounded-xl border border-accent-ink/40 p-4 md:p-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Nombre">
                <input autoFocus value={newName} onChange={(e) => setNewName(e.target.value)} className={inputClass} />
              </Field>
              <Field label="Enlace (opcional)">
                <input type="url" value={newUrl} placeholder="https://" onChange={(e) => setNewUrl(e.target.value)} className={inputClass} />
              </Field>
            </div>
            <Field label="Logo">
              <FilePicker key={fileKey} accept="image/png,image/jpeg,image/webp" file={newFile} onFile={setNewFile} />
            </Field>
            <div className="flex flex-wrap items-center gap-2">
              <Button disabled={!newName.trim() || state.kind === "saving"} onClick={add}>Agregar</Button>
              <Button variant="ghost" onClick={() => setAdding(false)}>Cancelar</Button>
              <StatusText state={state} />
            </div>
          </div>
        ) : (
          <Button variant="ghost" onClick={() => setAdding(true)}>
            <Plus size={16} aria-hidden /> Agregar marca
          </Button>
        )}
      </div>

      <div className="rounded-xl border border-line/10 px-3 md:px-5">
        {brands.map((b, i) => (
          <BrandRow key={`${b.id}-${b.logo}`} brand={b} index={i} count={brands.length} onMove={(to) => reorder(i, to)} onChanged={load} />
        ))}
        {brands.length === 0 && <p className="py-6 text-sm text-text-secondary">No hay marcas todavía.</p>}
      </div>
    </div>
  );
}
