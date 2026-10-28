import { NextRequest, NextResponse } from "next/server";
import { IGNORE_COOKIE, ignoreCookieOptions, requireAdmin } from "@/lib/auth";

/** Whether this device is excluded from visit counting. */
export async function GET(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  return NextResponse.json({ ignored: Boolean(req.cookies.get(IGNORE_COOKIE)) });
}

/** body { ignore: boolean }: mark or unmark this device as the owner's. */
export async function POST(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  const body = await req.json().catch(() => ({}));
  const ignore = body?.ignore === true;
  const res = NextResponse.json({ ignored: ignore });
  if (ignore) res.cookies.set(IGNORE_COOKIE, "1", ignoreCookieOptions);
  else res.cookies.set(IGNORE_COOKIE, "", { ...ignoreCookieOptions, maxAge: 0 });
  return res;
}
