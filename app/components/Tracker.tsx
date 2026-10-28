"use client";

import { useEffect } from "react";

/** Sends one anonymous-looking page-view beacon per browser session. Renders nothing. */
export default function Tracker() {
  useEffect(() => {
    try {
      if (sessionStorage.getItem("yisus-tracked")) return;
      sessionStorage.setItem("yisus-tracked", "1");
    } catch {}
    const data = JSON.stringify({
      path: location.pathname,
      referrer: document.referrer,
      lang: navigator.language,
    });
    if (!navigator.sendBeacon?.("/api/track", new Blob([data], { type: "application/json" }))) {
      fetch("/api/track", { method: "POST", body: data, keepalive: true }).catch(() => {});
    }
  }, []);
  return null;
}
