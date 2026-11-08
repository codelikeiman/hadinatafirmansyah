import { useEffect, useRef } from "react";
import { Mesh, Program, Renderer, Triangle } from "ogl";
import { useInViewport } from "../../lib/useInViewport";
import { canUseWebGL, prefersReducedMotion } from "../../lib/media";
import { cn } from "../../lib/cn";
import { SHADER_PRESETS } from "./shader-presets";

const VERT = /* glsl */ `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position, 0.0, 1.0); }
`;

// Domain-warped fbm → palet fosfor → ordered dithering Bayer 8x8 → scanline & vignette.
const FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform vec2 uRes;
uniform vec2 uMouse;
uniform float uMouseOn;
uniform float uIntensity;
uniform float uLevels;
uniform float uDither;
uniform vec3 uColA;
uniform vec3 uColB;
uniform vec3 uColC;
uniform float uScale;

float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = m * p; a *= 0.5; }
  return v;
}
float bayer2(vec2 a) { a = floor(a); return fract(dot(a, vec2(0.5, a.y * 0.75))); }
float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }
float bayer8(vec2 a) { return bayer4(0.5 * a) * 0.25 + bayer2(a); }

void main() {
  vec2 uv = vUv;
  float aspect = uRes.x / max(uRes.y, 1.0);
  vec2 p = vec2(uv.x * aspect, uv.y) * uScale;
  float t = uTime * 0.12;

  // riak dari kursor
  vec2 m = vec2(uMouse.x * aspect, uMouse.y) * uScale;
  float d = distance(p, m);
  float ripple = uMouseOn * exp(-d * d * 2.2) * sin(d * 14.0 - uTime * 4.0);
  p += normalize(p - m + 1e-4) * ripple * 0.08;

  vec2 q = vec2(fbm(p + t), fbm(p + vec2(5.2, 1.3) - t * 1.1));
  vec2 r = vec2(fbm(p + 4.0 * q + vec2(1.7, 9.2) + t * 1.3), fbm(p + 4.0 * q + vec2(8.3, 2.8) - t));
  float f = fbm(p + 4.0 * r);
  f = clamp((f - 0.25) * 1.6 + ripple * 0.35, 0.0, 1.0) * uIntensity;

  // quantize + dither (uDither = 0 → gradasi halus)
  float th = bayer8(gl_FragCoord.xy) - 0.5;
  float lv = mix(f, floor(f * uLevels + th + 0.5) / uLevels, uDither);

  vec3 col = mix(vec3(0.0), uColA, smoothstep(0.0, 0.45, lv));
  col = mix(col, uColB, smoothstep(0.4, 0.85, lv));
  col = mix(col, uColC, smoothstep(0.82, 1.0, lv) * (0.5 + 0.5 * r.x));

  col *= 0.82 + 0.18 * sin(gl_FragCoord.y * 3.14159);         // scanline
  float vig = smoothstep(1.25, 0.25, length(uv - 0.5) * 1.6); // vignette
  gl_FragColor = vec4(col * vig, 1.0);
}
`;

const hex = h => {
  const n = parseInt(h.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};


/**
 * Background shader OGL (WebGL) yang ringan: dirender pada resolusi rendah
 * (pixel chunky + hemat GPU), berhenti saat di luar viewport / tab
 * tersembunyi, single-frame untuk prefers-reduced-motion, dan fallback
 * gradien CSS bila WebGL tidak tersedia.
 */
export default function ShaderField({ preset = "phosphor", className, interactive = true, style }) {
  const wrapRef = useRef(null);
  const active = useInViewport(wrapRef);
  const cfg = SHADER_PRESETS[preset] ?? SHADER_PRESETS.phosphor;

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap || !active || !canUseWebGL()) return;
    let renderer;
    try {
      renderer = new Renderer({ dpr: cfg.resolution, alpha: false, antialias: false, depth: false, powerPreference: "low-power" });
    } catch {
      return;
    }
    const gl = renderer.gl;
    const canvas = gl.canvas;
    canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;image-rendering:pixelated;display:block";
    wrap.appendChild(canvas);

    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        uTime: { value: 0 },
        uRes: { value: [1, 1] },
        uMouse: { value: [0.5, 0.5] },
        uMouseOn: { value: 0 },
        uIntensity: { value: cfg.intensity },
        uLevels: { value: cfg.levels },
        uDither: { value: cfg.dither },
        uColA: { value: hex(cfg.colA) },
        uColB: { value: hex(cfg.colB) },
        uColC: { value: hex(cfg.colC) },
        uScale: { value: cfg.scale },
      },
    });
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

    const resize = () => {
      // clientWidth/Height = ukuran layout (tidak terdistorsi transform leluhur)
      renderer.setSize(Math.max(1, wrap.clientWidth), Math.max(1, wrap.clientHeight));
      program.uniforms.uRes.value = [canvas.width, canvas.height];
    };
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    resize();

    const target = { x: 0.5, y: 0.5, on: 0 };
    const onMove = e => {
      const r = wrap.getBoundingClientRect();
      target.x = (e.clientX - r.left) / r.width;
      target.y = 1 - (e.clientY - r.top) / r.height;
      target.on = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom ? 1 : 0;
    };
    if (interactive) addEventListener("pointermove", onMove, { passive: true });

    const still = prefersReducedMotion();
    let raf = 0;
    const start = performance.now();
    const frame = now => {
      const u = program.uniforms;
      u.uTime.value = still ? 12 : (now - start) / 1000;
      const [mx, my] = u.uMouse.value;
      u.uMouse.value = [mx + (target.x - mx) * 0.08, my + (target.y - my) * 0.08];
      u.uMouseOn.value += (target.on - u.uMouseOn.value) * 0.05;
      renderer.render({ scene: mesh });
      if (!still) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      if (interactive) removeEventListener("pointermove", onMove);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.remove();
    };
  }, [active, cfg, interactive]);

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      style={{ background: `radial-gradient(ellipse at 30% 40%, ${cfg.colA}, #000 70%)`, ...style }}
    />
  );
}
