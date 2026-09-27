"use client";

import { useSyncExternalStore } from "react";

/**
 * Learning progress, saved in this browser only (no accounts in v1).
 * Each store is { [key]: ISO date done } under one localStorage key.
 */
type Done = Record<string, string>;

function createStore(storageKey: string) {
  const event = `${storageKey}:change`;
  let lastRaw: string | null = null;
  let lastDone: Done = {};

  const readRaw = () => {
    try {
      return window.localStorage.getItem(storageKey);
    } catch {
      return null;
    }
  };

  const snapshot = (): Done => {
    const raw = readRaw();
    if (raw !== lastRaw) {
      lastRaw = raw;
      try {
        const parsed = raw ? JSON.parse(raw) : {};
        lastDone = parsed && typeof parsed === "object" ? (parsed as Done) : {};
      } catch {
        lastDone = {};
      }
    }
    return lastDone;
  };

  const subscribe = (cb: () => void) => {
    const onStorage = (e: StorageEvent) => e.key === storageKey && cb();
    window.addEventListener(event, cb);
    window.addEventListener("storage", onStorage); // other tabs
    return () => {
      window.removeEventListener(event, cb);
      window.removeEventListener("storage", onStorage);
    };
  };

  const set = (key: string, done: boolean) => {
    const all = { ...snapshot() };
    if (done) all[key] = new Date().toISOString();
    else delete all[key];
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(all));
    } catch {
      // Private mode or storage full: progress just isn't remembered.
    }
    window.dispatchEvent(new Event(event));
  };

  const empty: Done = {};
  const useStore = () => useSyncExternalStore(subscribe, snapshot, () => empty);
  return { set, useStore };
}

/** Finished deep dives, by dive slug. */
const dives = createStore("ft:progress:v1");
export const setDone = dives.set;
export const useProgress = dives.useStore;

/**
 * Finished stages ("track/stage") and ticked checklist items ("track/stage#index").
 */
const stages = createStore("ft:stages:v1");
export const setStageMark = stages.set;
export const useStageMarks = stages.useStore;
export const stageKey = (track: string, stage: string) => `${track}/${stage}`;
export const checkKey = (track: string, stage: string, i: number) => `${track}/${stage}#${i}`;
