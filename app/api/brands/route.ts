import { NextRequest, NextResponse } from "next/server";
import { db, initDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { processLogo } from "@/lib/logo";
import { safeHttpUrl } from "@/lib/site-data";

const MAX_LOGO_BYTES = 4 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  try {
    await initDb();
    const form = await req.formData();
    const name = String(form.get("name") ?? "").trim();
    if (!name) return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 });

    const rawUrl = String(form.get("url") ?? "").trim();
    const url = rawUrl ? safeHttpUrl(rawUrl) : null;
    if (rawUrl && !url) return NextResponse.json({ error: "URL inválida" }, { status: 400 });

    let logo: Buffer | null = null;
    const file = form.get("logo");
    if (file instanceof File && file.size > 0) {
      if (file.size > MAX_LOGO_BYTES) {
        return NextResponse.json({ error: "El logo supera 4 MB" }, { status: 413 });
      }
      try {
        logo = await processLogo(Buffer.from(await file.arrayBuffer()));
      } catch {
        return NextResponse.json({ error: "Imagen no válida" }, { status: 400 });
      }
    }

    const order = await db.execute("SELECT COALESCE(MAX(display_order), -1) + 1 AS next FROM brands");
    const result = await db.execute({
      sql: "INSERT INTO brands (name, url, logo_data, logo_version, display_order) VALUES (?, ?, ?, ?, ?)",
      args: [name, url, logo, logo ? 1 : 0, Number(order.rows[0].next)],
    });
    return NextResponse.json({ success: true, id: Number(result.lastInsertRowid) });
  } catch (error) {
    if (String(error).includes("UNIQUE")) {
      return NextResponse.json({ error: "Ya existe una marca con ese nombre" }, { status: 409 });
    }
    console.error("POST brands error:", error);
    return NextResponse.json({ error: "Error al crear la marca" }, { status: 500 });
  }
}

/** Saves a new display order: body { order: number[] } of brand ids. */
export async function PUT(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  try {
    await initDb();
    const body = await req.json();
    const ids: unknown = body?.order;
    if (!Array.isArray(ids) || !ids.every((n) => Number.isInteger(n))) {
      return NextResponse.json({ error: "order inválido" }, { status: 400 });
    }
    await db.batch(
      (ids as number[]).map((id, i) => ({
        sql: "UPDATE brands SET display_order = ? WHERE id = ?",
        args: [i, id],
      })),
      "write"
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT brands error:", error);
    return NextResponse.json({ error: "Error al ordenar marcas" }, { status: 500 });
  }
}
