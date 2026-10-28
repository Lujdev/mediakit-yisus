"use client";

import { useEffect, useState } from "react";
import { DEFAULT_SETTINGS } from "@/lib/settings-defaults";
import { Button, Card, Field, StatusText, inputClass, json, useAdminRequest } from "../ui";

const FIELDS: { key: string; label: string; hint?: string; type?: string }[] = [
  { key: "instagram_url", label: "Instagram — enlace", hint: "https://instagram.com/tu_usuario", type: "url" },
  { key: "instagram_label", label: "Instagram — texto visible", hint: "@tu_usuario" },
  { key: "tiktok_url", label: "TikTok — enlace", hint: "https://tiktok.com/@tu_usuario", type: "url" },
  { key: "tiktok_label", label: "TikTok — texto visible", hint: "@tu_usuario" },
  { key: "email", label: "Email", type: "email" },
  { key: "whatsapp", label: "WhatsApp — número", hint: "Solo dígitos con código de país: 584242717890", type: "tel" },
  { key: "whatsapp_label", label: "WhatsApp — texto visible", hint: "+58 424 271 7890" },
];

export default function SocialPanel() {
  const [values, setValues] = useState<Record<string, string>>(DEFAULT_SETTINGS);
  const { state, run } = useAdminRequest();

  useEffect(() => {
    fetch("/api/site", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => d.settings && setValues(d.settings))
      .catch(() => {});
  }, []);

  return (
    <Card>
      <h2 className="font-display text-2xl text-text-primary mb-4">Redes y contacto</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {FIELDS.map((f) => (
          <Field key={f.key} label={f.label} hint={f.hint}>
            <input
              type={f.type ?? "text"}
              value={values[f.key] ?? ""}
              onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
              className={inputClass}
            />
          </Field>
        ))}
      </div>
      <div className="mt-6 flex items-center gap-4">
        <Button disabled={state.kind === "saving"} onClick={() => run("/api/settings", json("PUT", { settings: values }))}>
          {state.kind === "saving" ? "Guardando..." : "Guardar"}
        </Button>
        <StatusText state={state} />
      </div>
    </Card>
  );
}
