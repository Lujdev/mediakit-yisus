"use client";

import { useCallback, useEffect, useState } from "react";
import type { SiteMedia } from "@/lib/site-data";
import { compressImage } from "../image";
import { Button, PanelHeader, StatusText, useAdminRequest } from "../ui";
import MediaManager, { FILE_INPUT } from "./MediaManager";

/** Hook shared by the photo panels: the current media from the public site data. */
export function useMedia() {
  const [media, setMedia] = useState<SiteMedia | null>(null);
  const load = useCallback(() => {
    fetch("/api/site", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => d.media && setMedia(d.media))
      .catch(() => {});
  }, []);
  useEffect(load, [load]);
  return { media, reload: load };
}

/** One single-photo slot (portada, sobre mí): preview, replace, or go back to the original. */
function Slot({
  kind,
  title,
  description,
  current,
  fallback,
  onChanged,
}: {
  kind: "hero" | "about";
  title: string;
  description: string;
  current: string | null;
  fallback: string;
  onChanged: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [fileKey, setFileKey] = useState(0);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { state, run } = useAdminRequest();
  const overrideId = current?.match(/^\/api\/media\/(\d+)/)?.[1];

  const save = async () => {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const form = new FormData();
      form.set("kind", kind);
      form.set("file", await compressImage(file));
      const res = await fetch("/api/media", { method: "POST", body: form });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "No se pudo subir la foto");
      }
      setFile(null);
      setFileKey((k) => k + 1);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo subir la foto");
    } finally {
      setBusy(false);
    }
  };

  const restore = async () => {
    if (overrideId && (await run(`/api/media/${overrideId}`, { method: "DELETE" }))) onChanged();
  };

  return (
    <section className="rounded-xl border border-line/10 p-4 md:p-5">
      <h3 className="font-display text-2xl tracking-wide text-text-primary">{title}</h3>
      <p className="mb-4 mt-1 text-sm text-text-secondary">{description}</p>
      <div className="flex flex-wrap items-start gap-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={current ?? fallback} alt={title} className="h-40 w-32 rounded-lg object-cover" />
        <div className="min-w-0 flex-1 space-y-3">
          <input key={fileKey} type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className={FILE_INPUT} />
          {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
          <div className="flex flex-wrap items-center gap-2">
            <Button disabled={!file || busy} onClick={save}>{busy ? "Subiendo..." : "Cambiar foto"}</Button>
            {overrideId && <Button variant="ghost" onClick={restore}>Volver a la original</Button>}
            <StatusText state={state} />
          </div>
        </div>
      </div>
    </section>
  );
}

export default function PhotosPanel() {
  const { media, reload } = useMedia();

  return (
    <div>
      <PanelHeader
        title="Fotos"
        description="Cambia las fotos del sitio. Se ajustan solas al tamaño correcto, y se les quita la ubicación y los datos de la cámara."
      />
      {!media ? (
        <p className="text-sm text-text-secondary">Cargando...</p>
      ) : (
        <div className="space-y-12">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Slot
              kind="hero"
              title="Portada"
              description="La imagen de fondo de la primera pantalla."
              current={media.hero}
              fallback="/images/0.jpg"
              onChanged={reload}
            />
            <Slot
              kind="about"
              title="Sobre mí"
              description="La foto grande junto a tu presentación."
              current={media.about}
              fallback="/images/1.jpeg"
              onChanged={reload}
            />
          </div>
          <section>
            <h3 className="mb-4 font-display text-3xl tracking-wide text-text-primary">Galería</h3>
            <MediaManager kind="gallery" items={media.gallery} onChanged={reload} />
          </section>
        </div>
      )}
    </div>
  );
}
