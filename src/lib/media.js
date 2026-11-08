import { useSyncExternalStore } from "react";

// ─── media query store (tanpa setState di effect → aman untuk React Compiler) ──
const stores = new Map();

function mediaStore(query) {
  let store = stores.get(query);
  if (!store) {
    const mql = typeof window !== "undefined" ? window.matchMedia(query) : null;
    store = {
      subscribe: cb => {
        if (!mql) return () => {};
        mql.addEventListener("change", cb);
        return () => mql.removeEventListener("change", cb);
      },
      get: () => (mql ? mql.matches : false),
    };
    stores.set(query, store);
  }
  return store;
}

export function useMediaQuery(query, serverValue = false) {
  const s = mediaStore(query);
  return useSyncExternalStore(s.subscribe, s.get, () => serverValue);
}

export const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
export const FINE_POINTER = "(hover: hover) and (pointer: fine)";

export const useReducedMotion = () => useMediaQuery(REDUCED_MOTION);
export const useFinePointer = () => useMediaQuery(FINE_POINTER);
export const prefersReducedMotion = () => mediaStore(REDUCED_MOTION).get();
export const hasFinePointer = () => mediaStore(FINE_POINTER).get();

export const supportsViewTransitions = () =>
  typeof document !== "undefined" && typeof document.startViewTransition === "function";

let webgl;
/** Deteksi WebGL sekali saja (dipakai untuk fallback grafis). */
export function canUseWebGL() {
  if (webgl !== undefined) return webgl;
  try {
    const c = document.createElement("canvas");
    webgl = !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    webgl = false;
  }
  return webgl;
}
