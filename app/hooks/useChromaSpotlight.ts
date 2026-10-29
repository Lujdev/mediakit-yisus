"use client";

import { useEffect, useRef } from "react";

/**
 * Chroma Grid spotlight (React Bits). Photos stay desaturated until a soft circle follows
 * the pointer and brings their colour back. Cards expose their offset to the root, so one
 * blob of colour spans the whole grid instead of one per photo.
 *
 * Coarse pointers and reduced-motion visitors get the normal photos: no chasing spotlight.
 */
export function useChromaSpotlight<T extends HTMLElement>() {
  const rootRef = useRef<T>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const fine = window.matchMedia("(any-hover: hover) and (any-pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) {
      root.dataset.chroma = "off";
      return;
    }
    root.dataset.chroma = "on";

    const state = { x: 0, y: 0, tx: 0, ty: 0, power: 0, target: 0, primed: false };
    let raf = 0;
    let last = 0;

    // Cards and root scroll together, so their offsets only change on resize/reflow.
    const place = () => {
      const box = root.getBoundingClientRect();
      root.querySelectorAll<HTMLElement>("[data-chroma-card]").forEach((node) => {
        const rect = node.getBoundingClientRect();
        node.style.setProperty("--chroma-ox", `${rect.left - box.left}px`);
        node.style.setProperty("--chroma-oy", `${rect.top - box.top}px`);
      });
    };

    const frame = (now: number) => {
      raf = 0;
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
      last = now;

      const follow = 1 - Math.exp(-dt / 0.14);
      state.x += (state.tx - state.x) * follow;
      state.y += (state.ty - state.y) * follow;

      const span = state.target > state.power ? 0.1 : 0.2;
      state.power += (state.target - state.power) * (1 - Math.exp(-dt / span));

      root.style.setProperty("--chroma-x", `${state.x.toFixed(2)}px`);
      root.style.setProperty("--chroma-y", `${state.y.toFixed(2)}px`);
      root.style.setProperty("--chroma-power", state.power.toFixed(4));

      const settled =
        Math.abs(state.tx - state.x) < 0.1 &&
        Math.abs(state.ty - state.y) < 0.1 &&
        Math.abs(state.target - state.power) < 0.002;

      if (settled) {
        state.power = state.target;
        root.style.setProperty("--chroma-power", state.power.toFixed(4));
        last = 0;
      } else {
        raf = requestAnimationFrame(frame);
      }
    };

    const wake = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };

    const onMove = (event: PointerEvent) => {
      const box = root.getBoundingClientRect();
      state.tx = event.clientX - box.left;
      state.ty = event.clientY - box.top;
      if (!state.primed || state.power < 0.02) {
        state.x = state.tx;
        state.y = state.ty;
        state.primed = true;
      }
      state.target = 1;
      wake();
    };

    const onLeave = () => {
      state.target = 0;
      wake();
    };

    const observer = new ResizeObserver(place);
    observer.observe(root);
    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerdown", onMove);
    root.addEventListener("pointerleave", onLeave);
    root.addEventListener("pointercancel", onLeave);
    place();

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerdown", onMove);
      root.removeEventListener("pointerleave", onLeave);
      root.removeEventListener("pointercancel", onLeave);
    };
  }, []);

  return rootRef;
}
