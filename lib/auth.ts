import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

export const SESSION_COOKIE = "admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

/** Dev-only fallback so local work needs no setup. Production fails closed. */
const DEV_PASSWORD = "yisus2026";

function adminPassword(): string | null {
  const fromEnv = process.env.ADMIN_PASSWORD;
  if (fromEnv) return fromEnv;
  return process.env.NODE_ENV === "production" ? null : DEV_PASSWORD;
}

function secret(): string | null {
  const pw = adminPassword();
  if (!pw) return null;
  return process.env.ADMIN_SESSION_SECRET || `session:${pw}`;
}

function sign(payload: string, key: string) {
  return createHmac("sha256", key).update(payload).digest("hex");
}

function safeEqual(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export function passwordMatches(candidate: string): boolean {
  const pw = adminPassword();
  if (!pw || typeof candidate !== "string") return false;
  return safeEqual(candidate, pw);
}

export function createSessionToken(): string | null {
  const key = secret();
  if (!key) return null;
  const expires = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = String(expires);
  return `${payload}.${sign(payload, key)}`;
}

function tokenIsValid(token: string | undefined): boolean {
  const key = secret();
  if (!key || !token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig || !safeEqual(sig, sign(payload, key))) return false;
  return Number(payload) > Math.floor(Date.now() / 1000);
}

export function isAdmin(req: NextRequest): boolean {
  return tokenIsValid(req.cookies.get(SESSION_COOKIE)?.value);
}

/** Returns a 401 response when the request has no valid admin session, else null. */
export function requireAdmin(req: NextRequest): NextResponse | null {
  return isAdmin(req)
    ? null
    : NextResponse.json({ error: "No autorizado" }, { status: 401 });
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "strict" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_TTL_SECONDS,
};
