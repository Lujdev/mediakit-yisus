"use client";

import { useLang } from "../i18n/LanguageProvider";
import { useSiteData } from "../data/SiteData";
import { DEFAULT_SETTINGS } from "@/lib/settings-defaults";
import SectionHeader from "../components/SectionHeader";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useState } from "react";


/** Underline-only fields: lighter than boxed inputs and consistent with the ruled lists. */
const FIELD =
  "w-full min-h-11 bg-transparent border-0 border-b border-white/20 rounded-none px-0 py-3 text-text-primary placeholder:text-text-secondary/40 focus:border-accent-lime focus:outline-none transition-colors [color-scheme:dark]";

export default function Contact() {
  const { t } = useLang();
  const settings = useSiteData()?.settings ?? DEFAULT_SETTINGS;
  const socialLinks = [
    { name: "Instagram", label: settings.instagram_label, href: settings.instagram_url },
    { name: "TikTok", label: settings.tiktok_label, href: settings.tiktok_url },
    { name: "Email", label: settings.email, href: `mailto:${settings.email}` },
    { name: "WhatsApp", label: settings.whatsapp_label, href: `https://wa.me/${settings.whatsapp}` },
  ];
  const [form, setForm] = useState({
    name: "",
    email: "",
    brand: "",
    service: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

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
        setForm({ name: "", email: "", brand: "", service: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="f-name" className="block text-text-secondary text-xs tracking-wider uppercase">
                    {t.contact.name}
                  </label>
                  <input id="f-name" name="name"
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={FIELD}
                    placeholder={t.contact.namePh}
                  />
                </div>
                <div>
                  <label htmlFor="f-email" className="block text-text-secondary text-xs tracking-wider uppercase">
                    {t.contact.email}
                  </label>
                  <input id="f-email" name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    className={FIELD}
                    placeholder={t.contact.emailPh}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="f-brand" className="block text-text-secondary text-xs tracking-wider uppercase">
                    {t.contact.brand}
                  </label>
                  <input id="f-brand" name="brand"
                    type="text"
                    value={form.brand}
                    onChange={(e) =>
                      setForm({ ...form, brand: e.target.value })
                    }
                    className={FIELD}
                    placeholder={t.contact.brandPh}
                  />
                </div>
                <div>
                  <label htmlFor="f-service" className="block text-text-secondary text-xs tracking-wider uppercase">
                    {t.contact.service}
                  </label>
                  <select id="f-service" name="service"
                    value={form.service}
                    onChange={(e) =>
                      setForm({ ...form, service: e.target.value })
                    }
                    className={FIELD}
                  >
                    <option value="">{t.contact.select}</option>
                    {Object.entries(t.contact.services).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="f-message" className="block text-text-secondary text-xs tracking-wider uppercase">
                  {t.contact.message}
                </label>
                <textarea id="f-message" name="message"
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) =>
                    setForm({ ...form, message: e.target.value })
                  }
                  className={`${FIELD} resize-none`}
                  placeholder={t.contact.messagePh}
                />
              </div>

              <button
                type="submit"
                disabled={status === "sending"}
                className="inline-flex min-h-12 items-center justify-center gap-2 w-full md:w-auto px-8 bg-accent-lime text-bg-primary font-semibold rounded-full hover:bg-accent-orange transition-colors duration-300 disabled:opacity-50 cursor-pointer"
              >
                {status === "sending"
                  ? t.contact.sending
                  : t.contact.submit}
              </button>

              {status === "success" && (
                <p className="text-accent-lime text-sm">
                  {t.contact.success}
                </p>
              )}
              {status === "error" && (
                <p className="text-red-400 text-sm">
                  {t.contact.error}
                </p>
              )}
            </form>
          </motion.div>

          {/* Contact info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div>
              <h3 className="font-display text-2xl text-text-primary mb-6">
                {t.contact.contactTitle}
              </h3>
              <ul className="border-b border-white/10">
                {socialLinks.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex min-h-16 items-baseline justify-between gap-4 border-t border-white/10 py-4 cursor-pointer"
                    >
                      <span className="font-mono text-xs tracking-widest uppercase text-text-secondary">
                        {link.name}
                      </span>
                      <span className="flex items-center gap-2 text-lg md:text-xl text-text-primary transition-colors group-hover:text-accent-lime">
                        {link.label}
                        <ArrowUpRight
                          size={16}
                          aria-hidden
                          className="opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0"
                        />
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-4 font-mono text-xs tracking-widest uppercase text-text-secondary">
                {t.contact.importantTitle}
              </h4>
              <ol className="space-y-3 text-sm md:text-base text-text-secondary">
                {t.contact.important.map((item, i) => (
                  <li key={item} className="flex gap-4">
                    <span aria-hidden className="font-mono text-xs pt-1 text-accent-lime">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {item}
                  </li>
                ))}
              </ol>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
