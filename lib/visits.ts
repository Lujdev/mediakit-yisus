import { NextRequest } from "next/server";
import { db, initDb, purgeVisits } from "./db";
import { detectSource } from "./source";
import { parseUserAgent } from "./ua";

/** First client IP from the proxy headers (Vercel sets x-forwarded-for). */
export function clientIp(req: NextRequest): string | null {
  const raw = req.headers.get("x-forwarded-for")?.split(",")[0] ?? req.headers.get("x-real-ip") ?? "";
  const ip = raw.trim();
  return ip && ip.length <= 45 ? ip : null;
}

const clip = (v: unknown, max: number) => (typeof v === "string" && v ? v.slice(0, max) : null);

/** A returning visitor counts again after this many minutes (the client uses the same window). */
const DEDUPE_MINUTES = 15;

/** Stores one visit unless it is a bot or the same visitor already hit the same path within DEDUPE_MINUTES. */
export async function recordVisit(
  req: NextRequest,
  body: { path?: unknown; referrer?: unknown; lang?: unknown; tag?: unknown }
) {
  const ua = parseUserAgent(req.headers.get("user-agent") ?? "");
  if (ua.bot) return;

  await initDb();
  const ip = clientIp(req);
  const path = clip(body.path, 200)?.startsWith("/") ? clip(body.path, 200) : "/";

  let referrer: string | null = null;
  const rawRef = clip(body.referrer, 300);
  if (rawRef) {
    try {
      const host = new URL(rawRef).hostname.replace(/^www\./, "");
      const own = (req.headers.get("host") ?? "").replace(/^www\./, "").split(":")[0];
      if (host && host !== own) referrer = host;
    } catch {}
  }

  const source = detectSource(clip(body.tag, 40), referrer, req.headers.get("user-agent") ?? "");

  // Approximate place from the IP, resolved by Vercel at the edge (no third-party lookup, nothing leaves your stack).
  const country = clip(req.headers.get("x-vercel-ip-country"), 2);
  let city: string | null = null;
  try {
    city = clip(decodeURIComponent(req.headers.get("x-vercel-ip-city") ?? ""), 80);
  } catch {}

  const recent = await db.execute({
    sql: `SELECT 1 FROM visits
          WHERE ip IS ? AND os = ? AND browser = ? AND path IS ? AND source IS ?
            AND created_at > datetime('now', ?)
          LIMIT 1`,
    args: [ip, ua.os, ua.browser, path, source, `-${DEDUPE_MINUTES} minutes`],
  });
  if (recent.rows.length > 0) return;

  await db.execute({
    sql: `INSERT INTO visits (ip, country, city, device, os, browser, lang, referrer, path, source)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [ip, country, city, ua.device, ua.os, ua.browser, clip(body.lang, 20), referrer, path, source],
  });

  // Keep the 90-day limit even when nobody opens the admin.
  if (Math.random() < 0.05) await purgeVisits();
}

type Row = { k: string; c: number };

export async function getVisitStats(days: number, purge = true) {
  await initDb();
  // Polls skip the purge: it only needs to run when the tab opens, not every few seconds.
  if (purge) await purgeVisits();
  const since = `-${days} days`;

  const group = async (col: "device" | "os" | "browser" | "country" | "city" | "lang" | "source" | "path"): Promise<Row[]> => {
    const res = await db.execute({
      sql: `SELECT COALESCE(${col}, '') AS k, COUNT(*) AS c FROM visits
            WHERE created_at >= datetime('now', ?) GROUP BY k ORDER BY c DESC LIMIT 8`,
      args: [since],
    });
    return res.rows.map((r) => ({ k: String(r.k), c: Number(r.c) }));
  };

  const [totals, lastRow, daily, recent, device, os, browser, country, city, lang, source, path] = await Promise.all([
    db.execute({
      sql: `SELECT COUNT(*) AS visits, COUNT(DISTINCT COALESCE(ip, '') || '|' || os || '|' || browser) AS visitors
            FROM visits WHERE created_at >= datetime('now', ?)`,
      args: [since],
    }),
    db.execute("SELECT COALESCE(MAX(id), 0) AS last FROM visits"),
    db.execute({
      sql: `SELECT date(created_at) AS d, COUNT(*) AS c FROM visits
            WHERE created_at >= datetime('now', ?) GROUP BY d ORDER BY d`,
      args: [since],
    }),
    db.execute(
      `SELECT ip, country, city, device, os, browser, lang, referrer, source, path, created_at
       FROM visits ORDER BY id DESC LIMIT 40`
    ),
    group("device"),
    group("os"),
    group("browser"),
    group("country"),
    group("city"),
    group("lang"),
    group("source"),
    group("path"),
  ]);

  return {
    days,
    // Server date (UTC) so the client can lay out the day bars without reading the clock while rendering.
    today: new Date().toISOString().slice(0, 10),
    lastId: Number(lastRow.rows[0].last),
    totals: { visits: Number(totals.rows[0].visits), visitors: Number(totals.rows[0].visitors) },
    daily: daily.rows.map((r) => ({ d: String(r.d), c: Number(r.c) })),
    device,
    os,
    browser,
    country,
    city,
    lang,
    source,
    path,
    recent: recent.rows.map((r) => ({
      ip: r.ip ? String(r.ip) : null,
      country: r.country ? String(r.country) : null,
      city: r.city ? String(r.city) : null,
      device: String(r.device ?? ""),
      os: String(r.os ?? ""),
      browser: String(r.browser ?? ""),
      lang: r.lang ? String(r.lang) : null,
      referrer: r.referrer ? String(r.referrer) : null,
      source: r.source ? String(r.source) : "Directo",
      path: String(r.path ?? "/"),
      // SQLite stores UTC without a zone marker.
      at: `${String(r.created_at).replace(" ", "T")}Z`,
    })),
  };
}

/**
 * Cheap live check: only touches rows newer than `afterId` (primary-key range), so an idle site reads
 * zero rows. The dashboard reloads the full stats only when this reports something new.
 */
export async function newVisitsSince(afterId: number) {
  await initDb();
  const res = await db.execute({
    sql: "SELECT COUNT(*) AS c, COALESCE(MAX(id), ?) AS last FROM visits WHERE id > ?",
    args: [afterId, afterId],
  });
  return { count: Number(res.rows[0].c), lastId: Number(res.rows[0].last) };
}
