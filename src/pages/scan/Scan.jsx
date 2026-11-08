import { useEffect, useMemo, useRef, useState } from "react";
import { animate, createScope, stagger } from "animejs";
import { SKILLS } from "../../data/profile";
import PageTitle from "../../components/fx/PageTitle";
import Ripple from "../../components/ui/Ripple";
import { seeded } from "../../lib/random";

/** nmap -sV: radar sweep (CSS conic) + blip port yang "terdeteksi" dianimasikan anime.js. */
export default function Scan() {
  const root = useRef(null);
  const lines = useMemo(() => [
    "Starting Nmap 7.95 ( https://nmap.org )",
    "Scanning porto.local (203.0.113.42) [1000 ports]",
    ...SKILLS.map((s, i) => `${`${3000 + i * 111}/tcp`.padEnd(10)}open  ${s.id.replace(".service", "").padEnd(12)} ${s.ver}`),
    "Service detection performed. 0 vulnerabilities found.",
    "Nmap done: 1 IP address (1 host up) scanned in 4.20 seconds",
  ], []);
  const blips = useMemo(() => {
    const rnd = seeded(5);
    return SKILLS.map((s, i) => {
      const a = (i / SKILLS.length) * Math.PI * 2 + rnd() * 0.4;
      const r = 22 + rnd() * 24;
      return { id: s.id, x: 50 + Math.cos(a) * r, y: 50 + Math.sin(a) * r };
    });
  }, []);
  const [n, setN] = useState(0);

  useEffect(() => {
    if (n >= lines.length) return;
    const id = setTimeout(() => setN(n + 1), n < 2 ? 600 : 260);
    return () => clearTimeout(id);
  }, [n, lines.length]);

  useEffect(() => {
    const scope = createScope({ root }).add(() => {
      animate(".blip", {
        scale: [0, 1.8, 1],
        opacity: [0, 1],
        delay: stagger(260, { start: 1300 }),
        duration: 700,
        ease: "outElastic(1, .6)",
      });
      animate(".blip-label", { opacity: [0, 1], translateY: [6, 0], delay: stagger(260, { start: 1500 }), duration: 400 });
    });
    return () => scope.revert();
  }, []);

  const done = n >= lines.length;
  return (
    <div className="pg">
      <PageTitle text="nmap -sV porto.local" sub="Simulasi port scan: tiap service yang jalan muncul sebagai blip di radar." />
      <div ref={root} className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div>
          <div className="bar" style={{ marginBottom: 16 }}><i style={{ width: (n / lines.length) * 100 + "%", transition: "width .25s" }} /></div>
          <pre className="text-[13px] leading-7">{lines.slice(0, n).join("\n")}{!done && <span className="cur" />}</pre>
          {done && <div className="mt-4 inline-block border border-g px-3 py-1 text-g glow-text">✓ HOST SECURE · {SKILLS.length} services fingerprinted</div>}
        </div>
        <div className="relative mx-auto aspect-square w-full max-w-[380px] overflow-hidden rounded-full border border-line2 bg-d0 shadow-[0_0_60px_#00ff4122,inset_0_0_60px_#00ff4118]" aria-label="radar">
          <Ripple mainCircleSize={90} numCircles={5} className="[mask-image:none]" />
          <div className="absolute inset-0 animate-spin [animation-duration:3.2s] rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,transparent_300deg,rgba(0,255,65,.05)_320deg,rgba(0,255,65,.55)_360deg)]" />
          <div className="absolute left-1/2 top-0 h-full w-px bg-line" /><div className="absolute left-0 top-1/2 h-px w-full bg-line" />
          {blips.map(b => (
            <div key={b.id} className="absolute" style={{ left: b.x + "%", top: b.y + "%" }}>
              <span className="blip block size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-g opacity-0 shadow-[0_0_14px_#00ff41]" />
              <span className="blip-label absolute left-2 top-1 whitespace-nowrap text-[9px] text-bright opacity-0">{b.id.replace(".service", "")}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
