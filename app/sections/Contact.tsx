"use client";

import { ArrowUpRight, Mail } from "lucide-react";
import { useState } from "react";
import { DEFAULT_SETTINGS } from "@/lib/settings-defaults";
import { useSiteData } from "../data/SiteData";
import { useLang } from "../i18n/LanguageProvider";
import Reveal from "../components/Reveal";
import SectionHeader from "../components/SectionHeader";
import { InstagramIcon, TikTokIcon, WhatsAppIcon } from "../components/SocialIcons";

/** Underline-only fields: lighter than boxed inputs and consistent with the ruled lists. */
const FIELD =
  "w-full min-h-11 bg-transparent border-0 border-b border-white/20 rounded-none px-0 py-3 text-text-primary placeholder:text-text-secondary/40 focus:border-accent-lime focus:outline-none transition-colors";

export default function Contact() {
  const { t } = useLang();
  const settings = useSiteData()?.settings ?? DEFAULT_SETTINGS;
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const whatsappHref = `https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(t.contact.waText)}`;
  const channels = [
    { name: "Instagram", label: settings.instagram_label, href: settings.instagram_url, Icon: InstagramIcon },
    { name: "TikTok", label: settings.tiktok_label, href: settings.tiktok_url, Icon: TikTokIcon },
    { name: "Email", label: settings.email, href: `mailto:${settings.email}`, Icon: Mail },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus("success");
        setForm({ name: "", email: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  const label = "block text-text-secondary text-xs tracking-wider uppercase";

  return (
    <section id="contact" className="relative py-16 md:py-36 px-4">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          index="07"
          eyebrow={t.contact.eyebrow}
          title={t.contact.title}
          accentLine={1}
          description={t.contact.description}
        />

        <div className="grid grid-cols-1 gap-14 lg:grid-cols-2 lg:gap-24">
          {/* Fastest way first */}
          <Reveal>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex min-h-20 items-center justify-between gap-4 rounded-full bg-accent-lime px-7 py-4 text-bg-primary transition-colors hover:bg-accent-orange cursor-pointer"
            >
              <span className="flex items-center gap-3 text-lg font-semibold md:text-xl">
                <WhatsAppIcon size={28} />
                {t.contact.whatsappCta}
              </span>
              <ArrowUpRight
                size={24}
                aria-hidden
                className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
              />
            </a>

            <ul className="mt-10 border-b border-white/10">
              {channels.map(({ name, label: text, href, Icon }) => (
                <li key={name}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex min-h-16 items-center gap-4 border-t border-white/10 py-4 cursor-pointer"
                  >
                    <Icon size={22} className="shrink-0 text-text-secondary transition-colors group-hover:text-accent-lime" />
                    <span className="flex-1 text-lg text-text-primary transition-colors group-hover:text-accent-lime md:text-xl">
                      {text}
                    </span>
                    <ArrowUpRight
                      size={16}
                      aria-hidden
                      className="text-text-secondary opacity-0 -translate-x-1 transition-all group-hover:translate-x-0 group-hover:opacity-100"
                    />
                  </a>
                </li>
              ))}
            </ul>

            <details className="group mt-6 text-sm text-text-secondary">
              <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 font-mono text-xs tracking-widest uppercase hover:text-text-primary">
                <span aria-hidden className="transition-transform group-open:rotate-45">
                  +
                </span>
                {t.contact.termsTitle}
              </summary>
              <ol className="mt-2 space-y-2">
                {t.contact.important.map((item, i) => (
                  <li key={item} className="flex gap-3">
                    <span aria-hidden className="pt-0.5 font-mono text-xs text-accent-lime">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {item}
                  </li>
                ))}
              </ol>
            </details>
          </Reveal>

          {/* Short form: three fields */}
          <Reveal delay={0.1}>
            <p className="mb-6 font-display text-3xl tracking-wide text-text-primary md:text-4xl">{t.contact.orForm}</p>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="f-name" className={label}>
                  {t.contact.name}
                </label>
                <input
                  id="f-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={FIELD}
                  placeholder={t.contact.namePh}
                />
              </div>
              <div>
                <label htmlFor="f-email" className={label}>
                  {t.contact.email}
                </label>
                <input
                  id="f-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={FIELD}
                  placeholder={t.contact.emailPh}
                />
              </div>
              <div>
                <label htmlFor="f-message" className={label}>
                  {t.contact.message}
                </label>
                <textarea
                  id="f-message"
                  name="message"
                  required
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className={`${FIELD} resize-none`}
                  placeholder={t.contact.messagePh}
                />
              </div>

              <button
                type="submit"
                disabled={status === "sending"}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-text-primary/40 px-8 font-semibold text-text-primary transition-colors hover:border-accent-lime hover:text-accent-lime disabled:opacity-50 md:w-auto cursor-pointer"
              >
                {status === "sending" ? t.contact.sending : t.contact.submit}
                <ArrowUpRight size={18} aria-hidden />
              </button>

              <div aria-live="polite">
                {status === "success" && <p className="text-sm text-accent-lime">{t.contact.success}</p>}
                {status === "error" && <p className="text-sm text-red-400">{t.contact.error}</p>}
              </div>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
