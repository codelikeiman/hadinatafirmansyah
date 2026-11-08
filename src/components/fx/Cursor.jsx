import { useEffect, useRef } from "react";
import { useFinePointer, prefersReducedMotion } from "../../lib/media";
import { useFx } from "../../lib/fx-store";

const INTERACTIVE = "a,button,[role=button],[data-cursor],summary,label,select,.ndot,.pod-row,.cinfo-row";
const TEXT = "input:not([type=range]):not([type=checkbox]),textarea,[contenteditable=true]";

/**
 * Kursor "reticle": titik fosfor + bracket penarget yang mengunci (snap) ke
 * bounding box elemen interaktif, berubah jadi I-beam di input, dan label
 * dari atribut `data-cursor`. Semua update lewat DOM langsung di rAF —
 * nol re-render React. Loop berhenti sendiri saat diam.
 */
export default function Cursor() {
  const fine = useFinePointer();
  const { cursor } = useFx();
  const enabled = fine && cursor;
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const labelRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;
    const html = document.documentElement;
    const dot = dotRef.current, ring = ringRef.current, label = labelRef.current;
    html.classList.add("has-cursor");
    const still = prefersReducedMotion();

    const S = { mx: -100, my: -100, x: -100, y: -100, w: 30, h: 30, target: null, mode: "idle", raf: 0, idle: 0 };

    const setMode = mode => {
      if (S.mode === mode) return;
      S.mode = mode;
      ring.dataset.mode = mode;
    };

    const frame = () => {
      let tx = S.mx, ty = S.my, tw = 30, th = 30;
      const t = S.target;
      if (t && t.isConnected && S.mode === "lock") {
        const r = t.getBoundingClientRect();
        tw = r.width + 12;
        th = r.height + 10;
        // magnet: tetap condong sedikit ke arah pointer
        tx = r.left + r.width / 2 + (S.mx - (r.left + r.width / 2)) * 0.1;
        ty = r.top + r.height / 2 + (S.my - (r.top + r.height / 2)) * 0.1;
      } else if (S.mode === "text") {
        tw = 3;
        th = 26;
      }
      const k = still ? 1 : 0.24;
      S.x += (tx - S.x) * k;
      S.y += (ty - S.y) * k;
      S.w += (tw - S.w) * (still ? 1 : 0.28);
      S.h += (th - S.h) * (still ? 1 : 0.28);
      ring.style.transform = `translate3d(${S.x - S.w / 2}px,${S.y - S.h / 2}px,0)`;
      ring.style.width = S.w + "px";
      ring.style.height = S.h + "px";
      dot.style.transform = `translate3d(${S.mx}px,${S.my}px,0)`;
      label.style.transform = `translate3d(${S.x + S.w / 2 + 8}px,${S.y - S.h / 2 - 4}px,0)`;
      const moving = Math.abs(tx - S.x) + Math.abs(ty - S.y) + Math.abs(tw - S.w) + Math.abs(th - S.h) > 0.4;
      S.idle = moving || S.mode === "lock" ? 0 : S.idle + 1;
      S.raf = S.idle > 2 ? 0 : requestAnimationFrame(frame);
    };
    const kick = () => { if (!S.raf) S.raf = requestAnimationFrame(frame); };

    const onMove = e => {
      S.mx = e.clientX;
      S.my = e.clientY;
      html.classList.remove("cursor-hidden");
      kick();
    };
    const onOver = e => {
      const el = e.target instanceof Element ? e.target : null;
      const txt = el?.closest(TEXT);
      const hit = txt ? null : el?.closest(INTERACTIVE);
      // area interaktif besar (canvas, kartu lebar) → jangan snap, cukup tampilkan label
      const big = hit ? (() => { const r = hit.getBoundingClientRect(); return r.width > 420 || r.height > 220; })() : false;
      S.target = big ? null : hit;
      setMode(txt ? "text" : hit && !big ? "lock" : "idle");
      const text = hit?.getAttribute("data-cursor") || "";
      label.textContent = text;
      label.dataset.show = text ? "1" : "0";
      kick();
    };
    const onDown = () => {
      ring.dataset.down = "1";
      const p = document.createElement("span");
      p.className = "cursor-ping";
      p.style.left = S.mx + "px";
      p.style.top = S.my + "px";
      document.body.appendChild(p);
      p.addEventListener("animationend", () => p.remove(), { once: true });
    };
    const onUp = () => { ring.dataset.down = "0"; };
    const onLeave = e => { if (!e.relatedTarget) html.classList.add("cursor-hidden"); };

    addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    addEventListener("pointerdown", onDown, { passive: true });
    addEventListener("pointerup", onUp, { passive: true });
    document.addEventListener("pointerout", onLeave, { passive: true });
    return () => {
      cancelAnimationFrame(S.raf);
      html.classList.remove("has-cursor", "cursor-hidden");
      removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      removeEventListener("pointerdown", onDown);
      removeEventListener("pointerup", onUp);
      document.removeEventListener("pointerout", onLeave);
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <div className="cursor-layer" aria-hidden="true">
      <div ref={ringRef} className="cursor-ring" data-mode="idle"><i /><i /><i /><i /></div>
      <div ref={dotRef} className="cursor-dot" />
      <div ref={labelRef} className="cursor-label" data-show="0" />
    </div>
  );
}
