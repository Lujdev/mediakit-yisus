import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { newVisitsSince } from "@/lib/visits";

export async function GET(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  const after = Number(req.nextUrl.searchParams.get("after"));
  try {
    return NextResponse.json(await newVisitsSince(Number.isInteger(after) && after >= 0 ? after : 0), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("GET visits live error:", error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
