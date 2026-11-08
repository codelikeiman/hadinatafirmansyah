import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import PageTitle from "../../components/fx/PageTitle";
import CobeGlobe from "../../components/fx/CobeGlobe";
import Ripple from "../../components/ui/Ripple";
import BorderBeam from "../../components/ui/BorderBeam";
import { PROBES } from "../../data/network";
import { buildRoute, guessVisitor } from "../../lib/traceroute";
import { prefersReducedMotion } from "../../lib/media";
import { cn } from "../../lib/cn";

const STEP_MS = 750;

function ChartTip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return <div className="border border-g bg-black px-2 py-1 text-[11px] text-g">hop {d.hop} · {d.code} · {d.ms} ms</div>;
}

/** Satu "run" traceroute; di-remount (key) setiap probe berganti → state mulai dari 0 tanpa setState di effect. */
function RouteRun({ route }) {
  const [step, setStep] = useState(() => (prefersReducedMotion() ? route.length : 0));
  const done = step >= route.length;

  useEffect(() => {
    if (done) return;
    const t = setTimeout(() => setStep(s => s + 1), step === 0 ? 400 : STEP_MS);
    return () => clearTimeout(t);
  }, [step, done]);

  const shown = route.slice(0, step);
  const markers = useMemo(() => route.slice(0, Math.max(step, 1)).map((h, i) => ({
    id: `h${i}`, location: h.location, label: i === 0 ? "YOU" : h.code,
    size: h.code === "MES" ? 0.1 : i === 0 ? 0.06 : 0.04,
    color: h.code === "MES" ? [1, 0.83, 0] : i === 0 ? [0, 0.94, 1] : undefined,
  })), [route, step]);
  const arcs = useMemo(() => shown.slice(1).map((h, i) => ({ id: `a${i}`, from: shown[i].location, to: h.location })), [shown]);
  const focus = done ? null : (shown[shown.length - 1] ?? route[0]).location;
  const chart = shown.map(h => ({ hop: h.hop, code: h.code, ms: h.rtt[0] }));
  const last = route[route.length - 1];

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      <div className="relative mx-auto w-full max-w-[620px]">
        <Ripple mainCircleSize={340} numCircles={4} className="[mask-image:none] opacity-50" />
        <CobeGlobe markers={markers} arcs={arcs} focus={focus} speed={0.0025} />
        <div className="mt-2 text-center text-[10px] tracking-[3px] text-tx3">drag globe · rute disimulasikan dari jarak great-circle</div>
      </div>

      <div className="min-w-0 space-y-5">
        <div className="relative border border-line2 bg-black/80 p-4 text-[12px] leading-6">
          <BorderBeam size={100} duration={6} />
          <div className="text-tx2">$ traceroute -q 3 backend.dev</div>
          <div className="text-tx2">traceroute to backend.dev ({last.ip}), 30 hops max, 60 byte packets</div>
          <AnimatePresence initial={false}>
            {shown.map(h => (
              <motion.div key={h.hop} initial={{ opacity: 0, x: -12, filter: "blur(4px)" }} animate={{ opacity: 1, x: 0, filter: "blur(0px)" }} className="whitespace-pre text-tx max-sm:whitespace-pre-wrap">
                <span className="text-amber">{String(h.hop).padStart(2)}</span>{"  "}
                <span className={h.code === "MES" ? "text-g glow-text" : "text-bright"}>{h.code === "MES" ? "backend.dev" : h.name}</span>
                <span className="text-tx2"> ({h.ip}) </span>
                <span className="text-b">{h.rtt.map(r => r.toFixed(3)).join(" ms  ")} ms</span>
                <span className="text-tx3">  [{h.asn}]</span>
              </motion.div>
            ))}
          </AnimatePresence>
          {!done && <span className="cur" />}
          {done && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-g">
              ✓ reached {last.name} in {route.length} hops · {last.km.toLocaleString()} km · ~{last.rtt[0].toFixed(1)} ms RTT
            </motion.div>
          )}
        </div>

        <div className="h-48 border border-line bg-d0 p-2">
          <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 480, height: 176 }}>
            <AreaChart data={chart} margin={{ top: 10, right: 12, bottom: 0, left: -18 }}>
              <defs>
                <linearGradient id="rttFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00ff41" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#00ff41" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#0c4a20" strokeDasharray="3 3" />
              <XAxis dataKey="code" stroke="#1fa64a" tick={{ fontSize: 10 }} />
              <YAxis stroke="#1fa64a" tick={{ fontSize: 10 }} unit="ms" />
              <Tooltip content={<ChartTip />} cursor={{ stroke: "#00f0ff" }} />
              <Area type="monotone" dataKey="ms" stroke="#00ff41" strokeWidth={2} fill="url(#rttFill)" isAnimationActive={false} dot={{ r: 3, fill: "#00ff41" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default function Traceroute() {
  const [probe, setProbe] = useState("you");
  const [visitor] = useState(guessVisitor);
  const source = probe === "you" ? visitor.location : PROBES.find(p => p.id === probe).location;
  const route = useMemo(() => buildRoute(source), [source]);

  return (
    <div className="pg !max-w-[1280px]">
      <PageTitle text="traceroute backend.dev" sub={`Paket berangkat dari probe pilihanmu dan "melompat" antar internet exchange sampai server di Medan. Lokasi "kamu" ditebak dari zona waktu (${visitor.tz}) — tanpa izin lokasi, tanpa request jaringan.`} />
      <div className="mb-6 flex flex-wrap gap-1.5 text-[11px]">
        {PROBES.map(p => (
          <button key={p.id} type="button" onClick={() => setProbe(p.id)} className={cn("relative border px-3 py-1.5 tracking-wider", probe === p.id ? "border-g text-black" : "border-line2 text-tx2 hover:text-g")}>
            {probe === p.id && <motion.span layoutId="probe-pill" className="absolute inset-0 bg-g shadow-[0_0_18px_#00ff41]" transition={{ type: "spring", stiffness: 500, damping: 36 }} />}
            <span className="relative">{p.id === "you" ? `◎ ${p.label}` : p.label}</span>
          </button>
        ))}
      </div>
      <RouteRun key={probe} route={route} />
    </div>
  );
}
