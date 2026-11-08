import { useEffect, useState } from "react";
import { PROCS, PROFILE } from "../../data/profile";
import { useReveal } from "../../lib/useReveal";
import SectionHead from "./SectionHead";
import MagicCard from "../../components/ui/MagicCard";
import NumberTicker from "../../components/ui/NumberTicker";
import BorderBeam from "../../components/ui/BorderBeam";
import TextGenerateEffect from "../../components/ui/TextGenerateEffect";

export default function About() {
  const [ref, vis] = useReveal();
  const [cpu, setCpu] = useState({ c0: 18, c1: 24 });
  useEffect(() => {
    const t = setInterval(() => !document.hidden && setCpu({ c0: 12 + ~~(Math.random() * 22), c1: 18 + ~~(Math.random() * 24) }), 2000);
    return () => clearInterval(t);
  }, []);

  const bars = [["CPU[0]", cpu.c0, "var(--g)"], ["CPU[1]", cpu.c1, "var(--c)"], ["Mem", 42, "var(--b)"], ["Swap", 8, "var(--p)"]];

  return (
    <section id="about" className="sec">
      <SectionHead label="// 01 — PROCESS VIEW" title="ABOUT" accent="ME" />
      <div ref={ref} className={`reveal${vis ? " show" : ""} about-grid relative`}>
        <BorderBeam size={180} duration={10} />
        <div className="htop-pane">
          <div className="htop-header">
            {[["Tasks:", "24"], ["Running:", "6"], ["Sleeping:", "18"], ["Threads:", "142"]].map(([l, v]) => (
              <div key={l}><span className="htop-hlbl">{l}</span> <span className="htop-hval">{v}</span></div>
            ))}
          </div>
          {bars.map(([lbl, pct, col]) => (
            <div key={lbl} className="cpu-bar-row">
              <span className="cpu-bar-lbl">{lbl}</span>
              <div className="cpu-track">
                <div className="cpu-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg,transparent,${col})`, boxShadow: `0 0 10px ${col}` }} />
                <span className="cpu-val">{pct}%</span>
              </div>
            </div>
          ))}
          <table className="proc-table">
            <thead><tr>{["PID", "USER", "CPU%", "MEM%", "COMMAND"].map(h => <th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {PROCS.map(p => (
                <tr key={p.pid}>
                  <td style={{ color: "var(--tx3)" }}>{p.pid}</td>
                  <td style={{ color: "var(--c)" }}>{p.user}</td>
                  <td style={{ color: p.cpu > 15 ? "var(--a)" : "var(--tx)" }}>{p.cpu}</td>
                  <td style={{ color: "var(--tx)" }}>{p.mem}</td>
                  <td style={{ color: "var(--g)", fontWeight: 600 }}>{p.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-3.5 border-t border-line pt-2.5 text-[8px] tracking-[1.5px] text-tx3">
            LOAD AVG: <span className="text-g">0.18 0.22 0.19</span>&nbsp;&nbsp;UPTIME: <span className="text-c">4 years</span>
          </div>
        </div>
        <MagicCard className="bio-pane !border-0">
          <div className="mb-4 text-[9px] uppercase tracking-[3px] text-g">$ cat bio.txt</div>
          <TextGenerateEffect className="bio-p" words={`Backend developer based in ${PROFILE.location.city}, ${PROFILE.location.country}. I spend most of my time designing APIs, tuning database queries, and making sure systems stay up when they're supposed to.`} />
          <p className="bio-p">Currently building <span className="text-xs text-bright">PRPM</span> — a full-stack proposal management system with Node.js, TypeScript, Prisma, and React. Previously worked on auth gateways, mobile apps, and low-level C++ image processing tools.</p>
          <p className="bio-p">Outside of work: optimizing Neovim configs, reading about distributed consensus algorithms, and occasionally breaking production on purpose to see how it recovers.</p>
          <div className="bio-stats">
            {PROFILE.stats.map(s => (
              <div key={s.label} className="stat-block">
                <div className="stat-num glow-text"><NumberTicker value={s.value} suffix={s.suffix} /></div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </MagicCard>
      </div>
    </section>
  );
}
