import { useEffect, useRef } from "react";
import { useInViewport } from "../../lib/useInViewport";
import { prefersReducedMotion } from "../../lib/media";
import { cn } from "../../lib/cn";

/** Magic UI — FlickeringGrid: grid kotak kecil yang berkedip acak (canvas, pause di luar viewport). */
export default function FlickeringGrid({ squareSize = 4, gridGap = 6, flickerChance = 0.3, color = "rgb(0,255,65)", maxOpacity = 0.3, className }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const active = useInViewport(wrapRef);

  useEffect(() => {
    const canvas = canvasRef.current, wrap = wrapRef.current;
    if (!canvas || !wrap || !active) return;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let cols = 0, rows = 0, squares = new Float32Array(0), raf = 0, last = 0;
    const rgba = color.replace("rgb(", "rgba(").replace(")", ",");

    const setup = () => {
      const r = { width: wrap.clientWidth, height: wrap.clientHeight }; // ukuran layout, bebas transform
      canvas.width = r.width * dpr; canvas.height = r.height * dpr;
      canvas.style.width = r.width + "px"; canvas.style.height = r.height + "px";
      cols = Math.ceil(r.width / (squareSize + gridGap));
      rows = Math.ceil(r.height / (squareSize + gridGap));
      squares = new Float32Array(cols * rows).map(() => Math.random() * maxOpacity);
    };
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
        ctx.fillStyle = `${rgba}${squares[i * rows + j]})`;
        ctx.fillRect(i * (squareSize + gridGap) * dpr, j * (squareSize + gridGap) * dpr, squareSize * dpr, squareSize * dpr);
      }
    };
    const loop = t => {
      raf = requestAnimationFrame(loop);
      const dt = (t - last) / 1000;
      if (dt < 1 / 30) return;
      last = t;
      for (let i = 0; i < squares.length; i++) if (Math.random() < flickerChance * dt) squares[i] = Math.random() * maxOpacity;
      draw();
    };
    setup();
    draw();
    if (!prefersReducedMotion()) raf = requestAnimationFrame(loop);
    const ro = new ResizeObserver(() => { setup(); draw(); });
    ro.observe(wrap);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [active, squareSize, gridGap, flickerChance, color, maxOpacity]);

  return (
    <div ref={wrapRef} className={cn("pointer-events-none absolute inset-0", className)} aria-hidden="true">
      <canvas ref={canvasRef} className="block" />
    </div>
  );
}
