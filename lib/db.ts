import { createClient, Client } from "@libsql/client";

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

// Initialize schema
export async function initDb() {
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

  // Seed default metrics if empty
  const existing = await db.execute("SELECT COUNT(*) as count FROM metrics");
  if (existing.rows[0].count === 0) {
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
}
