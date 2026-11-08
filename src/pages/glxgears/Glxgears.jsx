import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { animate } from "animejs";
import PageTitle from "../../components/fx/PageTitle";
import BorderBeam from "../../components/ui/BorderBeam";
import { canUseWebGL, prefersReducedMotion } from "../../lib/media";
import { cn } from "../../lib/cn";

const SLIDERS = [
  { key: "amp", label: "flux", min: 0, max: 0.8, step: 0.01, def: 0.28, set: "setAmp" },
  { key: "freq", label: "freq", min: 0.4, max: 4, step: 0.05, def: 1.6, set: "setFreq" },
  { key: "speed", label: "turbulence", min: 0, max: 2, step: 0.01, def: 0.45, set: "setSpeed" },
  { key: "spin", label: "spin", min: 0, max: 4, step: 0.05, def: 1, set: "setSpin" },
  { key: "bloom", label: "bloom", min: 0, max: 3, step: 0.05, def: 0.75, set: "setBloom" },
];

const initialApi = () => (/[?&]api=webgl/.test(window.location.hash) ? "webgl" : "auto");

export default function Glxgears() {
  const mountRef = useRef(null);
  const reactorRef = useRef(null);
  const statsRef = useRef(null);
  const [status, setStatus] = useState(() => (canUseWebGL() ? "boot" : "nogl"));
  const [backend, setBackend] = useState("…");
  const [vals, setVals] = useState(() => Object.fromEntries(SLIDERS.map(s => [s.key, s.def])));
  const [crt, setCrt] = useState(true);
  const [api, setApi] = useState(initialApi);

  useEffect(() => {
    if (!canUseWebGL()) return;
    let cancelled = false, reactor = null;
    // chunk three/webgpu (~1MB) baru diunduh saat halaman ini dibuka
    import("./reactor.js")
      .then(({ createReactor }) => createReactor(mountRef.current, {
        reducedMotion: prefersReducedMotion(),
        forceWebGL: api === "webgl",
        onStats: s => {
          if (statsRef.current) statsRef.current.textContent = `${s.fps} FPS · ${s.tris.toLocaleString()} tris · ${s.particles.toLocaleString()} particles`;
        },
      }))
      .then(r => {
        if (cancelled) { r.dispose(); return; }
        reactor = r;
        reactorRef.current = r;
        setBackend(r.backend);
        setStatus("ready");
      })
      .catch(err => {
        console.error("[glxgears]", err);
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
      reactor?.dispose();
      reactorRef.current = null;
    };
  }, [api]);

  const switchApi = () => {
    setStatus("boot");
    setApi(a => (a === "auto" ? "webgl" : "auto"));
  };

  const update = (s, v) => {
    setVals(o => ({ ...o, [s.key]: v }));
    reactorRef.current?.[s.set](v);
  };

  // anime.js menganimasikan uniform TSL secara langsung (objek JS biasa dengan .value)
  const overload = () => {
    const r = reactorRef.current;
    if (!r) return;
    r.uniforms.heat.value = 1;
    animate(r.uniforms.amp, { value: [0.95, vals.amp], duration: 1600, ease: "outElastic(1, .35)" });
    animate(r.uniforms.speed, { value: [2.4, vals.speed], duration: 2200, ease: "outExpo" });
  };

  return (
    <div className="relative min-h-[calc(100dvh-30px)] overflow-hidden">
      <div ref={mountRef} className="absolute inset-0" aria-label="Reactor core 3D" role="img" />

      <div className="pointer-events-none relative z-10 flex min-h-[calc(100dvh-30px)] flex-col justify-between p-5 sm:p-10">
        <div className="pointer-events-auto max-w-xl">
          <PageTitle text="glxgears --webgpu" sub="Reactor core yang ditulis full TSL (Three Shading Language). Drag untuk memutar, scroll untuk zoom." />
        </div>

        {status === "boot" && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center text-sm tracking-[.3em] text-tx2">
            <div className="text-center"><div className="pl-hex mx-auto mb-3 size-12 animate-spin border border-g [animation-duration:2.4s]" />INITIALIZING GPU PIPELINE…</div>
          </div>
        )}
        {(status === "nogl" || status === "error") && (
          <div className="pointer-events-auto absolute inset-0 grid place-items-center p-6 text-center">
            <div className="segfault !m-0">
              <h2>✖ GPU NOT AVAILABLE</h2>
              <p>Browser ini tidak menyediakan WebGPU maupun WebGL2, atau driver GPU memblokirnya. Coba Chrome/Edge/Firefox/Safari terbaru dengan akselerasi hardware aktif.</p>
            </div>
          </div>
        )}

        <motion.aside
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: status === "ready" ? 1 : 0, x: status === "ready" ? 0 : 40 }}
          transition={{ type: "spring", stiffness: 160, damping: 22 }}
          className="pointer-events-auto relative ml-auto mt-6 w-full max-w-[340px] border border-line2 bg-black/70 p-4 text-[11px] backdrop-blur-md"
        >
          <BorderBeam size={120} duration={7} />
          <div className="mb-3 flex items-center justify-between">
            <span className="tracking-[.25em] text-tx2">RENDERER</span>
            <button type="button" onClick={switchApi} data-cursor={api === "auto" ? "force WebGL2" : "auto (WebGPU)"}
              className={cn("border px-1.5 py-0.5 text-[10px] tracking-widest", backend.startsWith("WebGPU") ? "border-g text-g" : "border-amber text-amber")}>
              {backend} ⇄
            </button>
          </div>
          <div ref={statsRef} className="mb-4 tabular-nums text-bright">— FPS</div>
          {SLIDERS.map(s => (
            <label key={s.key} className="mb-2.5 block">
              <span className="flex justify-between text-tx2"><span>{s.label}</span><span className="tabular-nums text-g">{vals[s.key].toFixed(2)}</span></span>
              <input type="range" min={s.min} max={s.max} step={s.step} value={vals[s.key]} onChange={e => update(s, Number(e.target.value))} className="mt-1 w-full accent-[#00ff41]" />
            </label>
          ))}
          <div className="mt-4 flex gap-2">
            <button type="button" onClick={() => { const v = !crt; setCrt(v); reactorRef.current?.setCrt(v); }}
              className={cn("flex-1 border px-2 py-2 tracking-widest", crt ? "border-b bg-b text-black" : "border-line2 text-tx2")}>
              CRT POST {crt ? "ON" : "OFF"}
            </button>
            <button type="button" onClick={overload} className="flex-1 border border-red bg-red/15 px-2 py-2 tracking-widest text-red hover:bg-red hover:text-black" data-cursor="anime.js">
              ⚠ OVERLOAD
            </button>
          </div>
          <p className="mt-3 text-[10px] leading-relaxed text-tx3">mx_noise displacement · 4k sprite instanced · bloom → rgbShift → scanlines → vignette</p>
        </motion.aside>
      </div>
    </div>
  );
}
