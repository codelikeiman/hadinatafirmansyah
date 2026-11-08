import { useEffect, useRef, useState } from "react";
import { motion, useAnimate } from "motion/react";
import { animate, createDraggable, createScope, stagger, svg, utils } from "animejs";
import { DotLottieReact, setWasmUrl } from "@lottiefiles/dotlottie-react";
import { Alignment, Fit, Layout, RuntimeLoader, useRive, useStateMachineInput } from "@rive-app/react-canvas";
import lottieWasm from "@lottiefiles/dotlottie-web/dotlottie-player.wasm?url";
import riveWasm from "@rive-app/canvas/rive.wasm?url";
import riveFallbackWasm from "@rive-app/canvas/rive_fallback.wasm?url";
import PageTitle from "../../components/fx/PageTitle";
import MagicCard from "../../components/ui/MagicCard";
import BorderBeam from "../../components/ui/BorderBeam";
import { hexLoader, radarPulse, serverRack } from "./lottieAnims";
import { prefersReducedMotion } from "../../lib/media";
import { cn } from "../../lib/cn";

// WASM Rive & dotLottie di-host sendiri (aset hash Vite) — tanpa unpkg/jsdelivr saat runtime.
setWasmUrl(lottieWasm);
RuntimeLoader.setWasmUrl(riveWasm);
RuntimeLoader.setWasmFallbackUrl(riveFallbackWasm);

// File .riv contoh resmi Rive; ganti dengan milikmu lewat VITE_RIVE_SRC (+ state machine & input).
const RIVE_SRC = import.meta.env.VITE_RIVE_SRC || "https://cdn.rive.app/animations/vehicles.riv";
const RIVE_SM = import.meta.env.VITE_RIVE_STATE_MACHINE || "bumpy";
const RIVE_INPUT = import.meta.env.VITE_RIVE_INPUT || "bump";

function Panel({ title, tag, className, children }) {
  return (
    <MagicCard className={cn("flex flex-col p-4 sm:p-5", className)}>
      <div className="mb-3 flex items-center justify-between gap-2 text-[10px] tracking-[.2em]">
        <span className="truncate text-bright">{title}</span>
        <span className="shrink-0 whitespace-nowrap border border-line2 px-1.5 py-0.5 text-[9px] tracking-[.12em] text-tx2">{tag}</span>
      </div>
      {children}
    </MagicCard>
  );
}

// ── Rive ───────────────────────────────────────────────────────────────────
function RivePanel() {
  const [failed, setFailed] = useState(false);
  const { rive, RiveComponent } = useRive({
    src: RIVE_SRC,
    stateMachine: RIVE_SM,
    autoplay: true,
    layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
    onLoadError: () => setFailed(true),
  });
  const bump = useStateMachineInput(rive, RIVE_SM, RIVE_INPUT);
  return (
    <Panel title="kubectl rollout --watch" tag="RIVE · STATE MACHINE">
      <div className="relative h-64 overflow-hidden border border-line bg-[radial-gradient(ellipse_at_center,#00ff4114,transparent_70%)] sm:h-72">
        {failed ? (
          <div className="grid h-full place-items-center p-6 text-center text-[12px] text-tx2">
            <div><div className="mb-2 text-amber">⚠ asset .riv tidak terjangkau</div>Runtime Rive (WASM self-hosted) siap. Set <code className="text-c">VITE_RIVE_SRC</code> ke file .riv milikmu.</div>
          </div>
        ) : (
          <RiveComponent className="size-full" onClick={() => bump?.fire()} data-cursor="bump!" aria-label="Animasi Rive truk deploy" />
        )}
      </div>
      <div className="mt-3 flex items-center gap-2 text-[11px]">
        <button type="button" disabled={!bump} onClick={() => bump?.fire()} className="border border-g px-3 py-1.5 text-g hover:bg-g hover:text-black disabled:opacity-40">⇪ fire "{RIVE_INPUT}"</button>
        <span className="text-tx3">state machine <span className="text-c">{RIVE_SM}</span> · klik canvas untuk memicu input</span>
      </div>
    </Panel>
  );
}

// ── dotLottie ────────────────────────────────────────────────────────────────
const LOTTIES = [
  { name: "hex-loader", data: hexLoader, label: "trim paths + rotate" },
  { name: "server-rack", data: serverRack, label: "staggered opacity" },
  { name: "radar", data: radarPulse, label: "scale · opacity · sweep" },
];
function LottiePanel() {
  const [speed, setSpeed] = useState(1);
  return (
    <Panel title="handcrafted lottie" tag="DOTLOTTIE · THORVG">
      <div className="grid grid-cols-3 gap-2">
        {LOTTIES.map(l => (
          <div key={l.name} className="border border-line bg-black p-1 text-center">
            <DotLottieReact data={l.data} loop autoplay={!prefersReducedMotion()} speed={speed} className="aspect-square w-full" renderConfig={{ autoResize: true }} />
            <div className="truncate text-[9px] tracking-wider text-tx2">{l.name}</div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[11px] leading-5 text-tx2">Tiga animasi Lottie ditulis langsung sebagai JSON (layer, shape, keyframe) — tanpa After Effects.</p>
      <label className="mt-2 flex items-center gap-2 text-[11px] text-tx2">speed
        <input type="range" min={0.25} max={3} step={0.25} value={speed} onChange={e => setSpeed(Number(e.target.value))} className="flex-1 accent-[#00ff41]" />
        <span className="w-8 text-g">{speed}×</span>
      </label>
    </Panel>
  );
}

// ── anime.js: sirkuit (drawable + motion path) ──────────────────────────────
const TRACES = [
  "M20 40 H120 V100 H220",
  "M20 160 H90 V120 H220",
  "M220 100 H300 V60 H380",
  "M220 120 H300 V170 H380",
  "M380 60 H440 V110",
  "M380 170 H440 V130",
];
function CircuitPanel() {
  const root = useRef(null);
  useEffect(() => {
    const still = prefersReducedMotion();
    const scope = createScope({ root }).add(() => {
      animate(svg.createDrawable(".trace"), { draw: ["0 0", "0 1"], duration: 1400, delay: stagger(140), ease: "inOutQuad" });
      animate(".pad", { scale: [0, 1], duration: 500, delay: stagger(80, { start: 600 }), ease: "outBack(3)" });
      if (!still) {
        root.current.querySelectorAll(".packet").forEach((p, i) => {
          animate(p, { ...svg.createMotionPath(`#trace-${i % TRACES.length}`), duration: 2200 + i * 260, delay: 1500 + i * 180, loop: true, ease: "linear" });
        });
        animate(".chip-core", { opacity: [0.4, 1], duration: 900, loop: true, alternate: true, ease: "inOutSine" });
      }
    });
    return () => scope.revert();
  }, []);
  return (
    <Panel title="packet routing" tag="ANIME.JS · SVG">
      <div ref={root} className="border border-line bg-black">
        <svg viewBox="0 0 460 210" className="w-full" aria-label="Animasi sirkuit">
          {TRACES.map((d, i) => <path key={d} id={`trace-${i}`} className="trace" d={d} fill="none" stroke="#14802f" strokeWidth="3" strokeLinecap="square" />)}
          {[[20, 40], [20, 160], [380, 60], [380, 170], [440, 110], [440, 130]].map(([x, y]) => <circle key={`${x}-${y}`} className="pad" cx={x} cy={y} r="6" fill="#000" stroke="#00ff41" strokeWidth="2" style={{ transformOrigin: `${x}px ${y}px` }} />)}
          <rect x="196" y="80" width="48" height="60" fill="#020a05" stroke="#00ff41" strokeWidth="2" />
          <rect className="chip-core" x="206" y="92" width="28" height="36" fill="#00ff41" opacity=".6" />
          <text x="220" y="156" fill="#1fa64a" fontSize="10" textAnchor="middle" fontFamily="JetBrains Mono">API</text>
          {Array.from({ length: 9 }, (_, i) => <circle key={i} className="packet" r="3.5" fill={i % 3 ? "#00f0ff" : "#ffd400"} style={{ filter: "drop-shadow(0 0 4px currentColor)" }} />)}
        </svg>
      </div>
      <p className="mt-3 text-[11px] text-tx2">svg.createDrawable menggambar jalur, svg.createMotionPath mengalirkan paket.</p>
    </Panel>
  );
}

// ── anime.js: grid stagger ──────────────────────────────────────────────────
const COLS = 18, ROWS = 10;
function rippleFrom(rootEl, from) {
  if (!rootEl || prefersReducedMotion()) return;
  animate(rootEl.querySelectorAll(".cell"), {
    scale: [{ from: 1, to: 2.4, ease: "outSine", duration: 280 }, { to: 1, ease: "inOutQuad", duration: 700 }],
    backgroundColor: [{ to: "#00f0ff", duration: 200 }, { to: "#0c4a20", duration: 900 }],
    delay: stagger(42, { grid: [COLS, ROWS], from }),
  });
}
function GridPanel() {
  const root = useRef(null);
  useEffect(() => {
    const el = root.current;
    const t = setTimeout(() => rippleFrom(el, "center"), 700);
    return () => { clearTimeout(t); utils.remove(el.querySelectorAll(".cell")); };
  }, []);
  return (
    <Panel title="stagger({ grid })" tag="ANIME.JS · STAGGER">
      <div ref={root} className="grid gap-[6px] border border-line bg-black p-3" style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}>
        {Array.from({ length: COLS * ROWS }, (_, i) => (
          <button key={i} type="button" aria-label={`ripple ${i}`} onClick={() => rippleFrom(root.current, i)} className="cell aspect-square rounded-full bg-line" />
        ))}
      </div>
      <p className="mt-3 text-[11px] text-tx2">Klik titik mana pun — gelombang menyebar dari titik itu.</p>
    </Panel>
  );
}

// ── anime.js: draggable ─────────────────────────────────────────────────────
const PROCS = [["PID 1", "node", "#00ff41"], ["PID 5", "postgres", "#ffb000"], ["PID 6", "redis", "#ff3b3b"], ["PID 7", "docker", "#00f0ff"]];
function DragPanel() {
  const area = useRef(null);
  useEffect(() => {
    const draggables = [...area.current.querySelectorAll(".proc")].map(el =>
      createDraggable(el, { container: area.current, releaseStiffness: 90, releaseDamping: 10, velocityMultiplier: 1.4, containerFriction: 0.4 }),
    );
    return () => draggables.forEach(d => d.revert());
  }, []);
  return (
    <Panel title="createDraggable()" tag="ANIME.JS · PHYSICS">
      <div ref={area} className="relative h-56 overflow-hidden border border-line bg-[linear-gradient(#0c4a2022_1px,transparent_1px),linear-gradient(90deg,#0c4a2022_1px,transparent_1px)] bg-[size:24px_24px]">
        {PROCS.map(([pid, name, color], i) => (
          <div key={pid} className="proc absolute flex cursor-grab flex-col border bg-black/90 px-3 py-2 text-[11px] active:cursor-grabbing" data-cursor="fling me"
            style={{ left: 16 + (i % 2) * 150, top: 16 + Math.floor(i / 2) * 90, borderColor: color, boxShadow: `0 0 18px ${color}55` }}>
            <span className="text-tx2">{pid}</span><b style={{ color }}>{name}</b>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-tx2">Lempar prosesnya — pantulan pegas di batas container.</p>
    </Panel>
  );
}

// ── Motion: animate() sequence ──────────────────────────────────────────────
const STAGES = ["build", "test", "push", "deploy"];
function PipelinePanel() {
  const [scope, run] = useAnimate();
  const [busy, setBusy] = useState(false);
  const go = async () => {
    if (busy) return;
    setBusy(true);
    await run([
      [".st", { backgroundColor: "#000", color: "#1fa64a", scale: 1 }, { duration: 0.01 }],
      [".ln", { scaleX: 0 }, { duration: 0.01, at: "<" }],
      ...STAGES.flatMap((_, i) => [
        [`.st-${i}`, { scale: [1, 1.12, 1], backgroundColor: "#00ff41", color: "#000" }, { duration: 0.45 }],
        ...(i < STAGES.length - 1 ? [[`.ln-${i}`, { scaleX: 1 }, { duration: 0.35, ease: "easeInOut" }]] : []),
      ]),
      [".ok", { opacity: [0, 1], y: [8, 0] }, { duration: 0.3 }],
    ]);
    setBusy(false);
  };
  return (
    <Panel title="deploy pipeline" tag="MOTION · animate()">
      <div ref={scope} className="flex flex-col gap-4 border border-line bg-black p-4 sm:p-6">
        <div className="flex items-center">
          {STAGES.map((s, i) => (
            <div key={s} className="flex flex-1 items-center last:flex-none">
              <div className={`st st-${i} border border-line2 px-3 py-2 text-[11px] tracking-wider text-tx2`}>{s}</div>
              {i < STAGES.length - 1 && <div className="mx-2 h-0.5 flex-1 bg-line"><div className={`ln ln-${i} h-full origin-left scale-x-0 bg-g shadow-[0_0_8px_#00ff41]`} /></div>}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={go} disabled={busy} className="border border-g px-4 py-2 text-[11px] tracking-widest text-g hover:bg-g hover:text-black disabled:opacity-40">▶ RUN PIPELINE</button>
          <span className="ok text-[12px] text-g opacity-0">✓ deployed to production · 0 downtime</span>
        </div>
      </div>
    </Panel>
  );
}

export default function Lab() {
  return (
    <div className="pg !max-w-[1280px]">
      <PageTitle text="./motion-lab" sub="Laboratorium animasi: Rive (state machine), dotLottie (Lottie buatan tangan), anime.js v4 (SVG, stagger grid, draggable), dan sequence animate() milik Motion." />
      <motion.div className="relative grid gap-4 lg:grid-cols-3" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }}>
        {[RivePanel, LottiePanel, CircuitPanel, GridPanel, DragPanel, PipelinePanel].map((P, i) => (
          <motion.div key={i} className={cn("min-w-0", i === 0 && "lg:col-span-2", i === 5 && "lg:col-span-3")}
            variants={{ hidden: { opacity: 0, y: 30, filter: "blur(8px)" }, show: { opacity: 1, y: 0, filter: "blur(0px)" } }}>
            <P />
          </motion.div>
        ))}
        <BorderBeam size={260} duration={14} />
      </motion.div>
    </div>
  );
}
