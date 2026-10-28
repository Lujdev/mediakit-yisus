import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// The admin lives at /<ADMIN_PATH> instead of the guessable /admin. Set ADMIN_PATH in the environment
// (Vercel) to your own secret word; the fallback is only a non-obvious default. This is obscurity on top of
// the real protection (server-side session), not a replacement for it.
const ADMIN_PATH = (process.env.ADMIN_PATH || "yc-studio").replace(/^\/+|\/+$/g, "");

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const path = pathname.replace(/\/+$/, "") || "/";

  // Public secret path -> the internal admin page. A rewrite is final, so it is not re-checked below.
  if (path === `/${ADMIN_PATH}`) {
    return NextResponse.rewrite(new URL("/admin", request.url));
  }
  // Direct hits on the internal route behave as if it did not exist.
  if (path === "/admin") {
    return NextResponse.rewrite(new URL("/__not-found__", request.url));
  }
  return NextResponse.next();
}

export const config = {
  // Skip API routes, Next internals and static files; only page requests reach the function.
  matcher: ["/((?!api/|_next/|.*\\..*).*)"],
};
