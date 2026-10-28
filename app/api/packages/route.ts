import { NextRequest, NextResponse } from "next/server";
import { db, initDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

type Incoming = {
  name?: unknown;
  price?: unknown;
  popular?: unknown;
  description?: { es?: unknown; en?: unknown };
  features?: { es?: unknown; en?: unknown };
};

const text = (v: unknown, max = 300) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const list = (v: unknown) =>
  Array.isArray(v) ? v.map((x) => text(x, 160)).filter(Boolean).slice(0, 12) : [];

/** Replaces the full list of packages: body { packages: [...] }. */
export async function PUT(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  try {
    await initDb();
    const body = await req.json();
    const items: Incoming[] = Array.isArray(body?.packages) ? body.packages : [];
    if (items.length > 12) return NextResponse.json({ error: "Demasiados paquetes" }, { status: 400 });

    const rows = items.map((p, i) => ({
      name: text(p.name, 60),
      price: text(p.price, 20),
      popular: p.popular ? 1 : 0,
      es: text(p.description?.es),
      en: text(p.description?.en),
      fes: list(p.features?.es),
      fen: list(p.features?.en),
      order: i,
    }));
    if (rows.some((r) => !r.name || !r.price)) {
      return NextResponse.json({ error: "Cada paquete necesita nombre y precio" }, { status: 400 });
    }

    await db.batch(
      [
        { sql: "DELETE FROM packages", args: [] },
        ...rows.map((r) => ({
          sql: `INSERT INTO packages
                (name, price, popular, description_es, description_en, features_es, features_en, display_order)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [r.name, r.price, r.popular, r.es, r.en, JSON.stringify(r.fes), JSON.stringify(r.fen), r.order],
        })),
      ],
      "write"
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT packages error:", error);
    return NextResponse.json({ error: "Error al guardar tarifas" }, { status: 500 });
  }
}
