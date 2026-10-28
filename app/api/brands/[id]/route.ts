import { NextRequest, NextResponse } from "next/server";
import { db, initDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { processLogo } from "@/lib/logo";
import { safeHttpUrl } from "@/lib/site-data";

const MAX_LOGO_BYTES = 4 * 1024 * 1024;

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  try {
    await initDb();
    const id = Number((await params).id);
    if (!Number.isInteger(id)) return NextResponse.json({ error: "id inválido" }, { status: 400 });

    const form = await req.formData();
    const name = String(form.get("name") ?? "").trim();
    if (!name) return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 });

    const rawUrl = String(form.get("url") ?? "").trim();
    const url = rawUrl ? safeHttpUrl(rawUrl) : null;
    if (rawUrl && !url) return NextResponse.json({ error: "URL inválida" }, { status: 400 });

    const file = form.get("logo");
    if (file instanceof File && file.size > 0) {
      if (file.size > MAX_LOGO_BYTES) {
        return NextResponse.json({ error: "El logo supera 4 MB" }, { status: 413 });
      }
      let logo: Buffer;
      try {
        logo = await processLogo(Buffer.from(await file.arrayBuffer()));
      } catch {
        return NextResponse.json({ error: "Imagen no válida" }, { status: 400 });
      }
      await db.execute({
        sql: "UPDATE brands SET name = ?, url = ?, logo_data = ?, logo_version = logo_version + 1 WHERE id = ?",
        args: [name, url, logo, id],
      });
    } else if (form.get("removeLogo") === "1") {
      await db.execute({
        sql: "UPDATE brands SET name = ?, url = ?, logo_data = NULL, logo_url = NULL, logo_version = logo_version + 1 WHERE id = ?",
        args: [name, url, id],
      });
    } else {
      await db.execute({
        sql: "UPDATE brands SET name = ?, url = ? WHERE id = ?",
        args: [name, url, id],
      });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    if (String(error).includes("UNIQUE")) {
      return NextResponse.json({ error: "Ya existe una marca con ese nombre" }, { status: 409 });
    }
    console.error("PUT brand error:", error);
    return NextResponse.json({ error: "Error al guardar la marca" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  try {
    await initDb();
    const id = Number((await params).id);
    if (!Number.isInteger(id)) return NextResponse.json({ error: "id inválido" }, { status: 400 });
    await db.execute({ sql: "DELETE FROM brands WHERE id = ?", args: [id] });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE brand error:", error);
    return NextResponse.json({ error: "Error al eliminar la marca" }, { status: 500 });
  }
}
