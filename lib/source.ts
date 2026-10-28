/**
 * Decides which channel a visit came from. Priority:
 *  1. an explicit tag in the link (?utm_source=instagram), the only reliable signal for WhatsApp;
 *  2. the referrer host (works for Google, YouTube, and Instagram's link redirector);
 *  3. the in-app browser the visitor is using (Instagram / TikTok / Facebook add markers to the user agent);
 *  4. otherwise "Directo".
 */
const TAGS: Record<string, string> = {
  ig: "Instagram", instagram: "Instagram",
  tt: "TikTok", tiktok: "TikTok",
  wa: "WhatsApp", whatsapp: "WhatsApp",
  fb: "Facebook", facebook: "Facebook",
  yt: "YouTube", youtube: "YouTube",
  x: "X", twitter: "X",
  tg: "Telegram", telegram: "Telegram",
  linkedin: "LinkedIn", google: "Google",
};

const HOSTS: [RegExp, string][] = [
  [/(^|\.)instagram\.com$/, "Instagram"],
  [/(^|\.)tiktok\.com$/, "TikTok"],
  [/(^|\.)(whatsapp\.com|wa\.me)$/, "WhatsApp"],
  [/(^|\.)(facebook\.com|fb\.com|fb\.me|messenger\.com)$/, "Facebook"],
  [/(^|\.)(youtube\.com|youtu\.be)$/, "YouTube"],
  [/(^|\.)google\.[a-z.]+$/, "Google"],
  [/(^|\.)(twitter\.com|x\.com|t\.co)$/, "X"],
  [/(^|\.)(t\.me|telegram\.org)$/, "Telegram"],
  [/(^|\.)(linkedin\.com|lnkd\.in)$/, "LinkedIn"],
  [/(^|\.)(bing\.com|duckduckgo\.com|yahoo\.com|ecosia\.org)$/, "Buscador"],
];

const IN_APP: [RegExp, string][] = [
  [/Instagram/i, "Instagram"],
  [/musical_ly|BytedanceWebview|TikTok|trill/i, "TikTok"],
  [/FBAN|FBAV|FB_IAB/i, "Facebook"],
];

export function detectSource(tag: string | null, referrerHost: string | null, ua: string): string {
  if (tag) {
    const t = tag.trim().toLowerCase().slice(0, 40);
    if (TAGS[t]) return TAGS[t];
    if (t) return `Otro (${t})`;
  }
  if (referrerHost) {
    for (const [re, name] of HOSTS) if (re.test(referrerHost)) return name;
    return `Otro (${referrerHost})`;
  }
  for (const [re, name] of IN_APP) if (re.test(ua)) return name;
  return "Directo";
}
