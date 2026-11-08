import { useEffect, useEffectEvent, useMemo, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { SKILLS } from "../../data/profile";
import PageTitle from "../../components/fx/PageTitle";
import NumberTicker from "../../components/ui/NumberTicker";
import { confettiBurst } from "../../lib/celebrate";
import { detectCores } from "../../lib/device";
import { cn } from "../../lib/cn";

const HISTORY = 28;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

function Spark({ data, color = "#00ff41" }) {
  const pts = data.map((v, i) => `${(i / (HISTORY - 1)) * 100},${30 - (v / 100) * 28}`).join(" ");
  return (
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="h-5 w-full" aria-hidden="true">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      <polyline points={`0,30 ${pts} 100,30`} fill={color} fillOpacity="0.12" stroke="none" />
    </svg>
  );
}

const initial = () => Object.fromEntries(SKILLS.map(s => [s.id, Array.from({ length: HISTORY }, () => s.load)]));

/**
 * htop interaktif: nilai CPU live + sparkline per service, F6 = ganti urutan
 * (baris berpindah dengan animasi layout Motion), F9 = kill proses (lalu respawn).
 */
export default function Htop() {
  const [hist, setHist] = useState(initial);
  const [sortBy, setSortBy] = useState("cpu");
  const [killed, setKilled] = useState(() => new Set());
  const [cores] = useState(() => Math.min(8, detectCores()));
  const [coreLoad, setCoreLoad] = useState(() => Array.from({ length: Math.min(8, detectCores()) }, (_, i) => 20 + i * 7));
  const [selected, setSelected] = useState(SKILLS[0].id);

  useEffect(() => {
    const id = setInterval(() => {
      if (document.hidden) return;
      setHist(h => {
        const next = {};
        for (const s of SKILLS) {
          const arr = h[s.id];
          const last = arr[arr.length - 1];
          const v = clamp(Math.round(last + (s.load - last) * 0.25 + (Math.random() * 16 - 8)), 4, 99);
          next[s.id] = [...arr.slice(1), v];
        }
        return next;
      });
      setCoreLoad(c => c.map(v => clamp(Math.round(v + (Math.random() * 30 - 15)), 3, 99)));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const rows = useMemo(() => {
    const list = SKILLS.filter(s => !killed.has(s.id)).map(s => ({ ...s, cpu: hist[s.id][HISTORY - 1] }));
    if (sortBy === "cpu") list.sort((a, b) => b.cpu - a.cpu);
    else if (sortBy === "name") list.sort((a, b) => a.id.localeCompare(b.id));
    else list.sort((a, b) => a.pid - b.pid);
    return list;
  }, [hist, sortBy, killed]);

  const kill = id => {
    if (!id || killed.has(id)) return;
    confettiBurst({ x: 0.5, y: 0.5 });
    setKilled(k => new Set(k).add(id));
    setTimeout(() => setKilled(k => { const n = new Set(k); n.delete(id); return n; }), 2600);
  };

  const onFKey = useEffectEvent(e => {
    if (e.key === "F6") { e.preventDefault(); setSortBy(s => (s === "cpu" ? "name" : s === "name" ? "pid" : "cpu")); }
    if (e.key === "F9") { e.preventDefault(); kill(selected); }
  });
  useEffect(() => {
    const h = e => onFKey(e);
    addEventListener("keydown", h);
    return () => removeEventListener("keydown", h);
  }, []);

  const avg = Math.round(rows.reduce((a, r) => a + r.cpu, 0) / Math.max(rows.length, 1));

  return (
    <div className="pg">
      <PageTitle text="htop" sub="Klik baris untuk memilih · F6 / tombol SortBy untuk mengurutkan ulang · F9 untuk kill (service akan respawn)." />

      <div className="mb-6 grid gap-6 md:grid-cols-[1.4fr_1fr]">
        <div className="space-y-1.5 text-[12px]">
          {coreLoad.slice(0, cores).map((v, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-6 text-b">{i}</span>
              <span className="text-tx3">[</span>
              <div className="relative h-3 flex-1 overflow-hidden bg-d3">
                <motion.div className="absolute inset-y-0 left-0" animate={{ width: v + "%" }} transition={{ type: "spring", stiffness: 120, damping: 18 }}
                  style={{ background: v > 80 ? "var(--r)" : v > 55 ? "var(--a)" : "var(--g)", boxShadow: "0 0 10px currentColor" }} />
              </div>
              <span className="w-12 text-right tabular-nums text-bright">{v}%</span>
              <span className="text-tx3">]</span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 text-[11px]">
          {[["Tasks", rows.length, ""], ["Load avg", avg, "%"], ["Threads", 142, ""], ["Uptime", 1309, "d"]].map(([k, v, s]) => (
            <div key={k} className="fx-card !mb-0">
              <div className="tracking-widest text-tx2">{k.toUpperCase()}</div>
              <div className="text-2xl font-bold text-g glow-text"><NumberTicker value={v} suffix={s} /></div>
            </div>
          ))}
        </div>
      </div>

      <div className="ht-head">
        <span>PID</span><span>SERVICE</span><span>VER</span><span>UPTIME</span><span>CPU HISTORY</span><span>%</span>
      </div>
      <LayoutGroup>
        <AnimatePresence initial={false}>
          {rows.map(s => (
            <motion.div
              layout
              key={s.id}
              onClick={() => setSelected(s.id)}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, x: 80, filter: "blur(6px)", transition: { duration: 0.35 } }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={cn("fx-card ht-row cursor-pointer", selected === s.id && "!border-b shadow-[0_0_0_1px_#00f0ff]")}
              data-cursor={`select ${s.id}`}
            >
              <span>{s.pid}</span>
              <span className="truncate">{s.id}</span>
              <span>{s.ver}</span>
              <span>{s.up}</span>
              <span><Spark data={hist[s.id]} color={s.cpu > 80 ? "#ffb000" : "#00ff41"} /></span>
              <b className="tabular-nums">{s.cpu}%</b>
            </motion.div>
          ))}
        </AnimatePresence>
      </LayoutGroup>

      <div className="mt-4 flex flex-wrap gap-1 text-[12px]">
        {[["F1", "Help", null], ["F5", "Tree", null], ["F6", `SortBy:${sortBy}`, () => setSortBy(s => (s === "cpu" ? "name" : s === "name" ? "pid" : "cpu"))], ["F9", "Kill", () => kill(selected)], ["F10", "Quit", null]].map(([k, l, fn]) => (
          <button key={k} type="button" onClick={fn ?? undefined} disabled={!fn} className="flex disabled:opacity-50">
            <span className="bg-black px-1 text-bright">{k}</span>
            <span className="bg-b px-2 text-black">{l}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
