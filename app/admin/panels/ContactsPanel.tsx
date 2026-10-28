"use client";

import { useContext, useEffect, useState } from "react";
import { AuthLostContext, Card } from "../ui";

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

  if (contacts === null) return <p className="text-text-secondary text-sm">Cargando...</p>;
  if (contacts.length === 0) return <Card className="text-center text-text-secondary">No hay mensajes de contacto aún.</Card>;

  return (
    <div className="space-y-4">
      {contacts.map((c) => (
        <Card key={c.id}>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <span className="font-semibold text-text-primary">{c.name}</span>
            <a href={`mailto:${c.email}`} className="text-text-secondary text-xs hover:text-accent-lime">{c.email}</a>
          </div>
          {c.brand && <p className="text-accent-lime text-sm mb-1">{c.brand}</p>}
          <p className="text-text-secondary text-sm whitespace-pre-line">{c.message}</p>
          <p className="text-text-secondary/70 text-xs mt-2">{new Date(c.created_at).toLocaleString()}</p>
        </Card>
      ))}
    </div>
  );
}
