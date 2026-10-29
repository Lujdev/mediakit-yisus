/**
 * Video link previews. Resolves a cover image for the social links the admin pastes
 * (Instagram Reels, TikTok, YouTube) without any API keys or extra columns in the DB,
 * so a link added today gets its thumbnail on the next render.
 *
 * Server-only: it fetches third-party pages, so every URL is checked against a host
 * allowlist before the request (no arbitrary SSRF).
 */

const CRAWLER_UA =
  "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)";
const TIMEOUT_MS = 9000;
const PREVIEW_TTL_MS = 6 * 60 * 60 * 1000;
const IMAGE_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

const VIDEO_HOSTS = ["instagram.com", "tiktok.com", "youtube.com", "youtu.be"];
const IMAGE_HOSTS = [
  "cdninstagram.com",
  "fbcdn.net",
  "tiktokcdn.com",
  "tiktokcdn-us.com",
  "tiktokcdn-eu.com",
  "ytimg.com",
];

export type VideoPreview = { platform: string; image: string };

type ImageEntry = { data: Buffer; type: string; at: number };

const previewCache = new Map<string, { value: VideoPreview | null; at: number }>();
const imageCache = new Map<string, ImageEntry>();

function hostMatches(hostname: string, domains: string[]) {
  return domains.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));
}

function parseHttpUrl(value: unknown): URL | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" || url.protocol === "http:" ? url : null;
  } catch {
    return null;
  }
}

function decodeEntities(value: string) {
  return value
    .replace(/\\u0026/g, "&")
    .replace(/\\\//g, "/")
    .replace(/&amp;/g, "&");
}

function remember(key: string, value: VideoPreview | null) {
  if (previewCache.size > 200) previewCache.clear();
  previewCache.set(key, { value, at: Date.now() });
  return value;
}

async function getPage(url: string) {
  return fetch(url, {
    redirect: "follow",
    headers: { "user-agent": CRAWLER_UA, accept: "text/html,application/xhtml+xml" },
    signal: AbortSignal.timeout(TIMEOUT_MS),
    cache: "no-store",
  });
}

async function instagramCover(url: URL): Promise<string | null> {
  const res = await getPage(url.toString());
  const finalUrl = new URL(res.url);
  if (!hostMatches(finalUrl.hostname, ["instagram.com"])) return null;
  const html = await res.text();
  const match =
    html.match(/<meta property="og:image" content="([^"]+)"/) ??
    html.match(/<meta property="og:image" content='([^']+)'/);
  if (!match) return null;
  const cover = decodeEntities(match[1]);
  const parsed = parseHttpUrl(cover);
  return parsed && hostMatches(parsed.hostname, IMAGE_HOSTS) ? cover : null;
}

async function tiktokCover(url: URL): Promise<string | null> {
  let id = url.pathname.match(/\/video\/(\d+)/)?.[1];
  if (!id) {
    // vt.tiktok.com / vm.tiktok.com short links only reveal the id after the redirect.
    const res = await getPage(url.toString());
    const finalUrl = new URL(res.url);
    if (!hostMatches(finalUrl.hostname, ["tiktok.com"])) return null;
    id = finalUrl.pathname.match(/\/video\/(\d+)/)?.[1];
  }
  if (!id) return null;

  const embed = await getPage(`https://www.tiktok.com/embed/${id}`);
  const html = await embed.text();
  const match =
    html.match(/"coversOrigin":\["([^"]+)"/) ?? html.match(/"covers":\["([^"]+)"/);
  if (!match) return null;
  const cover = decodeEntities(match[1]);
  const parsed = parseHttpUrl(cover);
  return parsed && hostMatches(parsed.hostname, IMAGE_HOSTS) ? cover : null;
}

function youtubeCover(url: URL): string | null {
  const id =
    url.hostname === "youtu.be"
      ? url.pathname.slice(1)
      : url.searchParams.get("v") ?? url.pathname.match(/^\/(?:shorts|embed)\/([\w-]+)/)?.[1];
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
}

/** Cover image for a social video link, or null when the host is not supported. */
export async function resolveVideoPreview(raw: unknown): Promise<VideoPreview | null> {
  const url = parseHttpUrl(raw);
  if (!url || !hostMatches(url.hostname, VIDEO_HOSTS)) return null;

  const key = url.toString();
  const cached = previewCache.get(key);
  if (cached && Date.now() - cached.at < PREVIEW_TTL_MS) return cached.value;

  try {
    let image: string | null = null;
    let platform = "";
    if (hostMatches(url.hostname, ["tiktok.com"])) {
      platform = "TikTok";
      image = await tiktokCover(url);
    } else if (hostMatches(url.hostname, ["instagram.com"])) {
      platform = "Instagram";
      image = await instagramCover(url);
    } else {
      platform = url.hostname === "youtu.be" || url.hostname.endsWith("youtube.com") ? "YouTube" : "";
      image = youtubeCover(url);
    }
    return remember(key, image ? { platform, image } : null);
  } catch {
    // Network hiccups are not cached: the next request gets a fresh try.
    return null;
  }
}

/** Fetches and caches the cover bytes so the browser only talks to our domain. */
export async function fetchPreviewImage(raw: unknown): Promise<{ data: Buffer; type: string } | null> {
  const url = parseHttpUrl(raw);
  if (!url) return null;
  const key = url.toString();

  const cached = imageCache.get(key);
  if (cached && Date.now() - cached.at < IMAGE_TTL_MS) return cached;

  const preview = await resolveVideoPreview(url.toString());
  if (!preview) return null;

  try {
    const res = await fetch(preview.image, {
      headers: { "user-agent": CRAWLER_UA, accept: "image/*" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
    const type = res.headers.get("content-type") ?? "";
    if (!res.ok || !type.startsWith("image/")) return null;
    const data = Buffer.from(await res.arrayBuffer());
    if (!data.length || data.length > MAX_IMAGE_BYTES) return null;
    const entry = { data, type, at: Date.now() };
    if (imageCache.size > 60) imageCache.clear();
    imageCache.set(key, entry);
    return entry;
  } catch {
    return null;
  }
}
