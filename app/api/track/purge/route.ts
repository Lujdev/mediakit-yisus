import { NextResponse } from "next/server";
import { initDb, purgeVisits } from "@/lib/db";

/** Daily cron (see vercel.json): deletes visits older than 30 days. Idempotent and only removes expired data. */
export async function GET() {
  await initDb();
  await purgeVisits();
  return NextResponse.json({ success: true });
}
