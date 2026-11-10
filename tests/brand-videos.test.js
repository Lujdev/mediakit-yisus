import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { NextRequest } from "next/server";

let put;
let getSiteData;
let token;
let scratch;
const originalCwd = process.cwd();

beforeAll(async () => {
  // The application opens local.db relative to cwd; keep test data separate from development.
  scratch = mkdtempSync(resolve(process.cwd(), ".brand-video-test-"));
  process.chdir(scratch);
  process.env.NODE_ENV = "test";
  delete process.env.TURSO_DATABASE_URL;
  delete process.env.TURSO_AUTH_TOKEN;
  const { createClient } = await import("@libsql/client");
  const legacy = createClient({ url: "file:./local.db" });
  await legacy.execute("CREATE TABLE videos (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL DEFAULT '', url TEXT NOT NULL, display_order INTEGER NOT NULL DEFAULT 0)");
  await legacy.execute("INSERT INTO videos (title, url, display_order) VALUES ('Legacy', 'https://example.com/legacy.mp4', 0)");
  legacy.close();
  const auth = await import("../lib/auth");
  token = auth.createSessionToken();
  put = (await import("../app/api/videos/route")).PUT;
  getSiteData = (await import("../lib/site-data")).getSiteData;
});

afterAll(() => {
  process.chdir(originalCwd);
  if (scratch) rmSync(scratch, { recursive: true, force: true });
});

async function save(videos) {
  return put(new NextRequest("http://localhost/api/videos", {
    method: "PUT",
    headers: { "content-type": "application/json", cookie: `admin_session=${token}` },
    body: JSON.stringify({ videos }),
  }));
}

describe("brand video association", () => {
  test("preserves existing videos when an older database is initialized", async () => {
    expect((await getSiteData()).videos).toContainEqual(expect.objectContaining({ title: "Legacy", url: "https://example.com/legacy.mp4", brandId: null }));
  });

  test("saves and exposes a video linked to a brand", async () => {
    const initial = await getSiteData();
    const brandId = initial.brands[0].id;
    const response = await save([{ title: "Campaign", url: "https://example.com/video.mp4", brandId }]);
    expect(response.status).toBe(200);
    const updated = await getSiteData();
    expect(updated.videos).toContainEqual(expect.objectContaining({ title: "Campaign", url: "https://example.com/video.mp4", brandId }));
  });

  test("preserves an association when a legacy client saves the same URL", async () => {
    const initial = await getSiteData();
    const brandId = initial.brands[0].id;
    await save([{ title: "Campaign", url: "https://example.com/video.mp4", brandId }]);
    const response = await save([{ title: "Renamed", url: "https://example.com/video.mp4" }]);
    expect(response.status).toBe(200);
    expect((await getSiteData()).videos).toContainEqual(expect.objectContaining({ title: "Renamed", brandId }));
  });

  test("rejects an invalid brand without replacing existing videos", async () => {
    const before = (await getSiteData()).videos;
    const response = await save([{ title: "Bad", url: "https://example.com/bad.mp4", brandId: -1 }]);
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Marca inválida" });
    expect((await getSiteData()).videos).toEqual(before);
  });

  test("continues to save videos without a brand", async () => {
    const response = await save([{ title: "Standalone", url: "https://example.com/standalone.mp4" }]);
    expect(response.status).toBe(200);
    const updated = await getSiteData();
    expect(updated.videos).toContainEqual(expect.objectContaining({ title: "Standalone", url: "https://example.com/standalone.mp4", brandId: null }));
  });
});
