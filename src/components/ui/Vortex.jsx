import { useEffect, useRef } from "react";
import { createNoise3D } from "simplex-noise";
import { seeded } from "../../lib/random";
import { useInViewport } from "../../lib/useInViewport";
import { prefersReducedMotion } from "../../lib/media";
import { cn } from "../../lib/cn";

const TAU = Math.PI * 2;

/**
 * Aceternity — Vortex: ratusan partikel mengalir di medan simplex-noise,
 * meninggalkan jejak bercahaya. Loop berhenti saat di luar viewport.
 */
export default function Vortex({ children, className, containerClassName, particleCount = 520, baseHue = 135, rangeHue = 60, baseSpeed = 0.1, rangeSpeed = 1.4, baseRadius = 1, rangeRadius = 2, rangeY = 120, backgroundColor = "#000" }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const active = useInViewport(wrapRef);

  useEffect(() => {
    const canvas = canvasRef.current, wrap = wrapRef.current;
    if (!canvas || !wrap || !active) return;
    const ctx = canvas.getContext("2d");
    const rnd = seeded(42);
    const noise3D = createNoise3D(rnd);
    const PROPS = 9;
    const props = new Float32Array(particleCount * PROPS);
    let tick = 0, raf = 0, w = 0, h = 0;
    const center = [0, 0];
    const rand = n => n * rnd();
    const randRange = n => n - rand(2 * n);
    const lerp = (a, b, t) => (1 - t) * a + t * b;
    const fade = (t, max) => { const hm = 0.5 * max; return Math.abs(((t + hm) % max) - hm) / hm; };

    const init = i => {
      const x = rand(w), y = center[1] + randRange(rangeY);
      props.set([x, y, 0, 0, 0, 50 + rand(150), baseSpeed + rand(rangeSpeed), baseRadius + rand(rangeRadius), baseHue + rand(rangeHue)], i);
    };
    const resize = () => {
      w = canvas.width = Math.max(1, wrap.clientWidth);
      h = canvas.height = Math.max(1, wrap.clientHeight);
      center[0] = 0.5 * w; center[1] = 0.5 * h;
    };
    resize();
    for (let i = 0; i < props.length; i += PROPS) init(i);

    const draw = () => {
      tick++;
      ctx.fillStyle = backgroundColor;
      ctx.globalAlpha = 0.2;
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 1;
      for (let i = 0; i < props.length; i += PROPS) {
        const x = props[i], y = props[i + 1];
        const n = noise3D(x * 0.00125, y * 0.00125, tick * 0.0005) * 3 * TAU;
        const vx = lerp(props[i + 2], Math.cos(n), 0.5), vy = lerp(props[i + 3], Math.sin(n), 0.5);
        let life = props[i + 4];
        const ttl = props[i + 5], speed = props[i + 6], x2 = x + vx * speed, y2 = y + vy * speed;
        ctx.lineCap = "round";
        ctx.lineWidth = props[i + 7];
        ctx.strokeStyle = `hsla(${props[i + 8]},100%,60%,${fade(life, ttl)})`;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x2, y2); ctx.stroke();
        life++;
        props[i] = x2; props[i + 1] = y2; props[i + 2] = vx; props[i + 3] = vy; props[i + 4] = life;
        if (x2 > w || x2 < 0 || y2 > h || y2 < 0 || life > ttl) init(i);
      }
      // glow: komposit ulang dengan blur
      ctx.save();
      ctx.filter = "blur(8px) brightness(200%)";
      ctx.globalCompositeOperation = "lighter";
      ctx.drawImage(canvas, 0, 0);
      ctx.restore();
      raf = requestAnimationFrame(draw);
    };
    if (prefersReducedMotion()) { for (let k = 0; k < 60; k++) draw(); cancelAnimationFrame(raf); }
    else raf = requestAnimationFrame(draw);
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [active, particleCount, baseHue, rangeHue, baseSpeed, rangeSpeed, baseRadius, rangeRadius, rangeY, backgroundColor]);

  return (
    <div ref={wrapRef} className={cn("relative h-full w-full overflow-hidden", containerClassName)}>
      <canvas ref={canvasRef} className="absolute inset-0 z-0 size-full" aria-hidden="true" />
      <div className={cn("relative z-10", className)}>{children}</div>
    </div>
  );
}
