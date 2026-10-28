import { NextRequest, NextResponse } from "next/server";
import { db, initDb, DEFAULT_SETTINGS } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { safeHttpUrl } from "@/lib/site-data";

const URL_KEYS = new Set(["instagram_url", "tiktok_url"]);

/** Updates social/contact settings: body { settings: { key: value } }. Unknown keys are rejected. */
export async function PUT(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  try {
    await initDb();
    const body = await req.json();
    const incoming: Record<string, unknown> = body?.settings ?? {};
    const statements: { sql: string; args: string[] }[] = [];

    for (const [key, raw] of Object.entries(incoming)) {
      if (!(key in DEFAULT_SETTINGS)) {
        return NextResponse.json({ error: `Ajuste desconocido: ${key}` }, { status: 400 });
      }
      let value = typeof raw === "string" ? raw.trim().slice(0, 200) : "";
      if (URL_KEYS.has(key)) {
        const safe = safeHttpUrl(value);
        if (!safe) return NextResponse.json({ error: "Las URLs deben empezar con http:// o https://" }, { status: 400 });
        value = safe;
      }
      if (key === "whatsapp") value = value.replace(/\D/g, "");
      if (key === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return NextResponse.json({ error: "Email inválido" }, { status: 400 });
      }
      if (!value) return NextResponse.json({ error: `Falta ${key}` }, { status: 400 });
      statements.push({
        sql: "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
        args: [key, value],
      });
    }

    await db.batch(statements, "write");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT settings error:", error);
    return NextResponse.json({ error: "Error al guardar ajustes" }, { status: 500 });
  }
}
