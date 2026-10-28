import { NextRequest, NextResponse } from "next/server";
import {
  IGNORE_COOKIE,
  SESSION_COOKIE,
  createSessionToken,
  ignoreCookieOptions,
  isAdmin,
  passwordMatches,
  sessionCookieOptions,
} from "@/lib/auth";

export async function GET(req: NextRequest) {
  return NextResponse.json({ authenticated: isAdmin(req) });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  if (!passwordMatches(body?.password)) {
    // Slow down guessing; also hides whether ADMIN_PASSWORD is configured.
    await new Promise((r) => setTimeout(r, 600));
    return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
  }
  const token = createSessionToken();
  if (!token) {
    return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
  }
  const res = NextResponse.json({ authenticated: true });
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
  // Signing in to the admin marks this device as the owner's, so its visits are never counted.
  res.cookies.set(IGNORE_COOKIE, "1", ignoreCookieOptions);
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ authenticated: false });
  res.cookies.set(SESSION_COOKIE, "", { ...sessionCookieOptions, maxAge: 0 });
  return res;
}
