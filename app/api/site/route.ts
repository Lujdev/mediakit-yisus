import { NextResponse } from "next/server";
import { getSiteData } from "@/lib/site-data";

export async function GET() {
  try {
    return NextResponse.json(await getSiteData(), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("GET site error:", error);
    return NextResponse.json({ error: "Error al obtener contenido" }, { status: 500 });
  }
}
