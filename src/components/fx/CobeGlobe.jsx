import { useEffect, useRef } from "react";
import createGlobe from "cobe";
import { useInViewport } from "../../lib/useInViewport";
import { canUseWebGL, prefersReducedMotion } from "../../lib/media";
import { cn } from "../../lib/cn";
import { focusAngles, projectMarker } from "../../lib/geo";

/**
 * Globe cobe v2 (WebGL, ~5KB) dengan marker, arc, auto-rotate, drag + inertia,
 * fokus ke lokasi, dan label HTML yang menempel ke marker. Posisi label
 * dihitung dengan matematika proyeksi yang sama persis dengan cobe, jadi
 * jalan di semua browser (tanpa CSS anchor positioning).
 *
 * markers: [{ id, location:[lat,lng], size, color?, label? }]
 * arcs:    [{ id, from:[lat,lng], to:[lat,lng], color? }]
 */
export default function CobeGlobe({
  markers = [], arcs = [], focus = null, speed = 0.0035, className,
  baseColor = [0.04, 0.22, 0.09], markerColor = [0, 1, 0.26], glowColor = [0, 0.42, 0.13],
  arcColor = [0, 0.94, 1], dark = 1, diffuse = 1.25, mapBrightness = 7, theta = 0.28,
  renderLabel,
}) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const labelsRef = useRef(null);
  const visible = useInViewport(wrapRef);
  // data terbaru dibaca loop rAF lewat ref → tidak perlu membuat ulang globe
  const live = useRef({ markers, arcs, focus });
  useEffect(() => {
    live.current = { markers, arcs, focus, dirty: true };
  }, [markers, arcs, focus]);

  useEffect(() => {
    const wrap = wrapRef.current, canvas = canvasRef.current;
    if (!wrap || !canvas || !visible || !canUseWebGL()) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = wrap.offsetWidth || 400;
    const still = prefersReducedMotion();
    const state = { phi: focus ? focusAngles(focus)[0] : 0, theta, vPhi: 0, dragging: false, lastX: 0, lastY: 0 };

    let globe;
    try {
      globe = createGlobe(canvas, {
        devicePixelRatio: dpr, width: width * dpr, height: width * dpr,
        phi: state.phi, theta: state.theta, dark, diffuse, mapSamples: 16000, mapBrightness,
        baseColor, markerColor, glowColor, arcColor, arcWidth: 0.6, arcHeight: 0.28, markerElevation: 0.015,
        markers: live.current.markers, arcs: live.current.arcs,
      });
    } catch {
      return;
    }
    canvas.style.opacity = "1";

    const onDown = e => {
      state.dragging = true;
      state.lastX = e.clientX;
      state.lastY = e.clientY;
      canvas.setPointerCapture?.(e.pointerId);
      canvas.style.cursor = "grabbing";
    };
    const onMove = e => {
      if (!state.dragging) return;
      const dx = e.clientX - state.lastX, dy = e.clientY - state.lastY;
      state.lastX = e.clientX;
      state.lastY = e.clientY;
      state.vPhi = dx * 0.005;
      state.phi += dx * 0.005;
      state.theta = Math.max(-0.9, Math.min(0.9, state.theta + dy * 0.004));
      live.current.focus = null; // user mengambil alih
    };
    const onUp = () => { state.dragging = false; canvas.style.cursor = "grab"; };
    canvas.addEventListener("pointerdown", onDown);
    addEventListener("pointermove", onMove, { passive: true });
    addEventListener("pointerup", onUp, { passive: true });

    const ro = new ResizeObserver(() => { width = wrap.offsetWidth || width; });
    ro.observe(wrap);

    const syncLabels = () => {
      const host = labelsRef.current;
      if (!host) return;
      const byId = new Map(live.current.markers.map(m => [m.id, m]));
      for (const el of host.children) {
        const m = byId.get(el.dataset.id);
        if (!m) continue;
        const p = projectMarker(m.location, state.phi, state.theta);
        el.style.left = p.x * 100 + "%";
        el.style.top = p.y * 100 + "%";
        el.style.opacity = p.visible ? "1" : "0";
      }
    };

    let raf = 0;
    const frame = () => {
      const L = live.current;
      if (L.dirty) {
        L.dirty = false;
        globe.update({ markers: L.markers, arcs: L.arcs });
      }
      if (!state.dragging) {
        if (L.focus) {
          const [fp, ft] = focusAngles(L.focus);
          // jalur terpendek ke target
          const dp = Math.atan2(Math.sin(fp - state.phi), Math.cos(fp - state.phi));
          state.phi += dp * 0.06;
          state.theta += (ft * 0.85 - state.theta) * 0.06;
        } else {
          state.vPhi *= 0.95;
          state.phi += state.vPhi + (still ? 0 : speed);
        }
      }
      globe.update({ phi: state.phi, theta: state.theta, width: width * dpr, height: width * dpr });
      syncLabels();
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      removeEventListener("pointermove", onMove);
      removeEventListener("pointerup", onUp);
      globe.destroy();
      // cobe membungkus canvas dengan div baru; kembalikan struktur DOM semula
      const shell = canvas.parentElement;
      if (shell && shell !== wrap && shell.parentElement === wrap) {
        wrap.insertBefore(canvas, shell);
        shell.remove();
      }
    };
    // warna/tema dianggap statis per instance; data dinamis lewat `live`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  return (
    <div ref={wrapRef} className={cn("relative aspect-square w-full select-none", className)}>
      <canvas ref={canvasRef} className="size-full cursor-grab opacity-0 transition-opacity duration-1000 [contain:layout_paint_size]" />
      <div ref={labelsRef} className="pointer-events-none absolute inset-0" aria-hidden="true">
        {markers.filter(m => m.id && (m.label || renderLabel)).map(m => (
          <div
            key={m.id}
            data-id={m.id}
            className="absolute -translate-x-1/2 -translate-y-[calc(100%+10px)] opacity-0 transition-opacity duration-300"
          >
            {renderLabel ? renderLabel(m) : (
              <span className="whitespace-nowrap border border-g bg-black/80 px-1.5 py-0.5 text-[10px] tracking-widest text-g shadow-[0_0_12px_#00ff4155]">{m.label}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
