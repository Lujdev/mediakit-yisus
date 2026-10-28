"use client";

import { useLang } from "../i18n/LanguageProvider";
import SectionHeader from "../components/SectionHeader";
import { motion } from "framer-motion";
import { Mail, MessageCircle, Phone, Send } from "lucide-react";
import { useState } from "react";
import InstagramIcon from "../components/InstagramIcon";

const socialLinks = [
  {
    icon: InstagramIcon,
    label: "@yisus_20",
    href: "https://instagram.com/yisus_20",
  },
  {
    icon: MessageCircle,
    label: "@yisus_contreras",
    href: "https://tiktok.com/@yisus_contreras",
  },
  {
    icon: Mail,
    label: "jesusoneiver@gmail.com",
    href: "mailto:jesusoneiver@gmail.com",
  },
  {
    icon: Phone,
    label: "+58 424 271 7890",
    href: "https://wa.me/584242717890",
  },
];

export default function Contact() {
  const { t } = useLang();
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
          index="06"
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
                  <label htmlFor="f-name" className="block text-text-secondary text-sm mb-2">
                    {t.contact.name}
                  </label>
                  <input id="f-name" name="name"
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-bg-secondary border border-white/10 rounded-xl px-4 py-3 text-text-primary focus:border-accent-lime focus:outline-none transition-colors"
                    placeholder={t.contact.namePh}
                  />
                </div>
                <div>
                  <label htmlFor="f-email" className="block text-text-secondary text-sm mb-2">
                    {t.contact.email}
                  </label>
                  <input id="f-email" name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    className="w-full bg-bg-secondary border border-white/10 rounded-xl px-4 py-3 text-text-primary focus:border-accent-lime focus:outline-none transition-colors"
                    placeholder={t.contact.emailPh}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="f-brand" className="block text-text-secondary text-sm mb-2">
                    {t.contact.brand}
                  </label>
                  <input id="f-brand" name="brand"
                    type="text"
                    value={form.brand}
                    onChange={(e) =>
                      setForm({ ...form, brand: e.target.value })
                    }
                    className="w-full bg-bg-secondary border border-white/10 rounded-xl px-4 py-3 text-text-primary focus:border-accent-lime focus:outline-none transition-colors"
                    placeholder={t.contact.brandPh}
                  />
                </div>
                <div>
                  <label htmlFor="f-service" className="block text-text-secondary text-sm mb-2">
                    {t.contact.service}
                  </label>
                  <select id="f-service" name="service"
                    value={form.service}
                    onChange={(e) =>
                      setForm({ ...form, service: e.target.value })
                    }
                    className="w-full bg-bg-secondary border border-white/10 rounded-xl px-4 py-3 text-text-primary focus:border-accent-lime focus:outline-none transition-colors"
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
                <label htmlFor="f-message" className="block text-text-secondary text-sm mb-2">
                  {t.contact.message}
                </label>
                <textarea id="f-message" name="message"
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) =>
                    setForm({ ...form, message: e.target.value })
                  }
                  className="w-full bg-bg-secondary border border-white/10 rounded-xl px-4 py-3 text-text-primary focus:border-accent-lime focus:outline-none transition-colors resize-none"
                  placeholder={t.contact.messagePh}
                />
              </div>

              <button
                type="submit"
                disabled={status === "sending"}
                className="inline-flex items-center justify-center gap-2 w-full md:w-auto px-8 py-3 bg-accent-orange text-bg-primary font-semibold rounded-full hover:bg-accent-lime transition-colors duration-300 disabled:opacity-50"
              >
                <Send size={18} />
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
              <div className="space-y-4">
                {socialLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 glass rounded-xl hover:border-accent-lime/30 transition-colors group"
                  >
                    <link.icon
                      className="text-accent-lime group-hover:scale-110 transition-transform"
                      size={24}
                    />
                    <span className="text-text-primary group-hover:text-accent-lime transition-colors">
                      {link.label}
                    </span>
                  </a>
                ))}
              </div>
            </div>

            <div className="glass rounded-xl p-6">
              <h4 className="font-semibold text-text-primary mb-3">
                {t.contact.importantTitle}
              </h4>
              <ul className="space-y-2 text-text-secondary text-sm">
                {t.contact.important.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
