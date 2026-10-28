import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { listChannels } from "@/lib/channels";
import { db, initDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  return NextResponse.json({ channels: await listChannels() }, { headers: { "Cache-Control": "no-store" } });
}

/** Replaces the whole list: body { channels: [{ code, name }] }. Codes are letters, digits, - and _. */
export async function PUT(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  try {
    await initDb();
    const body = await req.json();
    const items: { code?: unknown; name?: unknown }[] = Array.isArray(body?.channels) ? body.channels : [];
    if (items.length > 20) return NextResponse.json({ error: "Máximo 20 enlaces" }, { status: 400 });

    const rows = items.map((c, i) => ({
      code: typeof c.code === "string" ? c.code.trim() : "",
      name: typeof c.name === "string" ? c.name.trim().slice(0, 40) : "",
      order: i,
    }));
    if (rows.some((r) => !/^[a-z0-9_-]{2,32}$/i.test(r.code) || !r.name)) {
      return NextResponse.json({ error: "Cada enlace necesita nombre y un código de 2 a 32 letras o números" }, { status: 400 });
    }
    if (new Set(rows.map((r) => r.code.toLowerCase())).size !== rows.length) {
      return NextResponse.json({ error: "Los códigos no se pueden repetir" }, { status: 400 });
    }

    await db.batch(
      [
        { sql: "DELETE FROM channels", args: [] },
        ...rows.map((r) => ({
          sql: "INSERT INTO channels (code, name, display_order) VALUES (?, ?, ?)",
          args: [r.code, r.name, r.order],
        })),
      ],
      "write"
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT channels error:", error);
    return NextResponse.json({ error: "Error al guardar los enlaces" }, { status: 500 });
  }
}
