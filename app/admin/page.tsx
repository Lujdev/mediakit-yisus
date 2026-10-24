"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, Save, TrendingUp, Mail, Film } from "lucide-react";

const ADMIN_PASSWORD = "yisus2026";

interface MetricField {
  value: string;
  label: string;
}

interface MetricsState {
  [platform: string]: Record<string, MetricField>;
  instagram: Record<string, MetricField>;
  tiktok: Record<string, MetricField>;
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [metrics, setMetrics] = useState<MetricsState>({
    instagram: {},
    tiktok: {},
  });
  const [contacts, setContacts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"metrics" | "contacts">("metrics");
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");

  useEffect(() => {
    if (authenticated) {
      fetch("/api/metrics")
        .then((r) => r.json())
        .then((data) => setMetrics(data));
      
      fetch("/api/contact")
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) setContacts(data);
        })
        .catch(() => {});
    }
  }, [authenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
    } else {
      alert("Contraseña incorrecta");
    }
  };

  const handleSave = async () => {
    setStatus("saving");
    
    // Update each metric individually
    for (const [platform, platformMetrics] of Object.entries(metrics)) {
      for (const [metricType, metricData] of Object.entries(platformMetrics as Record<string, MetricField>)) {
        await fetch("/api/metrics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            platform,
            metric_type: metricType,
            value: metricData.value,
            label: metricData.label,
          }),
        });
      }
    }
    
    setStatus("saved");
    setTimeout(() => setStatus("idle"), 2000);
  };

  const updateMetric = (platform: string, metricType: string, field: "value" | "label", newValue: string) => {
    setMetrics((prev) => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        [metricType]: {
          ...prev[platform][metricType],
          [field]: newValue,
        },
      },
    }));
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-8 w-full max-w-md"
        >
          <div className="flex items-center gap-3 mb-6">
            <Lock className="text-accent-lime" size={24} />
            <h1 className="font-display text-3xl text-text-primary">
              Admin Yisus
            </h1>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-text-secondary text-sm mb-2">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-bg-secondary border border-white/10 rounded-xl px-4 py-3 text-text-primary focus:border-accent-lime focus:outline-none"
                placeholder="••••••"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-accent-orange text-bg-primary font-semibold rounded-full hover:bg-accent-lime transition-colors"
            >
              Entrar
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary py-12 px-4">
      <div className="mx-auto max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <TrendingUp className="text-accent-lime" size={28} />
              <h1 className="font-display text-4xl text-text-primary">
                Dashboard
              </h1>
            </div>
            <button
              onClick={() => setAuthenticated(false)}
              className="text-text-secondary hover:text-accent-lime transition-colors text-sm"
            >
              Cerrar sesión
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setActiveTab("metrics")}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === "metrics"
                  ? "bg-accent-lime text-bg-primary"
                  : "bg-bg-secondary text-text-secondary hover:text-text-primary"
              }`}
            >
              <TrendingUp size={16} />
              Métricas
            </button>
            <button
              onClick={() => setActiveTab("contacts")}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === "contacts"
                  ? "bg-accent-lime text-bg-primary"
                  : "bg-bg-secondary text-text-secondary hover:text-text-primary"
              }`}
            >
              <Mail size={16} />
              Contactos ({contacts.length})
            </button>
          </div>

          {activeTab === "metrics" && (
            <div className="space-y-8">
              {/* Instagram */}
              <div className="glass rounded-2xl p-6">
                <h2 className="font-display text-2xl text-text-primary mb-4">
                  Instagram
                </h2>
                <div className="space-y-4">
                  {Object.entries(metrics.instagram || {}).map(([key, data]) => (
                    <div key={key} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-text-secondary text-xs mb-1 uppercase tracking-wider">
                          {key} — Valor
                        </label>
                        <input
                          type="text"
                          value={data.value}
                          onChange={(e) => updateMetric("instagram", key, "value", e.target.value)}
                          className="w-full bg-bg-secondary border border-white/10 rounded-xl px-4 py-3 text-text-primary focus:border-accent-lime focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-text-secondary text-xs mb-1 uppercase tracking-wider">
                          {key} — Etiqueta
                        </label>
                        <input
                          type="text"
                          value={data.label}
                          onChange={(e) => updateMetric("instagram", key, "label", e.target.value)}
                          className="w-full bg-bg-secondary border border-white/10 rounded-xl px-4 py-3 text-text-primary focus:border-accent-lime focus:outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* TikTok */}
              <div className="glass rounded-2xl p-6">
                <h2 className="font-display text-2xl text-text-primary mb-4">
                  TikTok
                </h2>
                <div className="space-y-4">
                  {Object.entries(metrics.tiktok || {}).map(([key, data]) => (
                    <div key={key} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-text-secondary text-xs mb-1 uppercase tracking-wider">
                          {key} — Valor
                        </label>
                        <input
                          type="text"
                          value={data.value}
                          onChange={(e) => updateMetric("tiktok", key, "value", e.target.value)}
                          className="w-full bg-bg-secondary border border-white/10 rounded-xl px-4 py-3 text-text-primary focus:border-accent-lime focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-text-secondary text-xs mb-1 uppercase tracking-wider">
                          {key} — Etiqueta
                        </label>
                        <input
                          type="text"
                          value={data.label}
                          onChange={(e) => updateMetric("tiktok", key, "label", e.target.value)}
                          className="w-full bg-bg-secondary border border-white/10 rounded-xl px-4 py-3 text-text-primary focus:border-accent-lime focus:outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={status === "saving"}
                className="inline-flex items-center gap-2 px-8 py-3 bg-accent-orange text-bg-primary font-semibold rounded-full hover:bg-accent-lime transition-colors disabled:opacity-50"
              >
                <Save size={18} />
                {status === "saved"
                  ? "¡Guardado!"
                  : status === "saving"
                  ? "Guardando..."
                  : "Guardar métricas"}
              </button>
            </div>
          )}

          {activeTab === "contacts" && (
            <div className="space-y-4">
              {contacts.length === 0 ? (
                <div className="glass rounded-2xl p-8 text-center text-text-secondary">
                  No hay mensajes de contacto aún.
                </div>
              ) : (
                contacts.map((contact: any) => (
                  <div key={contact.id} className="glass rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-text-primary">{contact.name}</span>
                      <span className="text-text-secondary text-xs">{contact.email}</span>
                    </div>
                    {contact.brand && (
                      <p className="text-accent-lime text-sm mb-1">{contact.brand}</p>
                    )}
                    <p className="text-text-secondary text-sm">{contact.message}</p>
                    <p className="text-text-secondary text-xs mt-2">
                      {new Date(contact.created_at).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
