import { useEffect } from "react";

/**
 * Tilt 3D + spotlight yang mengikuti kursor untuk kartu (.fx-card, .log-box,
 * .pod-row-wrap). Satu listener global, maksimal 1 update per frame,
 * bounding rect di-cache selama pointer di kartu yang sama.
 */
export function useGlobalTilt() {
  useEffect(() => {
    const sel = ".pod-row-wrap,.log-box,.fx-card";
    let el = null, rect = null, ev = null, raf = 0;
    const reset = t => { t.style.setProperty("--rx", "0deg"); t.style.setProperty("--ry", "0deg"); };
    const apply = () => {
      raf = 0;
      if (!el) return;
      rect ||= el.getBoundingClientRect();
      const px = (ev.clientX - rect.left) / rect.width, py = (ev.clientY - rect.top) / rect.height;
      el.style.setProperty("--mx", px * 100 + "%");
      el.style.setProperty("--my", py * 100 + "%");
      el.style.setProperty("--ry", (px - 0.5) * 8 + "deg");
      el.style.setProperty("--rx", (0.5 - py) * 8 + "deg");
    };
    const mv = e => {
      ev = e;
      const t = e.target.closest?.(sel) || null;
      if (t !== el) { if (el) reset(el); el = t; rect = null; }
      if (el && !raf) raf = requestAnimationFrame(apply);
    };
    const out = e => { if (el && !e.relatedTarget) { reset(el); el = null; } };
    const sc = () => { rect = null; };
    addEventListener("pointermove", mv, { passive: true });
    addEventListener("pointerout", out);
    addEventListener("scroll", sc, { passive: true, capture: true });
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("pointermove", mv);
      removeEventListener("pointerout", out);
      removeEventListener("scroll", sc, true);
    };
  }, []);
}
