import { NextRequest, NextResponse } from "next/server";
import { IGNORE_COOKIE, isAdmin } from "@/lib/auth";
import { recordVisit } from "@/lib/visits";

/** Receives the page-load beacon. Always answers 204: tracking must never break or slow the page. */
export async function POST(req: NextRequest) {
  try {
    // Your own visits are not counted: an active admin session, or a device marked as yours.
    if (!isAdmin(req) && !req.cookies.get(IGNORE_COOKIE)) {
      const text = (await req.text()).slice(0, 2000);
      let body: Record<string, unknown> = {};
      try {
        body = JSON.parse(text);
      } catch {}
      await recordVisit(req, body);
    }
  } catch (error) {
    console.error("track error:", error);
  }
  return new NextResponse(null, { status: 204 });
}
