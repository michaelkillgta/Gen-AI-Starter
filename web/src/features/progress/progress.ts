"use client";

import { useSyncExternalStore } from "react";

/**
 * Deep dive progress, saved in this browser only (no accounts in v1).
 * Stored as { [diveSlug]: ISO date finished } under one localStorage key.
 */
const KEY = "ft:progress:v1";
const EVENT = "ft:progress";

type Done = Record<string, string>;

function read(): Done {
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? (parsed as Done) : {};
  } catch {
    return {};
  }
}

function write(done: Done) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(done));
  } catch {
    // Private mode or storage full: progress just isn't remembered.
  }
  window.dispatchEvent(new Event(EVENT));
}

export function setDone(slug: string, done: boolean) {
  const all = read();
  if (done) all[slug] = new Date().toISOString();
  else delete all[slug];
  write(all);
}

function subscribe(cb: () => void) {
  const onStorage = (e: StorageEvent) => e.key === KEY && cb();
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", onStorage); // other tabs
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", onStorage);
  };
}

// Snapshot must be stable between calls, so compare by the raw string.
let lastRaw: string | null = null;
let lastDone: Done = {};
function snapshot(): Done {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    raw = null;
  }
  if (raw !== lastRaw) {
    lastRaw = raw;
    lastDone = read();
  }
  return lastDone;
}

const empty: Done = {};

/** Finished dives. Empty during server rendering, filled in once the page loads. */
export function useProgress(): Done {
  return useSyncExternalStore(subscribe, snapshot, () => empty);
}
