export type ParsedUA = {
  bot: boolean;
  device: "mobile" | "tablet" | "desktop";
  os: string;
  browser: string;
};

const BOT = /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|facebookexternalhit|whatsapp|telegram|discord|curl|wget|python-requests|axios|node-fetch|go-http|monitor|uptime|vercel/i;

/** Small, dependency-free user-agent reading: enough for the dashboard, not a full parser. */
export function parseUserAgent(ua: string): ParsedUA {
  if (!ua || BOT.test(ua)) return { bot: true, device: "desktop", os: "Otro", browser: "Otro" };

  const tablet = /iPad|Tablet|Android(?!.*Mobile)/i.test(ua);
  const mobile = !tablet && /Mobi|iPhone|iPod|Android/i.test(ua);

  const os = /iPhone|iPad|iPod/i.test(ua)
    ? "iOS"
    : /Android/i.test(ua)
    ? "Android"
    : /Windows/i.test(ua)
    ? "Windows"
    : /Mac OS X|Macintosh/i.test(ua)
    ? "macOS"
    : /CrOS/i.test(ua)
    ? "ChromeOS"
    : /Linux/i.test(ua)
    ? "Linux"
    : "Otro";

  // Order matters: Edge/Opera/Samsung/Chrome-on-iOS all also say "Chrome" or "Safari".
  const browser = /EdgA?\/|Edg\//.test(ua)
    ? "Edge"
    : /OPR\/|Opera/.test(ua)
    ? "Opera"
    : /SamsungBrowser/.test(ua)
    ? "Samsung Internet"
    : /FxiOS|Firefox/.test(ua)
    ? "Firefox"
    : /CriOS|Chrome\//.test(ua)
    ? "Chrome"
    : /Safari\//.test(ua)
    ? "Safari"
    : "Otro";

  return { bot: false, device: tablet ? "tablet" : mobile ? "mobile" : "desktop", os, browser };
}
