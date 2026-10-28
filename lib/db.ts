import { createClient, Client } from "@libsql/client";
import { dictionary } from "../app/i18n/dictionary";
import { DEFAULT_SETTINGS } from "./settings-defaults";

let db: Client;

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (url && authToken) {
  // Production: Turso cloud
  db = createClient({ url, authToken });
} else {
  // Development: local SQLite file
  db = createClient({ url: "file:./local.db" });
}

export { db };

export { DEFAULT_SETTINGS };

// Each later batch is applied once to databases that already exist, tracked by a settings marker,
// so brands the admin deleted later are not resurrected.
const BRAND_BATCHES: { id: string; brands: { name: string; logo_url: string | null }[] }[] = [
  {
    id: "brands_v2",
    brands: [
      { name: "BACC", logo_url: "/brands/bacc.png" },
      { name: "DERNIER", logo_url: "/brands/dernier.png" },
    ],
  },
];

const DEFAULT_BRANDS = [
  { name: "HERO", logo_url: "/brands/hero.png" },
  { name: "COVAS", logo_url: "/brands/covas.png" },
  { name: "SAMOS", logo_url: "/brands/samos.png" },
  { name: "ROCKSTAR", logo_url: "/brands/rockstar.png" },
  { name: "ANCDESIGN", logo_url: null },
  { name: "FVPS", logo_url: null },
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
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);
}

async function seed() {
  const metrics = await db.execute("SELECT COUNT(*) as count FROM metrics");
  if (Number(metrics.rows[0].count) === 0) {
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
        sql: `INSERT INTO metrics (platform, metric_type, value, label) VALUES (?, ?, ?, ?)`,
        args: [row.platform, row.metric_type, row.value, row.label],
      });
    }
  }

  const brands = await db.execute("SELECT COUNT(*) as count FROM brands");
  if (Number(brands.rows[0].count) === 0) {
    for (const [i, b] of DEFAULT_BRANDS.entries()) {
      await db.execute({
        sql: "INSERT INTO brands (name, logo_url, display_order) VALUES (?, ?, ?)",
        args: [b.name, b.logo_url, i],
      });
    }
  }

  for (const batch of BRAND_BATCHES) {
    const done = await db.execute({ sql: "SELECT 1 FROM settings WHERE key = ?", args: [batch.id] });
    if (done.rows.length > 0) continue;
    for (const b of batch.brands) {
      const exists = await db.execute({ sql: "SELECT 1 FROM brands WHERE name = ?", args: [b.name] });
      if (exists.rows.length > 0) continue;
      const order = await db.execute("SELECT COALESCE(MAX(display_order), -1) + 1 AS next FROM brands");
      await db.execute({
        sql: "INSERT INTO brands (name, logo_url, display_order) VALUES (?, ?, ?)",
        args: [b.name, b.logo_url, Number(order.rows[0].next)],
      });
    }
    await db.execute({ sql: "INSERT INTO settings (key, value) VALUES (?, '1')", args: [batch.id] });
  }

  const packages = await db.execute("SELECT COUNT(*) as count FROM packages");
  if (Number(packages.rows[0].count) === 0) {
    const es = dictionary.es.services.packages;
    const en = dictionary.en.services.packages;
    for (const [i, p] of es.entries()) {
      await db.execute({
        sql: `INSERT INTO packages
              (name, price, popular, description_es, description_en, features_es, features_en, display_order)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          p.name,
          p.price,
          i === 0 ? 1 : 0,
          p.description,
          en[i].description,
          JSON.stringify(p.features),
          JSON.stringify(en[i].features),
          i,
        ],
      });
    }
  }

  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    await db.execute({
      sql: "INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)",
      args: [key, value],
    });
  }
}

let ready: Promise<void> | null = null;

/** Creates tables and seeds defaults once per server instance. Safe to call on every request. */
export function initDb(): Promise<void> {
  if (!ready) {
    ready = (async () => {
      await createSchema();
      await seed();
    })().catch((err) => {
      ready = null; // allow a retry on the next request
      throw err;
    });
  }
  return ready;
}
