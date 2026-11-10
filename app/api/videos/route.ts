import { NextRequest, NextResponse } from "next/server";
import { db, initDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { safeHttpUrl } from "@/lib/site-data";

/** Replaces the full list of videos: body { videos: [{ title, url }] }. */
export async function PUT(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  try {
    await initDb();
    const body = await req.json();
    const items: { title?: unknown; url?: unknown; brandId?: unknown }[] = Array.isArray(body?.videos) ? body.videos : [];
    if (items.length > 30) return NextResponse.json({ error: "Máximo 30 videos" }, { status: 400 });

    const existing = await db.execute("SELECT url, brand_id FROM videos ORDER BY display_order, id");
    const brands = await db.execute("SELECT id FROM brands");
    const brandIds = new Set(brands.rows.map((row) => Number(row.id)));
    const rows = items.map((v, i) => ({
      title: typeof v.title === "string" ? v.title.trim().slice(0, 120) : "",
      url: safeHttpUrl(v.url),
      brandId: v.brandId === undefined
        ? existing.rows.find((row) => row.url === v.url)?.brand_id ?? null
        : v.brandId,
      order: i,
    }));
    if (rows.some((r) => !r.url)) {
      return NextResponse.json({ error: "Todas las URLs deben empezar con http:// o https://" }, { status: 400 });
    }

    if (rows.some((r) => r.brandId !== null && (!Number.isInteger(r.brandId) || !brandIds.has(Number(r.brandId))))) {
      return NextResponse.json({ error: "Marca inválida" }, { status: 400 });
    }

    await db.batch(
      [
        { sql: "DELETE FROM videos", args: [] },
        ...rows.map((r) => ({
          sql: "INSERT INTO videos (title, url, display_order, brand_id) VALUES (?, ?, ?, ?)",
          args: [r.title, r.url as string, r.order, r.brandId == null ? null : Number(r.brandId)],
        })),
      ],
      "write"
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT videos error:", error);
    return NextResponse.json({ error: "Error al guardar videos" }, { status: 500 });
  }
}
