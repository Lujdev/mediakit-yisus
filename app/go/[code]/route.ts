import { NextRequest, NextResponse } from "next/server";
import { SOURCE_COOKIE, findChannelName } from "@/lib/channels";

/**
 * Short tracking link: /go/<code>. Remembers which channel it belongs to for 30 minutes (cookie) and sends the
 * visitor to the clean home page, so nothing about the tracking stays in the address bar.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const res = NextResponse.redirect(new URL("/", req.url), 302);
  try {
    const name = /^[a-z0-9_-]{1,32}$/i.test(code) ? await findChannelName(code) : null;
    if (name) {
      res.cookies.set(SOURCE_COOKIE, encodeURIComponent(name), {
        path: "/",
        maxAge: 60 * 30,
        sameSite: "lax",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      });
    }
  } catch (error) {
    console.error("go redirect error:", error);
  }
  return res;
}
