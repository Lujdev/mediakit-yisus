import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { db, initDb } from "@/lib/db";
import {
  GALLERY_CATEGORIES,
  MAX_UPLOAD_BYTES,
  MEDIA_KINDS,
  SHOT_PLATFORMS,
  cleanFocal,
  processPhoto,
} from "@/lib/media";

/** Creates a photo. multipart/form-data: kind, file, and (by kind) group_key, category, focal, alt_es, alt_en. */
export async function POST(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  try {
    await initDb();
    const form = await req.formData();
    const kind = String(form.get("kind") ?? "");
    if (!(MEDIA_KINDS as readonly string[]).includes(kind)) {
      return NextResponse.json({ error: "Tipo de foto inválido" }, { status: 400 });
    }

    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "Falta la imagen" }, { status: 400 });
    }
    if (file.size > MAX_UPLOAD_BYTES) return NextResponse.json({ error: "La imagen supera 4 MB" }, { status: 413 });

    let groupKey: string | null = null;
    if (kind === "shot") {
      groupKey = String(form.get("group_key") ?? "");
      if (!(SHOT_PLATFORMS as readonly string[]).includes(groupKey)) {
        return NextResponse.json({ error: "Plataforma inválida" }, { status: 400 });
      }
    }
    let category: string | null = null;
    if (kind === "gallery") {
      category = String(form.get("category") ?? "Outfit");
      if (!(GALLERY_CATEGORIES as readonly string[]).includes(category)) {
        return NextResponse.json({ error: "Categoría inválida" }, { status: 400 });
      }
    }

    let processed;
    try {
      processed = await processPhoto(Buffer.from(await file.arrayBuffer()));
    } catch {
      return NextResponse.json({ error: "Imagen no válida (usa JPG, PNG o WebP)" }, { status: 400 });
    }

    // Portada and "Sobre mí" hold a single photo: a new upload replaces the previous one.
    if (kind === "hero" || kind === "about") {
      await db.execute({ sql: "DELETE FROM media WHERE kind = ?", args: [kind] });
    }

    const order = await db.execute({
      sql: "SELECT COALESCE(MAX(display_order), -1) + 1 AS next FROM media WHERE kind = ? AND group_key IS ?",
      args: [kind, groupKey],
    });
    const text = (key: string) => String(form.get(key) ?? "").trim().slice(0, 300);
    const result = await db.execute({
      sql: `INSERT INTO media (kind, group_key, data, mime, version, category, focal, alt_es, alt_en, display_order)
            VALUES (?, ?, ?, ?, 1, ?, ?, ?, ?, ?)`,
      args: [
        kind,
        groupKey,
        processed.data,
        processed.mime,
        category,
        cleanFocal(form.get("focal")),
        text("alt_es"),
        text("alt_en"),
        Number(order.rows[0].next),
      ],
    });
    return NextResponse.json({ success: true, id: Number(result.lastInsertRowid) });
  } catch (error) {
    console.error("POST media error:", error);
    return NextResponse.json({ error: "Error al subir la foto" }, { status: 500 });
  }
}

/** Saves a new order for a list: body { order: number[] } of media ids. */
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
      (ids as number[]).map((id, i) => ({ sql: "UPDATE media SET display_order = ? WHERE id = ?", args: [i, id] })),
      "write"
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT media order error:", error);
    return NextResponse.json({ error: "Error al ordenar" }, { status: 500 });
  }
}
