import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { db, initDb } from "@/lib/db";
import { GALLERY_CATEGORIES, MAX_UPLOAD_BYTES, cleanFocal, processPhoto } from "@/lib/media";

type Ctx = { params: Promise<{ id: string }> };

/** Public: serves an uploaded photo. The ?v= in the URL changes on every replacement, so it caches for a year. */
export async function GET(_req: NextRequest, { params }: Ctx) {
  await initDb();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) return new NextResponse(null, { status: 404 });
  const res = await db.execute({ sql: "SELECT data, mime FROM media WHERE id = ?", args: [id] });
  const row = res.rows[0];
  if (!row?.data) return new NextResponse(null, { status: 404 });
  return new NextResponse(new Uint8Array(row.data as ArrayBuffer), {
    headers: {
      "Content-Type": String(row.mime || "image/jpeg"),
      "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
    },
  });
}

/** Admin: edit fields and/or replace the image. multipart/form-data with optional `file`. */
export async function PUT(req: NextRequest, { params }: Ctx) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  try {
    await initDb();
    const id = Number((await params).id);
    if (!Number.isInteger(id)) return NextResponse.json({ error: "id inválido" }, { status: 400 });
    const form = await req.formData();

    const sets: string[] = [];
    const args: (string | number | Uint8Array | null)[] = [];

    const category = form.get("category");
    if (typeof category === "string" && category) {
      if (!(GALLERY_CATEGORIES as readonly string[]).includes(category)) {
        return NextResponse.json({ error: "Categoría inválida" }, { status: 400 });
      }
      sets.push("category = ?");
      args.push(category);
    }
    if (form.has("focal")) {
      sets.push("focal = ?");
      args.push(cleanFocal(form.get("focal")));
    }
    for (const key of ["alt_es", "alt_en"] as const) {
      const v = form.get(key);
      if (typeof v === "string") {
        sets.push(`${key} = ?`);
        args.push(v.trim().slice(0, 300));
      }
    }

    const file = form.get("file");
    if (file instanceof File && file.size > 0) {
      if (file.size > MAX_UPLOAD_BYTES) return NextResponse.json({ error: "La imagen supera 4 MB" }, { status: 413 });
      let processed;
      try {
        processed = await processPhoto(Buffer.from(await file.arrayBuffer()));
      } catch {
        return NextResponse.json({ error: "Imagen no válida (usa JPG, PNG o WebP)" }, { status: 400 });
      }
      sets.push("data = ?", "mime = ?", "url = NULL", "version = version + 1");
      args.push(processed.data, processed.mime);
    }

    if (sets.length === 0) return NextResponse.json({ success: true });
    await db.execute({ sql: `UPDATE media SET ${sets.join(", ")} WHERE id = ?`, args: [...args, id] });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT media error:", error);
    return NextResponse.json({ error: "Error al guardar la foto" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  try {
    await initDb();
    const id = Number((await params).id);
    if (!Number.isInteger(id)) return NextResponse.json({ error: "id inválido" }, { status: 400 });
    await db.execute({ sql: "DELETE FROM media WHERE id = ?", args: [id] });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE media error:", error);
    return NextResponse.json({ error: "Error al eliminar la foto" }, { status: 500 });
  }
}
