import { useSyncExternalStore } from "react";

// Preferensi efek visual (bisa di-toggle lewat command palette), disimpan per-browser.
const KEY = "firman.fx.v1";
const DEFAULTS = { crt: true, rain: true, cursor: true };

function load() {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || "{}") };
  } catch {
    return { ...DEFAULTS };
  }
}

let state = typeof window !== "undefined" ? load() : { ...DEFAULTS };
const subs = new Set();

export function setFx(patch) {
  state = { ...state, ...(typeof patch === "function" ? patch(state) : patch) };
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage diblokir (mode privat) → cukup simpan di memori */
  }
  subs.forEach(fn => fn());
}

export const toggleFx = key => setFx(s => ({ [key]: !s[key] }));
export const getFx = () => state;

const subscribe = fn => {
  subs.add(fn);
  return () => subs.delete(fn);
};

export const useFx = () => useSyncExternalStore(subscribe, getFx, getFx);
