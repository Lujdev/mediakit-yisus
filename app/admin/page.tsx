"use client";

import { useCallback, useEffect, useState } from "react";
import { Film, Image as ImageIcon, Lock, Mail, Share2, Tag, TrendingUp } from "lucide-react";
import { AuthLostContext, Button, inputClass } from "./ui";
import MetricsPanel from "./panels/MetricsPanel";
import BrandsPanel from "./panels/BrandsPanel";
import PackagesPanel from "./panels/PackagesPanel";
import SocialPanel from "./panels/SocialPanel";
import VideosPanel from "./panels/VideosPanel";
import ContactsPanel from "./panels/ContactsPanel";

const TABS = [
  { id: "metrics", label: "Métricas", icon: TrendingUp, Panel: MetricsPanel },
  { id: "brands", label: "Marcas", icon: ImageIcon, Panel: BrandsPanel },
  { id: "packages", label: "Tarifas", icon: Tag, Panel: PackagesPanel },
  { id: "social", label: "Redes", icon: Share2, Panel: SocialPanel },
  { id: "videos", label: "Videos", icon: Film, Panel: VideosPanel },
  { id: "contacts", label: "Contactos", icon: Mail, Panel: ContactsPanel },
] as const;

type TabId = (typeof TABS)[number]["id"];

function Login({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) onSuccess();
      else setError("Contraseña incorrecta");
    } catch {
      setError("Sin conexión. Intenta de nuevo.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
      <form onSubmit={submit} className="glass rounded-2xl p-8 w-full max-w-md space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <Lock className="text-accent-lime" size={24} aria-hidden />
          <h1 className="font-display text-3xl text-text-primary">Admin Yisus</h1>
        </div>
        <label className="block">
          <span className="block text-text-secondary text-sm mb-2">Contraseña</span>
          <input
            type="password"
            autoComplete="current-password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </label>
        {error && <p role="alert" className="text-red-300 text-sm">{error}</p>}
        <Button type="submit" disabled={busy || !password} className="w-full">
          {busy ? "Entrando..." : "Entrar"}
        </Button>
      </form>
    </div>
  );
}

export default function AdminPage() {
  const [auth, setAuth] = useState<"checking" | "in" | "out">("checking");
  const [tab, setTab] = useState<TabId>("metrics");

  useEffect(() => {
    fetch("/api/admin/session", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setAuth(d.authenticated ? "in" : "out"))
      .catch(() => setAuth("out"));
  }, []);

  const authLost = useCallback(() => setAuth("out"), []);
  const logout = async () => {
    await fetch("/api/admin/session", { method: "DELETE" }).catch(() => {});
    setAuth("out");
  };

  if (auth === "checking") return <div className="min-h-screen bg-bg-primary" />;
  if (auth === "out") return <Login onSuccess={() => setAuth("in")} />;

  const Active = TABS.find((t) => t.id === tab)!.Panel;

  return (
    <AuthLostContext.Provider value={authLost}>
      <div className="min-h-screen bg-bg-primary py-8 md:py-12 px-4">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-display text-4xl text-text-primary">Dashboard</h1>
            <Button variant="ghost" onClick={logout}>Cerrar sesión</Button>
          </div>

          <div role="tablist" aria-label="Secciones del admin" className="flex gap-2 mb-6 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                role="tab"
                aria-selected={tab === id}
                onClick={() => setTab(id)}
                className={`flex min-h-11 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-medium transition-colors cursor-pointer ${
                  tab === id ? "bg-accent-lime text-bg-primary" : "bg-bg-secondary text-text-secondary hover:text-text-primary"
                }`}
              >
                <Icon size={16} aria-hidden /> {label}
              </button>
            ))}
          </div>

          <Active />
        </div>
      </div>
    </AuthLostContext.Provider>
  );
}
