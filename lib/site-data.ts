import { db, initDb, DEFAULT_SETTINGS } from "./db";

export type Brand = { id: number; name: string; url: string | null; logo: string | null };
export type Pkg = {
  id: number;
  name: string;
  price: string;
  popular: boolean;
  description: { es: string; en: string };
  features: { es: string[]; en: string[] };
};
export type Video = { id: number; title: string; url: string };
export type MediaItem = {
  id: number;
  src: string;
  category: string | null;
  focal: string;
  alt: { es: string; en: string };
};
export type SiteMedia = {
  hero: string | null;
  about: string | null;
  gallery: MediaItem[];
  shots: Record<string, MediaItem[]>;
};
export type SiteData = {
  media: SiteMedia;
  brands: Brand[];
  packages: Pkg[];
  videos: Video[];
  settings: Record<string, string>;
};

function parseList(raw: unknown): string[] {
  try {
    const v = JSON.parse(String(raw));
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
}

export async function getSiteData(): Promise<SiteData> {
  await initDb();
  const [brands, packages, videos, settings, media] = await Promise.all([
    db.execute(
      "SELECT id, name, url, logo_url, logo_version, logo_data IS NOT NULL AS has_data FROM brands ORDER BY display_order, id"
    ),
    db.execute("SELECT * FROM packages ORDER BY display_order, id"),
    db.execute("SELECT id, title, url FROM videos ORDER BY display_order, id"),
    db.execute("SELECT key, value FROM settings"),
    db.execute(
      `SELECT id, kind, group_key, url, version, category, focal, alt_es, alt_en, data IS NOT NULL AS has_data
       FROM media ORDER BY display_order, id`
    ),
  ]);

  const mediaSrc = (r: (typeof media.rows)[number]) =>
    Number(r.has_data) ? `/api/media/${r.id}?v=${r.version}` : r.url ? String(r.url) : "";
  const toItem = (r: (typeof media.rows)[number]): MediaItem => ({
    id: Number(r.id),
    src: mediaSrc(r),
    category: r.category ? String(r.category) : null,
    focal: r.focal ? String(r.focal) : "50% 30%",
    alt: { es: String(r.alt_es), en: String(r.alt_en) },
  });
  const ofKind = (kind: string) => media.rows.filter((r) => r.kind === kind);
  const shots: Record<string, MediaItem[]> = {};
  for (const r of ofKind("shot")) (shots[String(r.group_key)] ??= []).push(toItem(r));

  return {
    media: {
      hero: ofKind("hero")[0] ? mediaSrc(ofKind("hero")[0]) : null,
      about: ofKind("about")[0] ? mediaSrc(ofKind("about")[0]) : null,
      gallery: ofKind("gallery").map(toItem),
      shots,
    },
    brands: brands.rows.map((r) => ({
      id: Number(r.id),
      name: String(r.name),
      url: r.url ? String(r.url) : null,
      logo: Number(r.has_data)
        ? `/api/brands/${r.id}/logo?v=${r.logo_version}`
        : r.logo_url
        ? String(r.logo_url)
        : null,
    })),
    packages: packages.rows.map((r) => ({
      id: Number(r.id),
      name: String(r.name),
      price: String(r.price),
      popular: Number(r.popular) === 1,
      description: { es: String(r.description_es), en: String(r.description_en) },
      features: { es: parseList(r.features_es), en: parseList(r.features_en) },
    })),
    videos: videos.rows.map((r) => ({
      id: Number(r.id),
      title: String(r.title),
      url: String(r.url),
    })),
    settings: {
      ...DEFAULT_SETTINGS,
      // Only known keys: the table also holds internal seed markers.
      ...Object.fromEntries(
        settings.rows.filter((r) => String(r.key) in DEFAULT_SETTINGS).map((r) => [String(r.key), String(r.value)])
      ),
    },
  };
}

/** Only http(s) links are stored; blocks javascript:, data: and similar schemes. */
export function safeHttpUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try {
    const u = new URL(value.trim());
    return u.protocol === "http:" || u.protocol === "https:" ? u.toString() : null;
  } catch {
    return null;
  }
}
