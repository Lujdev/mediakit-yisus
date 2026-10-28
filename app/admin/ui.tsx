"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

/** Called by panels when the API answers 401 so the shell can show the login again. */
export const AuthLostContext = createContext<() => void>(() => {});

export const inputClass =
  "w-full min-h-11 bg-bg-secondary border border-white/10 rounded-xl px-4 py-2.5 text-text-primary placeholder:text-text-secondary/50 focus:border-accent-lime focus:outline-none transition-colors";

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="block text-text-secondary text-xs mb-1 uppercase tracking-wider">{label}</span>
      {children}
      {hint && <span className="block text-text-secondary/70 text-xs mt-1">{hint}</span>}
    </label>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`glass rounded-2xl p-4 md:p-6 ${className}`}>{children}</div>;
}

export function Button({
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "danger" }) {
  const styles = {
    primary: "bg-accent-lime text-bg-primary hover:bg-accent-orange",
    ghost: "border border-white/15 text-text-primary hover:border-accent-lime hover:text-accent-lime",
    danger: "border border-red-400/40 text-red-300 hover:bg-red-500/10",
  }[variant];
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${styles} ${className}`}
    />
  );
}

export type SaveState = { kind: "idle" | "saving" | "saved" | "error"; message?: string };

export function StatusText({ state }: { state: SaveState }) {
  if (state.kind === "saved") return <span role="status" className="text-accent-lime text-sm">Guardado</span>;
  if (state.kind === "error") return <span role="alert" className="text-red-300 text-sm">{state.message}</span>;
  return null;
}

/** Wraps fetch for admin endpoints: handles 401, parses { error }, and tracks save status. */
export function useAdminRequest() {
  const authLost = useContext(AuthLostContext);
  const [state, setState] = useState<SaveState>({ kind: "idle" });

  const run = useCallback(
    async (url: string, init: RequestInit): Promise<boolean> => {
      setState({ kind: "saving" });
      try {
        const res = await fetch(url, init);
        if (res.status === 401) {
          authLost();
          return false;
        }
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          setState({ kind: "error", message: body.error ?? "No se pudo guardar" });
          return false;
        }
        setState({ kind: "saved" });
        setTimeout(() => setState({ kind: "idle" }), 2500);
        return true;
      } catch {
        setState({ kind: "error", message: "Sin conexión. Intenta de nuevo." });
        return false;
      }
    },
    [authLost]
  );

  return { state, run };
}

export function json(method: string, body: unknown): RequestInit {
  return { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) };
}

export function move<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}
