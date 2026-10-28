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
    const items: { title?: unknown; url?: unknown }[] = Array.isArray(body?.videos) ? body.videos : [];
    if (items.length > 30) return NextResponse.json({ error: "Máximo 30 videos" }, { status: 400 });

    const rows = items.map((v, i) => ({
      title: typeof v.title === "string" ? v.title.trim().slice(0, 120) : "",
      url: safeHttpUrl(v.url),
      order: i,
    }));
    if (rows.some((r) => !r.url)) {
      return NextResponse.json({ error: "Todas las URLs deben empezar con http:// o https://" }, { status: 400 });
    }

    await db.batch(
      [
        { sql: "DELETE FROM videos", args: [] },
        ...rows.map((r) => ({
          sql: "INSERT INTO videos (title, url, display_order) VALUES (?, ?, ?)",
          args: [r.title, r.url as string, r.order],
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
