import { useEffect, useRef } from "react";
import { SKILLS, TOOLCHAIN } from "../../data/profile";
import SectionHead from "./SectionHead";
import OrbitingCircles from "../../components/ui/OrbitingCircles";
import Marquee from "../../components/ui/Marquee";
import { prefersReducedMotion } from "../../lib/media";

const short = id => id.replace(".service", "");

export default function Skills() {
  const winRef = useRef(null);

  // GSAP ScrollTrigger: baris tabel meluncur masuk + bar load terisi, di-scrub oleh scroll (Lenis)
  useEffect(() => {
    if (prefersReducedMotion()) return;
    let ctx = null, cancelled = false;
    import("../../lib/gsap").then(({ gsap }) => {
      if (cancelled || !winRef.current) return;
      ctx = gsap.context(() => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: winRef.current, start: "top 80%", end: "top 25%", scrub: 0.6 } });
        tl.from(".services-table tbody tr", { x: -60, opacity: 0, stagger: 0.06, ease: "power2.out" })
          .from(".svc-fill", { scaleX: 0, transformOrigin: "left center", stagger: 0.05, ease: "power2.out" }, 0.1);
      }, winRef);
    });
    return () => { cancelled = true; ctx?.revert(); };
  }, []);

  const inner = SKILLS.slice(0, 5), outer = SKILLS.slice(5);

  return (
    <section id="skills" className="sec">
      <SectionHead label="// 02 — SERVICE UNITS" title="TECH" accent="STACK" />
      <div ref={winRef} className="sec-win">
        <div className="win-bar">
          <div className="win-buttons">{["#ff5f56", "#ffbd2e", "#27c93f"].map(c => <div key={c} className="win-btn" style={{ background: c }} />)}</div>
          <span className="win-title">systemctl list-units --type=service</span>
          <div className="win-tag"><div className="size-[5px] rounded-full bg-g" style={{ animation: "p-dot 2s infinite" }} />RUNNING</div>
        </div>
        <div className="overflow-x-auto">
          <table className="services-table">
            <thead><tr><th>UNIT</th><th>DESCRIPTION</th><th>STATE</th><th>VERSION</th><th>UPTIME</th><th>PID</th><th>LOAD %</th></tr></thead>
            <tbody>
              {SKILLS.map(s => (
                <tr key={s.id}>
                  <td><span className="svc-name">{s.id}</span></td>
                  <td className="text-[13px] text-tx2">{s.desc}</td>
                  <td><div className="svc-running"><div className="svc-dot" />active</div></td>
                  <td className="text-[9px] text-c">{s.ver}</td>
                  <td className="text-[9px] text-tx2">{s.up}</td>
                  <td className="text-[9px] text-tx3">{s.pid}</td>
                  <td>
                    <div className="svc-bar"><div className="svc-fill" style={{ width: `${s.load}%` }} /></div>
                    <span className="mt-0.5 block text-[8px] text-tx2">{s.load}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="svc-summary border-t border-line bg-d0 px-4 py-3">
          <span className="green">{SKILLS.length} loaded</span>
          <span className="green">{SKILLS.length} active</span>
          <span className="text-tx3">0 failed</span>
          <span className="text-tx3">0 inactive</span>
        </div>
      </div>

      <div className="mt-10 grid items-center gap-8 lg:grid-cols-[1fr_420px]">
        <div className="min-w-0">
          <div className="mb-3.5 text-[8px] uppercase tracking-[4px] text-tx3">— additional toolchain —</div>
          <Marquee pauseOnHover className="[--duration:28s] [mask-image:linear-gradient(to_right,transparent,#000_10%,#000_90%,transparent)]">
            {TOOLCHAIN.map(t => <span key={t} className="border border-line px-3 py-1.5 text-[10px] tracking-[2px] text-tx2 transition-colors hover:border-g hover:text-g">{t}</span>)}
          </Marquee>
          <Marquee reverse pauseOnHover className="[--duration:34s] [mask-image:linear-gradient(to_right,transparent,#000_10%,#000_90%,transparent)]">
            {SKILLS.map(s => <span key={s.id} className="border border-line2/60 bg-d1 px-3 py-1.5 text-[10px] tracking-[2px] text-c">{short(s.id)}@{s.ver}</span>)}
          </Marquee>
        </div>
        <div className="relative mx-auto flex size-[340px] items-center justify-center sm:size-[400px]" aria-label="Orbit stack">
          <div className="z-10 border border-g bg-black px-3 py-2 text-center text-[11px] text-g shadow-[0_0_30px_#00ff4166] glow-text">
            <div className="text-[8px] tracking-[3px] text-tx2">KERNEL</div>node.js
          </div>
          <OrbitingCircles radius={95} duration={18} iconSize={64}>
            {inner.map(s => <span key={s.id} className="whitespace-nowrap border border-line2 bg-black px-1.5 py-0.5 text-[9px] text-bright">{short(s.id)}</span>)}
          </OrbitingCircles>
          <OrbitingCircles radius={170} duration={30} reverse iconSize={72}>
            {outer.map(s => <span key={s.id} className="whitespace-nowrap border border-b/60 bg-black px-1.5 py-0.5 text-[9px] text-b">{short(s.id)}</span>)}
          </OrbitingCircles>
        </div>
      </div>
    </section>
  );
}
