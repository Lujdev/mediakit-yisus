"use client";

import { useContext, useEffect, useState } from "react";
import { AuthLostContext, PanelHeader } from "../ui";

type Contact = {
  id: number;
  name: string;
  email: string;
  brand: string | null;
  message: string;
  created_at: string;
};

export default function ContactsPanel() {
  const authLost = useContext(AuthLostContext);
  const [contacts, setContacts] = useState<Contact[] | null>(null);

  useEffect(() => {
    fetch("/api/contact", { cache: "no-store" }).then(async (r) => {
      if (r.status === 401) return authLost();
      const data = await r.json().catch(() => []);
      setContacts(Array.isArray(data) ? data : []);
    });
  }, [authLost]);

  return (
    <div>
      <PanelHeader title="Contactos" description="Mensajes recibidos desde el formulario del sitio." />
      {contacts === null ? (
        <p className="text-sm text-text-secondary">Cargando...</p>
      ) : contacts.length === 0 ? (
        <p className="rounded-xl border border-line/10 py-10 text-center text-sm text-text-secondary">
          Todavía no hay mensajes.
        </p>
      ) : (
        <ul className="rounded-xl border border-line/10 px-4 md:px-6">
          {contacts.map((c) => (
            <li key={c.id} className="border-t border-line/10 py-5 first:border-t-0">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <p className="font-semibold text-text-primary">{c.name}</p>
                <p className="font-mono text-[11px] text-text-secondary">{new Date(c.created_at).toLocaleString()}</p>
              </div>
              <a href={`mailto:${c.email}`} className="text-sm text-accent-ink hover:underline">{c.email}</a>
              {c.brand && <p className="mt-1 text-sm text-text-secondary">{c.brand}</p>}
              <p className="mt-2 whitespace-pre-line text-sm text-text-secondary">{c.message}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
