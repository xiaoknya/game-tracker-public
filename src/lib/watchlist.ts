"use client";

import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "game-tracker-public-watchlist";
const CHANGE_EVENT = "game-tracker-watchlist-change";

function readIds(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    if (!value) return [];
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(Number).filter((id) => Number.isFinite(id));
  } catch {
    return [];
  }
}

function writeIds(ids: number[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...new Set(ids)]));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function useWatchlistIds() {
  const [ids, setIds] = useState<number[]>([]);

  useEffect(() => {
    const sync = () => setIds(readIds());
    sync();
    window.addEventListener(CHANGE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return useMemo(() => ids, [ids]);
}

export function isWatchlisted(id: number) {
  return readIds().includes(id);
}

export function toggleWatchlist(id: number) {
  const ids = readIds();
  if (ids.includes(id)) {
    writeIds(ids.filter((item) => item !== id));
    return false;
  }
  writeIds([id, ...ids]);
  return true;
}

export function clearWatchlist() {
  writeIds([]);
}
