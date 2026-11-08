import { useEffect, useRef } from "react";
import { useFx } from "../../lib/fx-store";
import { prefersReducedMotion } from "../../lib/media";

const CHARS = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄ01ABCDEF<>{}$#/|=+*".split("");

/** Hujan karakter ala cmatrix: 24fps, berhenti saat tab tersembunyi, bereaksi ke kursor. */
export default function MatrixRain({ opacity = 0.28 }) {
  const ref = useRef(null);
  const { rain } = useFx();

  useEffect(() => {
    if (!rain || prefersReducedMotion()) return;
    const c = ref.current;
    const x = c.getContext("2d", { alpha: false });
    const size = 16, gap = 1000 / 24;
    let w = 0, h = 0, drops = [], raf = 0, last = 0;
    const m = { x: -999, y: -999 };
    const fit = () => {
      w = c.width = innerWidth;
      h = c.height = innerHeight;
      x.fillStyle = "#000";
      x.fillRect(0, 0, w, h);
      drops = Array.from({ length: Math.ceil(w / size) }, () => Math.random() * -50);
    };
    const mv = e => { m.x = e.clientX; m.y = e.clientY; };
    fit();
    addEventListener("resize", fit);
    addEventListener("pointermove", mv, { passive: true });
    const draw = t => {
      raf = requestAnimationFrame(draw);
      if (document.hidden || t - last < gap) return;
      last = t;
      x.fillStyle = "rgba(0,0,0,.1)";
      x.fillRect(0, 0, w, h);
      x.font = size + "px monospace";
      for (let i = 0; i < drops.length; i++) {
        const d = drops[i], px = i * size, py = d * size;
        const dx = px - m.x, dy = py - m.y, near = dx * dx + dy * dy < 19600;
        x.fillStyle = near ? "#fff" : d % 7 < 1 ? "#c2ffd3" : "#00ff41";
        x.fillText(CHARS[(Math.random() * CHARS.length) | 0], px, py);
        if (py > h && Math.random() > 0.975) drops[i] = 0;
        else drops[i] += near ? 0.3 : 1;
      }
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("resize", fit);
      removeEventListener("pointermove", mv);
    };
  }, [rain]);

  if (!rain) return null;
  return <canvas ref={ref} aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: 0, opacity, pointerEvents: "none" }} />;
}
