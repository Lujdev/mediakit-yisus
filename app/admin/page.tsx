"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ArrowUpRight, Film, Image as ImageIcon, Mail, Share2, Tag, TrendingUp, Users, type LucideIcon } from "lucide-react";
import { AuthLostContext, Button, inputClass } from "./ui";
import MetricsPanel from "./panels/MetricsPanel";
import BrandsPanel from "./panels/BrandsPanel";
import PackagesPanel from "./panels/PackagesPanel";
import SocialPanel from "./panels/SocialPanel";
import VideosPanel from "./panels/VideosPanel";
import ContactsPanel from "./panels/ContactsPanel";
import VisitsPanel from "./panels/VisitsPanel";

const TABS: { id: string; label: string; icon: LucideIcon; Panel: () => React.ReactElement }[] = [
  { id: "metrics", label: "Métricas", icon: TrendingUp, Panel: MetricsPanel },
  { id: "visits", label: "Visitas", icon: Users, Panel: VisitsPanel },
  { id: "brands", label: "Marcas", icon: ImageIcon, Panel: BrandsPanel },
  { id: "packages", label: "Tarifas", icon: Tag, Panel: PackagesPanel },
  { id: "videos", label: "Videos", icon: Film, Panel: VideosPanel },
  { id: "social", label: "Redes", icon: Share2, Panel: SocialPanel },
  { id: "contacts", label: "Mensajes", icon: Mail, Panel: ContactsPanel },
];

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
    <div data-theme="dark" className="flex min-h-screen items-center justify-center bg-bg-primary px-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-5">
        <Image src="/logo-yc.png" alt="Yisus Contreras" width={588} height={480} className="mx-auto h-20 w-auto" priority />
        <p className="text-center font-mono text-xs uppercase tracking-widest text-text-secondary">Panel</p>
        <label className="block">
          <span className="sr-only">Contraseña</span>
          <input
            type="password"
            autoComplete="current-password"
            autoFocus
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </label>
        {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
        <Button type="submit" disabled={busy || !password} className="w-full">
          {busy ? "Entrando..." : "Entrar"}
        </Button>
      </form>
    </div>
  );
}

export default function AdminPage() {
  const [auth, setAuth] = useState<"checking" | "in" | "out">("checking");
  const [tab, setTab] = useState(TABS[0].id);

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
      <div data-theme="dark" className="min-h-screen bg-bg-primary text-text-primary">
        <header className="sticky top-0 z-20 border-b border-line/10 bg-bg-primary/90 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <Image src="/logo-yc.png" alt="Yisus Contreras" width={588} height={480} className="h-9 w-auto" />
              <span className="font-mono text-xs uppercase tracking-widest text-text-secondary">Panel</span>
            </div>
            <div className="flex items-center gap-1">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-1 px-3 text-sm text-text-secondary transition-colors hover:text-accent-ink"
              >
                Ver sitio <ArrowUpRight size={14} aria-hidden />
              </a>
              <Button variant="ghost" onClick={logout}>Salir</Button>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-6xl px-4 py-6 lg:grid lg:grid-cols-[12rem_minmax(0,1fr)] lg:gap-14 lg:py-10">
          <nav
            role="tablist"
            aria-label="Secciones"
            aria-orientation="vertical"
            className="-mx-4 mb-6 flex gap-1 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:sticky lg:top-24 lg:mx-0 lg:mb-0 lg:flex-col lg:self-start lg:px-0"
          >
            {TABS.map(({ id, label, icon: Icon }) => {
              const active = tab === id;
              return (
                <button
                  key={id}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setTab(id)}
                  className={`flex min-h-11 shrink-0 cursor-pointer items-center gap-3 rounded-full px-4 text-sm font-medium transition-colors lg:rounded-lg ${
                    active ? "bg-line/10 text-text-primary" : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  <Icon size={16} aria-hidden className={active ? "text-accent-ink" : ""} />
                  {label}
                </button>
              );
            })}
          </nav>

          <main role="tabpanel" className="min-w-0">
            <Active />
          </main>
        </div>
      </div>
    </AuthLostContext.Provider>
  );
}
