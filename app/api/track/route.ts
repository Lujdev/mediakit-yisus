import { NextRequest, NextResponse } from "next/server";
import { IGNORE_COOKIE, isAdmin } from "@/lib/auth";
import { SOURCE_COOKIE } from "@/lib/channels";
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
      // A /go/<code> link leaves the channel in a short-lived cookie; it wins over any tag in the URL.
      const fromCookie = req.cookies.get(SOURCE_COOKIE)?.value;
      if (fromCookie) {
        try {
          body.tag = decodeURIComponent(fromCookie);
        } catch {}
      }
      await recordVisit(req, body);
    }
  } catch (error) {
    console.error("track error:", error);
  }
  const res = new NextResponse(null, { status: 204 });
  // One tagged landing counts once; later visits in the same browser start clean.
  if (req.cookies.get(SOURCE_COOKIE)) res.cookies.set(SOURCE_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
