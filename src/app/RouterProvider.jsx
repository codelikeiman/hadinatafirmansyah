import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { RouterContext, readHashPath } from "./router-context";
import { findRoute } from "./routes";
import { prefersReducedMotion, supportsViewTransitions } from "../lib/media";
import { getLenis, scrollTo } from "../lib/scroll";

const TITLE_SUFFIX = "firman@porto:~";

// posisi pointer terakhir → titik pusat transisi "warp" (circle reveal)
const pointer = { x: 0, y: 0, t: 0 };

function applyTitle(path) {
  const r = findRoute(path);
  document.title = path === "/" ? TITLE_SUFFIX : `${r.name} — ${TITLE_SUFFIX}`;
}

function currentScroll() {
  return getLenis()?.scroll ?? window.scrollY;
}

/**
 * Router hash berbasis View Transitions API.
 *  - chunk halaman tujuan di-preload dulu → snapshot transisi selalu berisi konten final
 *  - klik mouse → transisi "warp" (lingkaran dari titik klik); keyboard → "glitch"; back → "back"
 *  - posisi scroll tiap halaman diingat & dipulihkan saat back/forward
 *  - fallback mulus untuk browser tanpa VT / prefers-reduced-motion
 */
export default function RouterProvider({ children }) {
  const [path, setPath] = useState(readHashPath);
  const pathRef = useRef(path);
  const scrolls = useRef(new Map());
  const navId = useRef(0);

  const commit = useCallback((to, { push, restore }) => {
    scrolls.current.set(pathRef.current, currentScroll());
    flushSync(() => setPath(to));
    pathRef.current = to;
    if (push) window.history.pushState({ path: to }, "", "#" + to);
    applyTitle(to);
    const y = restore ? scrolls.current.get(to) ?? 0 : 0;
    scrollTo(y, { immediate: true, offset: 0 });
  }, []);

  const transition = useCallback((update, kind) => {
    if (!supportsViewTransitions() || prefersReducedMotion()) {
      update();
      return;
    }
    const root = document.documentElement;
    root.dataset.vt = kind;
    const vt = document.startViewTransition(update);
    // transisi bisa dibatalkan browser (mis. viewport mobile berubah) → promise `ready` reject;
    // DOM tetap ter-update oleh callback, jadi cukup redam rejection-nya.
    vt.ready.catch(() => {});
    vt.updateCallbackDone.catch(err => console.error("[router]", err));
    vt.finished.catch(() => {}).finally(() => {
      if (root.dataset.vt === kind) delete root.dataset.vt;
    });
  }, []);

  const go = useCallback(
    async (to, kind, opts) => {
      const id = ++navId.current;
      // chunk gagal dimuat → tetap navigasi; ErrorBoundary halaman yang menangani
      await findRoute(to).page.preload().catch(() => {});
      if (id !== navId.current) return; // ada navigasi yang lebih baru
      transition(() => commit(to, opts), kind);
    },
    [commit, transition],
  );

  const navigate = useCallback(
    (to, { replace = false } = {}) => {
      const target = to.startsWith("/") ? to : "/" + to;
      if (target === pathRef.current) {
        scrollTo(0, { offset: 0 });
        return;
      }
      const fromPointer = performance.now() - pointer.t < 900;
      if (fromPointer) {
        document.documentElement.style.setProperty("--vt-x", pointer.x + "px");
        document.documentElement.style.setProperty("--vt-y", pointer.y + "px");
      }
      return go(target, fromPointer ? "warp" : "glitch", { push: !replace, restore: false });
    },
    [go],
  );

  useEffect(() => {
    applyTitle(pathRef.current);
    if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";
    // normalisasi URL awal ("" / "#" → "#/") tanpa menambah entri history
    if (!window.location.hash.startsWith("#/")) window.history.replaceState({ path: pathRef.current }, "", "#" + pathRef.current);

    const onPointer = e => { pointer.x = e.clientX; pointer.y = e.clientY; pointer.t = performance.now(); };
    // hashchange: tombol back/forward, link <a href="#/..."> biasa, atau URL diketik manual
    const onHash = () => {
      const to = readHashPath();
      if (to === pathRef.current) return;
      go(to, "back", { push: false, restore: true });
    };
    window.addEventListener("pointerdown", onPointer, { capture: true, passive: true });
    window.addEventListener("hashchange", onHash);
    return () => {
      window.removeEventListener("pointerdown", onPointer, { capture: true });
      window.removeEventListener("hashchange", onHash);
    };
  }, [go]);

  const value = useMemo(() => ({ path, route: findRoute(path), navigate }), [path, navigate]);
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}
