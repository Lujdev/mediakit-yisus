"use client";

import { useEffect, useState } from "react";
import { DEFAULT_SETTINGS } from "@/lib/settings-defaults";
import { Button, Field, PanelHeader, StatusText, inputClass, json, useAdminRequest } from "../ui";

/** "https://instagram.com/yisus_20/" -> "yisus_20" */
function handleFromUrl(url: string) {
  try {
    return new URL(url).pathname.split("/").filter(Boolean)[0]?.replace(/^@/, "") ?? "";
  } catch {
    return "";
  }
}

/** 584242717890 -> "+58 424 271 7890" (Venezuelan mobiles); anything else is shown as +digits. */
function formatPhone(digits: string) {
  return digits.length === 12
    ? `+${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`
    : `+${digits}`;
}

export default function SocialPanel() {
  const [instagram, setInstagram] = useState(handleFromUrl(DEFAULT_SETTINGS.instagram_url));
  const [tiktok, setTiktok] = useState(handleFromUrl(DEFAULT_SETTINGS.tiktok_url));
  const [email, setEmail] = useState(DEFAULT_SETTINGS.email);
  const [whatsapp, setWhatsapp] = useState(DEFAULT_SETTINGS.whatsapp);
  const { state, run } = useAdminRequest();

  useEffect(() => {
    fetch("/api/site", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        const s = d.settings;
        if (!s) return;
        setInstagram(handleFromUrl(s.instagram_url));
        setTiktok(handleFromUrl(s.tiktok_url));
        setEmail(s.email);
        setWhatsapp(s.whatsapp);
      })
      .catch(() => {});
  }, []);

  const clean = (v: string) => v.trim().replace(/^@/, "");
  const save = () => {
    const ig = clean(instagram);
    const tt = clean(tiktok);
    const wa = whatsapp.replace(/\D/g, "");
    return run(
      "/api/settings",
      json("PUT", {
        settings: {
          instagram_url: `https://instagram.com/${ig}`,
          instagram_label: `@${ig}`,
          tiktok_url: `https://tiktok.com/@${tt}`,
          tiktok_label: `@${tt}`,
          email: email.trim(),
          whatsapp: wa,
          whatsapp_label: formatPhone(wa),
        },
      })
    );
  };

  return (
    <div>
      <PanelHeader title="Redes y contacto" description="Solo tu usuario: los enlaces se arman solos." />
      <div className="grid max-w-xl grid-cols-1 gap-5">
        <Field label="Instagram" hint="Tu usuario, sin @">
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary">@</span>
            <input value={instagram} onChange={(e) => setInstagram(e.target.value)} className={`${inputClass} pl-8`} />
          </div>
        </Field>
        <Field label="TikTok" hint="Tu usuario, sin @">
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary">@</span>
            <input value={tiktok} onChange={(e) => setTiktok(e.target.value)} className={`${inputClass} pl-8`} />
          </div>
        </Field>
        <Field label="WhatsApp" hint="Con código de país, solo números. Ej: 584242717890">
          <input inputMode="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Email">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
        </Field>
      </div>
      <div className="mt-8 flex items-center gap-4">
        <Button disabled={state.kind === "saving"} onClick={save}>
          {state.kind === "saving" ? "Guardando..." : "Guardar"}
        </Button>
        <StatusText state={state} />
      </div>
    </div>
  );
}
