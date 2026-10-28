"use client";

import { ChevronDown } from "lucide-react";
import { createContext, useCallback, useContext, useId, useState, type ReactNode } from "react";

/** Called by panels when the API answers 401 so the shell can show the login again. */
export const AuthLostContext = createContext<() => void>(() => {});

export const inputClass =
  "w-full min-h-11 rounded-lg bg-bg-secondary border border-line/10 px-3.5 py-2.5 text-text-primary placeholder:text-text-secondary/50 focus:border-accent-ink focus:outline-none transition-colors";

export function PanelHeader({ title, description }: { title: string; description?: string }) {
  return (
    <header className="mb-6 md:mb-8">
      <h2 className="font-display text-4xl md:text-5xl leading-none tracking-wide text-text-primary">{title}</h2>
      {description && <p className="mt-2 max-w-xl text-sm text-text-secondary">{description}</p>}
    </header>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-text-secondary">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-text-secondary/70">{hint}</span>}
    </label>
  );
}

/** Plain bordered group; no glass or shadows. */
export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-line/10 bg-bg-secondary/40 p-4 md:p-6 ${className}`}>{children}</div>;
}

/** A row that opens to reveal its form: keeps long lists short and scannable. */
export function Disclosure({
  summary,
  children,
  defaultOpen = false,
}: {
  summary: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-line/10 first:border-t-0">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="flex min-h-16 w-full cursor-pointer items-center gap-4 px-1 py-3 text-left transition-colors hover:text-accent-ink"
      >
        <span className="min-w-0 flex-1">{summary}</span>
        <ChevronDown
          size={18}
          aria-hidden
          className={`shrink-0 text-text-secondary transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="px-1 pb-6 pt-1">{children}</div>}
    </div>
  );
}

/**
 * File chooser with a styled button and a truncated file name. The native control renders its own wide
 * "No file chosen" text that overflows narrow cards, so the real input stays visually hidden.
 * Remount it with a new `key` to clear the selection.
 */
export function FilePicker({
  accept,
  file,
  onFile,
  disabled,
  label = "Elegir archivo",
  showName = true,
}: {
  accept: string;
  file: File | null;
  onFile: (file: File | null) => void;
  disabled?: boolean;
  label?: string;
  showName?: boolean;
}) {
  const id = useId();
  return (
    <div className="flex min-w-0 max-w-full items-center gap-3">
      <input
        id={id}
        type="file"
        accept={accept}
        disabled={disabled}
        onChange={(e) => onFile(e.target.files?.[0] ?? null)}
        className="peer sr-only"
      />
      <label
        htmlFor={id}
        className="inline-flex min-h-11 shrink-0 cursor-pointer items-center rounded-full border border-line/15 px-5 text-sm font-semibold text-text-primary transition-colors hover:border-accent-ink hover:text-accent-ink peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent-ink peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
      >
        {label}
      </label>
      {showName && (
        <span className="min-w-0 flex-1 truncate text-sm text-text-secondary" title={file?.name}>
          {file ? file.name : "Ningún archivo"}
        </span>
      )}
    </div>
  );
}

export function Button({
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "danger" }) {
  const styles = {
    primary: "bg-accent-lime text-on-accent hover:bg-accent-orange",
    ghost: "border border-line/15 text-text-primary hover:border-accent-ink hover:text-accent-ink",
    danger: "text-red-300 hover:bg-red-500/10",
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
  if (state.kind === "saved") return <span role="status" className="text-sm text-accent-ink">Guardado ✓</span>;
  if (state.kind === "error") return <span role="alert" className="text-sm text-red-300">{state.message}</span>;
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
