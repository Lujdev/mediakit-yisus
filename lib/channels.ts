import { db, initDb } from "./db";

export const SOURCE_COOKIE = "yisus_src";

export type Channel = { code: string; name: string };

export async function listChannels(): Promise<Channel[]> {
  await initDb();
  const res = await db.execute("SELECT code, name FROM channels ORDER BY display_order, rowid");
  return res.rows.map((r) => ({ code: String(r.code), name: String(r.name) }));
}

export async function findChannelName(code: string): Promise<string | null> {
  await initDb();
  const res = await db.execute({ sql: "SELECT name FROM channels WHERE code = ?", args: [code] });
  return res.rows[0] ? String(res.rows[0].name) : null;
}
