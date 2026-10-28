import { NextRequest, NextResponse } from "next/server";
import { db, initDb } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await initDb();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) return new NextResponse(null, { status: 404 });

  const result = await db.execute({
    sql: "SELECT logo_data FROM brands WHERE id = ?",
    args: [id],
  });
  const data = result.rows[0]?.logo_data;
  if (!data) return new NextResponse(null, { status: 404 });

  return new NextResponse(new Uint8Array(data as ArrayBuffer), {
    headers: {
      "Content-Type": "image/png",
      // The URL carries ?v=<logo_version>, so it is safe to cache hard.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
