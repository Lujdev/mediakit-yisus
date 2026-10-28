"use client";

import { useContext, useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2, Upload } from "lucide-react";
import { AuthLostContext, Button, Card, Field, StatusText, inputClass, json, move, useAdminRequest } from "../ui";

type Row = { key: number; title: string; url: string };
let nextKey = 1;

const MAX_BYTES = 100 * 1024 * 1024;

/** Optimised delivery URL: mp4 + automatic quality, from Cloudinary's original upload URL. */
function deliveryUrl(secureUrl: string) {
  return secureUrl.replace("/upload/", "/upload/f_mp4,q_auto/").replace(/\.\w+$/, ".mp4");
}

function uploadToCloudinary(
  file: File,
  sig: { cloudName: string; apiKey: string; timestamp: number; signature: string; folder: string },
  onProgress: (pct: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.set("file", file);
    form.set("api_key", sig.apiKey);
    form.set("timestamp", String(sig.timestamp));
    form.set("signature", sig.signature);
    form.set("folder", sig.folder);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${sig.cloudName}/video/upload`);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => {
      try {
        const body = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && body.secure_url) resolve(body.secure_url);
        else reject(new Error(body?.error?.message ?? "Cloudinary rechazó el archivo"));
      } catch {
        reject(new Error("Respuesta inválida de Cloudinary"));
      }
    };
    xhr.onerror = () => reject(new Error("Falló la subida. Revisa tu conexión."));
    xhr.send(form);
  });
}

export default function VideosPanel() {
  const [rows, setRows] = useState<Row[]>([]);
  const { state, run } = useAdminRequest();
  const authLost = useContext(AuthLostContext);
  const [progress, setProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [uploaded, setUploaded] = useState(false);
  const [fileKey, setFileKey] = useState(0);

  const upload = async (file: File) => {
    setUploadError("");
    setUploaded(false);
    if (!file.type.startsWith("video/")) return setUploadError("El archivo debe ser un video.");
    if (file.size > MAX_BYTES) return setUploadError("El video supera 100 MB.");
    setProgress(0);
    try {
      const res = await fetch("/api/videos/sign", { method: "POST" });
      if (res.status === 401) return authLost();
      const sig = await res.json();
      if (!res.ok) throw new Error(sig.error ?? "No se pudo preparar la subida");
      const url = await uploadToCloudinary(file, sig, setProgress);
      setRows((r) => [...r, { key: nextKey++, title: file.name.replace(/\.[^.]+$/, ""), url: deliveryUrl(url) }]);
      setUploaded(true);
      setFileKey((k) => k + 1);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Error al subir el video");
    } finally {
      setProgress(null);
    }
  };

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
        Sube un video (hasta 100 MB) o pega un enlace de YouTube (se reproduce en el sitio), TikTok o Instagram (abre en
        su app). Sin videos, la sección no se muestra.
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

      <div className="mt-6 rounded-xl border border-dashed border-white/15 p-3 md:p-4">
        <Field label="Subir video">
          <input
            key={fileKey}
            type="file"
            accept="video/*"
            disabled={progress !== null}
            onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
            className="block text-sm text-text-secondary file:mr-3 file:min-h-11 file:cursor-pointer file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:text-text-primary"
          />
        </Field>
        {progress !== null && (
          <div className="mt-3" role="status" aria-live="polite">
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full bg-accent-lime transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-1 flex items-center gap-1 text-xs text-text-secondary">
              <Upload size={12} aria-hidden /> Subiendo… {progress}%
            </p>
          </div>
        )}
        {uploaded && <p role="status" className="mt-3 text-sm text-accent-lime">Video subido. Pulsa “Guardar videos” para publicarlo.</p>}
        {uploadError && <p role="alert" className="mt-3 text-sm text-red-300">{uploadError}</p>}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
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
