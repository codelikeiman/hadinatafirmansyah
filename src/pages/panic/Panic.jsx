import { useEffect, useMemo, useState } from "react";
import { animate, motion } from "motion/react";
import { useRouter } from "../../app/router-context";
import ShaderField from "../../components/fx/ShaderField";
import { prefersReducedMotion } from "../../lib/media";

const TRACE = [
  "[    0.000000] Linux version 6.6.0-firman (gcc 13.2) #1 SMP PREEMPT_DYNAMIC",
  "[    2.417812] EXT4-fs (nvme0n1p2): mounted filesystem with ordered data mode",
  "[    4.201337] systemd[1]: Started portfolio.service - Firman.OS Portfolio.",
  "[   13.370042] BUG: unable to handle page fault for address: 0000000000000404",
  "[   13.370051] #PF: supervisor read access in kernel mode",
  "[   13.370058] Oops: 0000 [#1] PREEMPT SMP NOPTI",
  "[   13.370066] CPU: 0 PID: 1 Comm: router Tainted: G      D      6.6.0-firman",
  "[   13.370074] RIP: 0010:resolve_route+0x42/0x404 [portfolio]",
  "[   13.370081] Call Trace:",
  "[   13.370083]  <TASK>",
  "[   13.370089]  hashchange_handler+0x1f/0x80",
  "[   13.370095]  findRoute+0x13/0x37 [portfolio]",
  "[   13.370101]  startViewTransition+0x9c/0x200",
  "[   13.370106]  </TASK>",
  "[   13.370112] Kernel panic - not syncing: Attempted to kill init! exitcode=0x00000404",
  "[   13.370120] ---[ end Kernel panic - not syncing: Attempted to kill init! ]---",
];

const REBOOT_S = 15;

/** 404 / `sudo rm -rf /`: kernel panic dengan dump, glitch, dan reboot otomatis. */
export default function Panic() {
  const { navigate } = useRouter();
  const [shown, setShown] = useState(() => (prefersReducedMotion() ? TRACE.length : 0));
  const [left, setLeft] = useState(REBOOT_S);
  const [cancelled, setCancelled] = useState(false);
  const badPath = useMemo(() => window.location.hash.slice(1) || "/", []);
  const done = shown >= TRACE.length;

  useEffect(() => {
    if (done) return;
    const t = setTimeout(() => setShown(n => n + 1), shown < 3 ? 260 : 90);
    return () => clearTimeout(t);
  }, [shown, done]);

  useEffect(() => {
    if (!done || cancelled) return;
    if (left <= 0) { navigate("/"); return; }
    const t = setTimeout(() => setLeft(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [done, left, cancelled, navigate]);

  // Motion animate(): layar "berkedip" seperti CRT yang kehilangan sinyal
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctl = animate("#panic-screen", { opacity: [1, 0.2, 1, 0.6, 1], filter: ["none", "hue-rotate(90deg) brightness(2)", "none", "invert(1)", "none"] }, { duration: 0.9, times: [0, 0.2, 0.4, 0.6, 1] });
    return () => ctl.stop();
  }, []);

  return (
    <div id="panic-screen" className="relative min-h-[calc(100dvh-30px)] overflow-hidden bg-black text-[#ffb3b3]">
      <div className="absolute inset-0 opacity-30"><ShaderField preset="ember" /></div>
      <div className="relative mx-auto max-w-[1000px] px-5 py-10 sm:px-10">
        <motion.h1
          className="animate-glitch text-[clamp(2rem,7vw,4.5rem)] font-extrabold leading-none text-red"
          style={{ textShadow: "3px 0 #00f0ff, -3px 0 #ffd400, 0 0 30px #ff003c", viewTransitionName: "page-title" }}
          initial={{ letterSpacing: "0.5em", opacity: 0 }} animate={{ letterSpacing: "0em", opacity: 1 }} transition={{ duration: 0.8 }}
        >
          KERNEL PANIC
        </motion.h1>
        <p className="mt-3 text-[13px] text-[#ff8a8a]">
          {badPath === "/panic" ? "Seseorang menjalankan sudo rm -rf /. Tentu saja." : <>Halaman <code className="bg-red/20 px-1 text-white">#{badPath}</code> tidak ada di sistem ini (404).</>}
        </p>
        <pre className="mt-6 overflow-x-auto whitespace-pre text-[11px] leading-5 sm:text-[12px]">
          {TRACE.slice(0, shown).map((l, i) => (
            <div key={i} className={i >= TRACE.length - 2 ? "font-bold text-red" : i >= 3 && i <= 7 ? "text-[#ffcf6b]" : ""}>{l}</div>
          ))}
          {!done && <span className="inline-block h-4 w-2 animate-pulse bg-red" />}
        </pre>
        {done && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-8 flex flex-wrap items-center gap-3 text-[12px]">
            <button type="button" onClick={() => navigate("/")} className="border border-red bg-red px-4 py-2 font-bold tracking-widest text-black hover:bg-white">↻ REBOOT NOW</button>
            <button type="button" onClick={() => window.history.back()} className="border border-red/60 px-4 py-2 tracking-widest text-[#ffb3b3] hover:border-white hover:text-white">← BACK</button>
            {!cancelled ? (
              <span className="text-[#ff8a8a]">auto-reboot dalam <b className="tabular-nums text-white">{left}s</b> · <button type="button" className="underline decoration-dotted" onClick={() => setCancelled(true)}>batalkan</button></span>
            ) : <span className="text-[#ff8a8a]">auto-reboot dibatalkan.</span>}
          </motion.div>
        )}
      </div>
    </div>
  );
}
