"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, Save, TrendingUp } from "lucide-react";

const ADMIN_PASSWORD = "yisus2026"; // En producción usar env var

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [metrics, setMetrics] = useState({
    instagram: { followers: "", views: "", newFollowers: "" },
    tiktok: { followers: "", views: "", likes: "" },
  });
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");

  useEffect(() => {
    if (authenticated) {
      fetch("/api/metrics")
        .then((r) => r.json())
        .then((data) => setMetrics(data));
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
    await fetch("/api/metrics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(metrics),
    });
    setStatus("saved");
    setTimeout(() => setStatus("idle"), 2000);
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
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
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

          <div className="space-y-8">
            {/* Instagram */}
            <div className="glass rounded-2xl p-6">
              <h2 className="font-display text-2xl text-text-primary mb-4">
                Instagram
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(metrics.instagram).map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-text-secondary text-sm mb-2 capitalize">
                      {key === "newFollowers" ? "Nuevos seguidores" : key}
                    </label>
                    <input
                      type="text"
                      value={value}
                      onChange={(e) =>
                        setMetrics({
                          ...metrics,
                          instagram: {
                            ...metrics.instagram,
                            [key]: e.target.value,
                          },
                        })
                      }
                      className="w-full bg-bg-secondary border border-white/10 rounded-xl px-4 py-3 text-text-primary focus:border-accent-lime focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* TikTok */}
            <div className="glass rounded-2xl p-6">
              <h2 className="font-display text-2xl text-text-primary mb-4">
                TikTok
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(metrics.tiktok).map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-text-secondary text-sm mb-2 capitalize">
                      {key === "likes" ? "Me gusta" : key}
                    </label>
                    <input
                      type="text"
                      value={value}
                      onChange={(e) =>
                        setMetrics({
                          ...metrics,
                          tiktok: {
                            ...metrics.tiktok,
                            [key]: e.target.value,
                          },
                        })
                      }
                      className="w-full bg-bg-secondary border border-white/10 rounded-xl px-4 py-3 text-text-primary focus:border-accent-lime focus:outline-none"
                    />
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
        </motion.div>
      </div>
    </div>
  );
}
