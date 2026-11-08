import { useEffect, useState } from "react";
import { ACCESS_LOG, PROFILE } from "../../data/profile";
import { scrollTo } from "../../lib/scroll";
import { togglePalette } from "../../lib/events";
import { SECTIONS } from "./sections";
import Sparkline from "../../components/ui/Sparkline";

export function StatusBar() {
  const [time, setTime] = useState(() => new Date().toLocaleTimeString("en-US", { hour12: false }));
  const [cpu, setCpu] = useState(18);
  useEffect(() => {
    const t1 = setInterval(() => setTime(new Date().toLocaleTimeString("en-US", { hour12: false })), 1000);
    const t2 = setInterval(() => setCpu(12 + Math.floor(Math.random() * 16)), 2200);
    return () => { clearInterval(t1); clearInterval(t2); };
  }, []);
  return (
    <div className="statusbar">
      <div className="sb-left">
        <div className="sb-brand"><div className="pulse" />&nbsp;{PROFILE.os}</div>
        <span className="sb-sep">│</span>
        <span>{PROFILE.version}</span>
        <span className="sb-sep">│</span>
        <span>{PROFILE.host}</span>
      </div>
      <div className="sb-right">
        {[["CPU", `${cpu}%`], ["MEM", "42%"], ["UPTIME", "4y"], ["NODE", "v20.x"]].map(([k, v]) => (
          <div key={k} className="sb-metric"><span className="k">{k}&nbsp;</span><span className="v">{v}</span></div>
        ))}
        <button type="button" onClick={() => togglePalette()} className="sb-metric hover:text-g" data-cursor="ctrl+k">⌘K</button>
        <span className="tabular-nums" style={{ letterSpacing: "1px" }}>{time}</span>
      </div>
    </div>
  );
}

const jitter = (base, spread) => Math.max(1, Math.min(99, Math.round(base + (Math.random() - 0.5) * spread)));

export function SidePanel() {
  const [vals, setVals] = useState({ cores: [24, 31, 18, 40], mem: 42, net: [1.2, 3.4, 0.8, 5.1, 2.2, 3.1, 1.9, 4.4] });
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      if (document.hidden) return;
      setVals(v => ({
        cores: v.cores.map((c, k) => jitter(c * 0.6 + (18 + k * 9) * 0.4, 26)),
        mem: 35 + Math.floor(Math.random() * 20),
        net: [...v.net.slice(1), Math.random() * 6],
      }));
      const entry = ACCESS_LOG[i++ % ACCESS_LOG.length];
      setLogs(l => [...l.slice(-9), { ...entry, id: i }]);
    }, 1800);
    return () => clearInterval(t);
  }, []);

  const groups = { runtime: "var(--g)", db: "var(--a)", cache: "var(--r)", infra: "var(--c)" };

  return (
    <aside className="side-panel" aria-label="System vitals">
      <div className="sp-hdr">SYSTEM VITALS<div className="dot" /></div>
      <div className="sp-block">
        <div className="sp-block-title">CPU load</div>
        {vals.cores.map((pct, i) => {
          const col = pct > 80 ? "var(--r)" : pct > 60 ? "var(--a)" : "var(--g)";
          return (
            <div key={i} className="gauge-row">
              <span className="gauge-lbl">CPU{i}</span>
              <div className="gauge-bar"><div className="gauge-fill" style={{ width: `${pct}%`, background: col, boxShadow: `0 0 6px ${col}` }} /></div>
              <span className="gauge-val" style={{ color: col }}>{pct}%</span>
            </div>
          );
        })}
      </div>
      <div className="sp-block">
        <div className="sp-block-title">Memory</div>
        {[["Used", vals.mem, "var(--b)"], ["Swap", 8, "var(--p)"]].map(([l, v, col]) => (
          <div key={l} className="gauge-row">
            <span className="gauge-lbl">{l}</span>
            <div className="gauge-bar"><div className="gauge-fill" style={{ width: `${v}%`, background: col }} /></div>
            <span className="gauge-val" style={{ color: col }}>{v}%</span>
          </div>
        ))}
      </div>
      <div className="sp-block">
        <div className="sp-block-title">Network I/O <span style={{ color: "var(--g)" }}>{vals.net[vals.net.length - 1].toFixed(1)}MB/s</span></div>
        <div style={{ height: 36 }}>
          <Sparkline data={vals.net} max={6} color="#00f0ff" />
        </div>
      </div>
      <div className="sp-block">
        <div className="sp-block-title">Service groups</div>
        {Object.entries(groups).map(([g, col]) => (
          <div key={g} className="flex items-center gap-1.5 pb-1 text-[8px]">
            <div className="size-1.5 shrink-0 rounded-full" style={{ background: col, boxShadow: `0 0 6px ${col}` }} />
            <span className="uppercase tracking-[1.5px] text-tx2">{g}</span>
            <span className="ml-auto" style={{ color: col }}>active</span>
          </div>
        ))}
      </div>
      <div className="sp-block flex-1 overflow-hidden">
        <div className="sp-block-title">Access log</div>
        <div className="log-box">
          {logs.slice(-8).map((l, i) => (
            <div key={l.id} className="log-line" style={{ color: `var(--${l.c})`, animationDelay: `${i * 0.05}s` }}>{l.t}</div>
          ))}
        </div>
      </div>
    </aside>
  );
}


export function NavDots({ active }) {
  return (
    <nav className="nav-dots" aria-label="Section">
      {SECTIONS.map(([id, label]) => (
        <button
          type="button"
          key={id}
          aria-label={label}
          className={`ndot${active === id ? " active" : ""}`}
          data-label={label}
          onClick={() => scrollTo("#" + id, { offset: -40 })}
        />
      ))}
    </nav>
  );
}
