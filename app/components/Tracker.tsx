"use client";

import { useEffect } from "react";

/** Sends one anonymous-looking page-view beacon per browser session. Renders nothing. */
export default function Tracker() {
  useEffect(() => {
    try {
      if (sessionStorage.getItem("yisus-tracked")) return;
      sessionStorage.setItem("yisus-tracked", "1");
    } catch {}
    // A tag in the link (?utm_source=whatsapp) is the only reliable way to know a WhatsApp click.
    const q = new URLSearchParams(location.search);
    const data = JSON.stringify({
      path: location.pathname,
      referrer: document.referrer,
      lang: navigator.language,
      tag: q.get("utm_source") || q.get("src") || q.get("ref"),
    });
    if (!navigator.sendBeacon?.("/api/track", new Blob([data], { type: "application/json" }))) {
      fetch("/api/track", { method: "POST", body: data, keepalive: true }).catch(() => {});
    }
  }, []);
  return null;
}
