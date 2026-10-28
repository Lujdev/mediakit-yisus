"use client";

import { useEffect } from "react";

const KEY = "yisus-last-hit";
/** Matches the server: the same visitor is not counted twice within this window. */
const WINDOW_MS = 15 * 60 * 1000;

function send(landing: boolean, tag: string | null) {
  const data = JSON.stringify({
    path: location.pathname,
    // The referrer only describes how the page was first opened; a later return to the same tab is not that click.
    referrer: landing ? document.referrer : "",
    lang: navigator.language,
    // A tag in the link (?utm_source=whatsapp) is the only reliable way to know a WhatsApp click.
    tag: landing ? tag : null,
  });
  if (!navigator.sendBeacon?.("/api/hi", new Blob([data], { type: "application/json" }))) {
    fetch("/api/hi", { method: "POST", body: data, keepalive: true }).catch(() => {});
  }
}

/**
 * Sends a page-view beacon on load and again whenever someone comes back after at least 15 minutes
 * (re-opened tab, phone woken up, page restored from the back-forward cache). Renders nothing.
 * The endpoint is deliberately named /api/hi: content blockers on phones commonly cut URLs containing "track".
 */
export default function Tracker() {
  useEffect(() => {
    // Read the tag first, then tidy the address bar so a tagged link does not stay visible (or get re-shared).
    const q = new URLSearchParams(location.search);
    const tag = q.get("utm_source") || q.get("src") || q.get("ref");
    if (q.has("utm_source") || q.has("src") || q.has("ref")) {
      ["utm_source", "src", "ref"].forEach((k) => q.delete(k));
      history.replaceState(null, "", location.pathname + (q.toString() ? `?${q}` : "") + location.hash);
    }

    let landing = true;
    const maybeTrack = () => {
      let last = 0;
      try {
        last = Number(localStorage.getItem(KEY) || 0);
      } catch {}
      if (Date.now() - last < WINDOW_MS) return;
      try {
        localStorage.setItem(KEY, String(Date.now()));
      } catch {}
      send(landing, tag);
      landing = false;
    };

    maybeTrack();

    const onVisible = () => document.visibilityState === "visible" && maybeTrack();
    const onShow = (e: PageTransitionEvent) => e.persisted && maybeTrack();
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("pageshow", onShow);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("pageshow", onShow);
    };
  }, []);
  return null;
}
