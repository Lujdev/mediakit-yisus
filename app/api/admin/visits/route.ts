import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getVisitStats } from "@/lib/visits";

export async function GET(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  const requested = Number(req.nextUrl.searchParams.get("days"));
  const days = [7, 14, 30].includes(requested) ? requested : 30;
  try {
    return NextResponse.json(await getVisitStats(days, req.nextUrl.searchParams.get("purge") !== "0"), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("GET visits error:", error);
    return NextResponse.json({ error: "Error al obtener visitas" }, { status: 500 });
  }
}
