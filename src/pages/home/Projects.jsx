import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { PROJECTS } from "../../data/profile";
import SectionHead from "./SectionHead";
import EvervaultCard from "../../components/ui/EvervaultCard";
import BorderBeam from "../../components/ui/BorderBeam";
import { useReveal } from "../../lib/useReveal";
import { lockScroll } from "../../lib/scroll";

const spring = { type: "spring", stiffness: 380, damping: 34 };

function InspectJson({ p }) {
  const rows = [
    ["Id", p.id], ["Image", p.image], ["State.Status", "running"], ["State.Health", "healthy"],
    ["RestartCount", p.restarts], ["NetworkSettings.Ports", p.port], ["Config.Labels.stack", p.tags.join(",")],
  ];
  return (
    <pre className="overflow-x-auto bg-black/60 p-3 text-[11px] leading-6" data-lenis-prevent>
      <span className="text-tx2">{"{"}</span>
      {rows.map(([k, v], i) => (
        <span key={k}>{"\n  "}<span className="text-b">"{k}"</span><span className="text-tx2">: </span>
          <span className={typeof v === "number" ? "text-amber" : "text-g"}>{typeof v === "number" ? v : `"${v}"`}</span>{i < rows.length - 1 ? "," : ""}</span>
      ))}
      {"\n"}<span className="text-tx2">{"}"}</span>
    </pre>
  );
}

function Bar({ label, value, color }) {
  return (
    <div className="flex items-center gap-2 text-[10px]">
      <span className="w-8 text-tx2">{label}</span>
      <div className="h-1.5 flex-1 bg-d3">
        <motion.div className="h-full" style={{ background: color, boxShadow: `0 0 8px ${color}` }} initial={{ width: 0 }} animate={{ width: `${Math.min(100, value * 2)}%` }} transition={{ delay: 0.25, duration: 0.9, ease: [0.16, 1, 0.3, 1] }} />
      </div>
      <span className="w-9 text-right text-bright">{value}%</span>
    </div>
  );
}

/** docker ps → klik baris: kontainer "mengembang" jadi panel inspect lewat Motion layoutId. */
export default function Projects() {
  const [ref, vis] = useReveal();
  const [active, setActive] = useState(null);

  useEffect(() => {
    if (!active) return;
    lockScroll(true);
    const onKey = e => e.key === "Escape" && setActive(null);
    addEventListener("keydown", onKey);
    return () => { lockScroll(false); removeEventListener("keydown", onKey); };
  }, [active]);

  return (
    <section id="projects" className="sec">
      <SectionHead label="// 04 — RUNNING CONTAINERS" title="FEATURED" accent="PROJECTS" />
      <div ref={ref} className={`reveal${vis ? " show" : ""}`}>
        <div className="mb-1.5 text-[9px] tracking-[2px] text-tx3">{'$ docker ps --format "table {{.ID}}\\t{{.Image}}\\t{{.Status}}\\t{{.Names}}"'}</div>
        <div className="pods-grid">
          <div className="pods-header">
            {["CONTAINER ID", "IMAGE", "STATUS", "CPU%", "MEM%", "NAME"].map(h => <div key={h} className="text-[8px] uppercase tracking-[3px] text-tx3">{h}</div>)}
          </div>
          {PROJECTS.map(p => (
            <motion.div key={p.id} layoutId={`pod-${p.id}`} transition={spring} className="pod-row-wrap" style={{ borderRadius: 0 }}>
              <div className="pod-row" role="button" tabIndex={0} data-cursor="docker inspect"
                onClick={() => setActive(p)} onKeyDown={e => (e.key === "Enter" || e.key === " ") && setActive(p)}>
                <div className="pod-col"><span className="pod-id">{p.id}</span></div>
                <div className="pod-col"><span className="pod-image">{p.image}</span></div>
                <div className="pod-col">
                  <div className="pod-status-badge"><div className="size-[5px] rounded-full bg-g" style={{ animation: "p-dot 1.8s infinite" }} />Up</div>
                  <div className="mt-0.5 text-[8px] text-tx3">{p.status}</div>
                </div>
                <div className="pod-col">
                  <div className="text-[9px]" style={{ color: p.cpu > 15 ? "var(--a)" : "var(--g)" }}>{p.cpu}%</div>
                  <div className="pod-cpu-bar"><div className="pod-cpu-fill" style={{ width: `${p.cpu * 4}%` }} /></div>
                </div>
                <div className="pod-col">
                  <div className="text-[9px]" style={{ color: p.mem > 35 ? "var(--a)" : "var(--b)" }}>{p.mem}%</div>
                  <div className="pod-cpu-bar"><div className="pod-cpu-fill" style={{ width: `${p.mem}%`, background: "var(--b)" }} /></div>
                </div>
                <div className="pod-col">
                  <motion.span layoutId={`pod-name-${p.id}`} transition={spring} className="pod-name-txt inline-block">{p.name}</motion.span>
                  <div className="mt-[3px] text-[8px] text-tx3">RESTART: {p.restarts}</div>
                </div>
                <span className="pod-expand-hint">▸ INSPECT</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {active && (
          <motion.div
            key="overlay"
            className="fixed inset-0 z-[99980] grid place-items-center bg-black/75 p-3 backdrop-blur-sm sm:p-8"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setActive(null)}
          >
            <motion.div
              layoutId={`pod-${active.id}`}
              transition={spring}
              onClick={e => e.stopPropagation()}
              className="relative grid max-h-[88vh] w-[min(980px,100%)] overflow-hidden border border-g bg-d0 shadow-[0_0_80px_#00ff4144] md:grid-cols-[300px_1fr]"
              style={{ borderRadius: 0 }}
              role="dialog" aria-modal="true" aria-label={active.name}
            >
              <BorderBeam size={200} duration={6} />
              <div className="hidden md:block">
                <EvervaultCard text={active.name.slice(0, 2)} className="h-full !aspect-auto border-0 border-r" />
              </div>
              <div className="overflow-y-auto p-5 sm:p-7" data-lenis-prevent>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-[10px] tracking-[3px] text-tx2">$ docker inspect {active.id}</div>
                    <motion.h3 layoutId={`pod-name-${active.id}`} transition={spring} className="mt-1 inline-block text-2xl font-bold text-bright glow-text sm:text-3xl">{active.name}</motion.h3>
                  </div>
                  <button type="button" onClick={() => setActive(null)} className="border border-line2 px-2 py-1 text-xs text-tx2 hover:border-g hover:text-g" aria-label="Tutup">✕ ESC</button>
                </div>
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: 0.15 }} className="mt-5 space-y-5">
                  <p className="text-[14px] leading-7 text-tx">{active.desc}</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Bar label="CPU" value={active.cpu} color="#ffb000" />
                    <Bar label="MEM" value={active.mem} color="#00f0ff" />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {active.tags.map((t, i) => (
                      <motion.span key={t} initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.25 + i * 0.05 }}
                        className="border border-b/40 px-2 py-0.5 text-[10px] tracking-wider text-b">{t}</motion.span>
                    ))}
                  </div>
                  <InspectJson p={active} />
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
