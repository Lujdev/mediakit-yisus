import { createClient, Client } from "@libsql/client";
import { dictionary } from "../app/i18n/dictionary";
import { DEFAULT_SETTINGS } from "./settings-defaults";
import { GALLERY_IMAGES } from "../app/data/gallery";
import { SHOTS } from "../app/data/metrics-detail";

let db: Client;

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

const isBuild = process.env.NEXT_PHASE === "phase-production-build";

if (url && authToken) {
  // Production: Turso cloud
  db = createClient({ url, authToken });
} else if (!isBuild && process.env.NODE_ENV === "production") {
  // Never fall back to a local file in production: a serverless deploy would start from an
  // empty SQLite file, seed the defaults and look like the admin's data was lost.
  throw new Error("Faltan TURSO_DATABASE_URL y TURSO_AUTH_TOKEN en producción.");
} else {
  // Development (and build-time module evaluation): local SQLite file
  db = createClient({ url: "file:./local.db" });
}

export { db };

export { DEFAULT_SETTINGS };

const DEFAULT_BRANDS = [
  { name: "COVAS", logo_url: "/brands/covas.png" },
  { name: "SAMOS", logo_url: "/brands/samos.png" },
  { name: "ROCKSTAR", logo_url: "/brands/rockstar.png" },
  { name: "ANCDESIGN", logo_url: null },
  { name: "FVPS", logo_url: null },
  { name: "BACC", logo_url: "/brands/bacc.png" },
  { name: "DERNIER", logo_url: "/brands/dernier.png" },
];

async function createSchema() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS metrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      platform TEXT NOT NULL,
      metric_type TEXT NOT NULL,
      value TEXT NOT NULL,
      label TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // The metrics upsert relies on this; without it ON CONFLICT(platform, metric_type) throws.
  try {
    await db.execute(
      "CREATE UNIQUE INDEX IF NOT EXISTS idx_metrics_platform_type ON metrics(platform, metric_type)"
    );
  } catch (err) {
    console.warn("Could not create metrics unique index (duplicate rows?):", err);
  }

  await db.execute(`
    CREATE TABLE IF NOT EXISTS contact_submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      brand TEXT,
      service_type TEXT,
      message TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS media_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      url TEXT NOT NULL,
      category TEXT,
      title TEXT,
      display_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS brands (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      url TEXT,
      logo_url TEXT,
      logo_data BLOB,
      logo_version INTEGER NOT NULL DEFAULT 0,
      display_order INTEGER NOT NULL DEFAULT 0
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS packages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price TEXT NOT NULL,
      popular INTEGER NOT NULL DEFAULT 0,
      description_es TEXT NOT NULL DEFAULT '',
      description_en TEXT NOT NULL DEFAULT '',
      features_es TEXT NOT NULL DEFAULT '[]',
      features_en TEXT NOT NULL DEFAULT '[]',
      display_order INTEGER NOT NULL DEFAULT 0
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS videos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL DEFAULT '',
      url TEXT NOT NULL,
      display_order INTEGER NOT NULL DEFAULT 0
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS visits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      ip TEXT,
      country TEXT,
      city TEXT,
      device TEXT,
      os TEXT,
      browser TEXT,
      lang TEXT,
      referrer TEXT,
      path TEXT,
      source TEXT
    )
  `);
  // Databases created before channel detection lack this column; adding it twice is a harmless error.
  try {
    await db.execute("ALTER TABLE visits ADD COLUMN source TEXT");
  } catch {}
  await db.execute("CREATE INDEX IF NOT EXISTS idx_visits_created ON visits(created_at)");

  // Editable photos: hero and about overrides, the gallery, and the analytics screenshots. A row with `url` points at a
  // bundled default image; a row with `data` holds an uploaded (already resized) photo.
  await db.execute(`
    CREATE TABLE IF NOT EXISTS media (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      kind TEXT NOT NULL,
      group_key TEXT,
      url TEXT,
      data BLOB,
      mime TEXT,
      version INTEGER NOT NULL DEFAULT 0,
      category TEXT,
      focal TEXT,
      alt_es TEXT NOT NULL DEFAULT '',
      alt_en TEXT NOT NULL DEFAULT '',
      display_order INTEGER NOT NULL DEFAULT 0
    )
  `);

  // Short neutral links (/go/<code>) that tag a visit with the channel it came from.
  await db.execute(`
    CREATE TABLE IF NOT EXISTS channels (
      code TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      display_order INTEGER NOT NULL DEFAULT 0
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);
}

/**
 * Atomically claims a one-time job. Several serverless instances can start at once and all
 * run initDb(); a "count is zero, so insert" check lets every one of them insert the defaults
 * (duplicated combos and brands). Only the instance whose INSERT actually adds the marker row proceeds.
 * Also means defaults are never re-created after an admin deliberately empties a list.
 */
async function claim(key: string): Promise<boolean> {
  const res = await db.execute({
    sql: "INSERT OR IGNORE INTO settings (key, value) VALUES (?, '1')",
    args: [key],
  });
  return res.rowsAffected === 1;
}

async function release(key: string) {
  await db.execute({ sql: "DELETE FROM settings WHERE key = ?", args: [key] });
}

/** Runs a claimed seed; if it throws, the marker is released so the next start can retry. */
async function seedOnce(key: string, job: () => Promise<void>) {
  if (!(await claim(key))) return;
  try {
    await job();
  } catch (err) {
    await release(key);
    throw err;
  }
}

/** Removes exact duplicates left by earlier concurrent seeding. Cheap and idempotent. */
async function dedupe() {
  await db.execute(
    "DELETE FROM packages WHERE id NOT IN (SELECT MIN(id) FROM packages GROUP BY name, price)"
  );
  await db.execute(`
    DELETE FROM brands WHERE id NOT IN (
      SELECT (
        SELECT c.id FROM brands c
        WHERE UPPER(c.name) = UPPER(b.name)
        ORDER BY (c.logo_data IS NOT NULL) DESC, c.id
        LIMIT 1
      ) FROM brands b
    )
  `);
  // Makes brand seeding race-proof: a second concurrent INSERT OR IGNORE of the same name is a no-op.
  try {
    await db.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_brands_name ON brands(UPPER(name))");
  } catch (err) {
    console.warn("Could not create brands unique index:", err);
  }
}

async function seed() {
  await seedOnce("seed_metrics_v1", async () => {
    const existing = await db.execute("SELECT COUNT(*) as count FROM metrics");
    if (Number(existing.rows[0].count) > 0) return;
    const seedData = [
      { platform: "instagram", metric_type: "followers", value: "12100", label: "Seguidores" },
      { platform: "instagram", metric_type: "views", value: "2051810", label: "Visualizaciones (30d)" },
      { platform: "instagram", metric_type: "new_followers", value: "1610", label: "Nuevos seguidores" },
      { platform: "tiktok", metric_type: "followers", value: "14000", label: "Seguidores" },
      { platform: "tiktok", metric_type: "views", value: "1100000", label: "Visualizaciones" },
      { platform: "tiktok", metric_type: "likes", value: "171600", label: "Me gusta" },
    ];
    for (const row of seedData) {
      await db.execute({
        sql: `INSERT OR IGNORE INTO metrics (platform, metric_type, value, label) VALUES (?, ?, ?, ?)`,
        args: [row.platform, row.metric_type, row.value, row.label],
      });
    }
  });

  await seedOnce("seed_brands_v1", async () => {
    // Databases seeded by earlier code carry this marker and already hold their own brand list.
    const legacy = await db.execute("SELECT 1 FROM settings WHERE key = 'brands_v2'");
    if (legacy.rows.length > 0) return;
    for (const [i, b] of DEFAULT_BRANDS.entries()) {
      await db.execute({
        sql: "INSERT OR IGNORE INTO brands (name, logo_url, display_order) VALUES (?, ?, ?)",
        args: [b.name, b.logo_url, i],
      });
    }
  });

  await seedOnce("seed_packages_v1", async () => {
    const existing = await db.execute("SELECT COUNT(*) as count FROM packages");
    if (Number(existing.rows[0].count) > 0) return;
    const es = dictionary.es.services.packages;
    const en = dictionary.en.services.packages;
    const prices = ["$300", "$250", "$200"];
    for (const [i, p] of es.entries()) {
      await db.execute({
        sql: `INSERT INTO packages
              (name, price, popular, description_es, description_en, features_es, features_en, display_order)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          p.name,
          prices[i],
          i === 0 ? 1 : 0,
          p.description,
          en[i].description,
          JSON.stringify(p.features),
          JSON.stringify(en[i].features),
          i,
        ],
      });
    }
  });

  await seedOnce("seed_media_v1", async () => {
    const existing = await db.execute("SELECT COUNT(*) AS count FROM media");
    if (Number(existing.rows[0].count) > 0) return;
    for (const [i, g] of GALLERY_IMAGES.entries()) {
      await db.execute({
        sql: `INSERT INTO media (kind, url, category, focal, alt_es, alt_en, display_order)
              VALUES ('gallery', ?, ?, ?, ?, ?, ?)`,
        args: [g.src, g.category, g.focal, g.alt.es, g.alt.en, i],
      });
    }
    let order = 0;
    for (const [platform, shots] of Object.entries(SHOTS)) {
      for (const shot of shots) {
        await db.execute({
          sql: `INSERT INTO media (kind, group_key, url, alt_es, alt_en, display_order)
                VALUES ('shot', ?, ?, ?, ?, ?)`,
          args: [platform, shot.src, shot.caption.es, shot.caption.en, order++],
        });
      }
    }
  });

  await seedOnce("seed_channels_v1", async () => {
    const names = ["Instagram", "TikTok", "WhatsApp"];
    for (const [i, name] of names.entries()) {
      // Random, meaningless codes so the link does not announce what it measures.
      const code = Math.random().toString(36).slice(2, 7);
      await db.execute({
        sql: "INSERT OR IGNORE INTO channels (code, name, display_order) VALUES (?, ?, ?)",
        args: [code, name, i],
      });
    }
  });

  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    await db.execute({
      sql: "INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)",
      args: [key, value],
    });
  }
}

/** Visit records (which include IPs) are kept for 30 days and no longer. */
export const VISIT_RETENTION_DAYS = 30;

export async function purgeVisits() {
  await db.execute({
    sql: "DELETE FROM visits WHERE created_at < datetime('now', ?)",
    args: [`-${VISIT_RETENTION_DAYS} days`],
  });
}

let ready: Promise<void> | null = null;

/** Creates tables and seeds defaults once per server instance. Safe to call on every request. */
export function initDb(): Promise<void> {
  if (!ready) {
    ready = (async () => {
      await createSchema();
      await dedupe();
      await seed();
      await purgeVisits();
    })().catch((err) => {
      ready = null; // allow a retry on the next request
      throw err;
    });
  }
  return ready;
}
