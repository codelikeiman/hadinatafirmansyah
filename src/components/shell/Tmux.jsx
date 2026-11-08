import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { ROUTES, prefetchRoute } from "../../app/routes";
import { useRouter } from "../../app/router-context";
import { togglePalette } from "../../lib/events";
import { cn } from "../../lib/cn";

function Clock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="tabular-nums">{now.toLocaleTimeString("id-ID")}</span>;
}

const isTyping = el => el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);

/**
 * Status bar ala tmux: daftar window = semua route, highlight aktif pakai
 * Motion `layoutId`, prefetch chunk saat hover, dan prefix key tmux asli:
 *   ctrl+b n → window berikutnya · ctrl+b p → sebelumnya · ctrl+b 0-9 → lompat
 */
export default function Tmux() {
  const { path, navigate } = useRouter();
  const [prefix, setPrefix] = useState(false);
  const barRef = useRef(null);
  const idx = ROUTES.findIndex(r => r.path === path);
  const current = ROUTES.find(r => r.path === path);

  useEffect(() => {
    let armed = false, timer = 0;
    const disarm = () => { armed = false; setPrefix(false); clearTimeout(timer); };
    const onKey = e => {
      if (e.ctrlKey && e.key.toLowerCase() === "b") {
        e.preventDefault();
        armed = true;
        setPrefix(true);
        clearTimeout(timer);
        timer = setTimeout(disarm, 1600);
        return;
      }
      if (!armed || isTyping(document.activeElement)) return;
      const cur = Math.max(0, ROUTES.findIndex(r => r.path === window.location.hash.slice(1)));
      let next = -1;
      if (e.key === "n") next = (cur + 1) % ROUTES.length;
      else if (e.key === "p") next = (cur - 1 + ROUTES.length) % ROUTES.length;
      else if (/^[0-9]$/.test(e.key)) next = Math.min(Number(e.key), ROUTES.length - 1);
      if (next >= 0) {
        e.preventDefault();
        navigate(ROUTES[next].path);
      }
      disarm();
    };
    addEventListener("keydown", onKey);
    return () => { removeEventListener("keydown", onKey); clearTimeout(timer); };
  }, [navigate]);

  // jaga window aktif tetap terlihat di bar yang bisa di-scroll (mobile). Sengaja TIDAK
  // memakai scrollIntoView: itu ikut menggeser dokumen secara horizontal.
  useEffect(() => {
    const bar = barRef.current, el = bar?.querySelector('[data-on="1"]');
    if (!bar || !el) return;
    bar.scrollTo({ left: el.offsetLeft - bar.clientWidth / 2 + el.offsetWidth / 2, behavior: "smooth" });
  }, [path]);

  return (
    <nav className="tmux" style={{ viewTransitionName: "tmux" }} aria-label="Navigasi halaman">
      <span className={cn("tm-l", prefix && "tm-prefix")}>{prefix ? "^B ▸" : "[porto]"} {idx >= 0 ? idx : "!"}:{current?.name ?? "panic"}*</span>
      <div ref={barRef} className="tm-windows no-scrollbar">
        {ROUTES.map((r, i) => {
          const on = r.path === path;
          return (
            <button
              key={r.path}
              type="button"
              data-on={on ? "1" : "0"}
              data-cursor={r.desc}
              className={cn("fx-tab", on && "on", r.group === "lab" && "lab")}
              onMouseEnter={() => prefetchRoute(r.path)}
              onFocus={() => prefetchRoute(r.path)}
              onClick={() => navigate(r.path)}
              aria-current={on ? "page" : undefined}
            >
              {on && <motion.span layoutId="tmux-active" className="fx-tab-bg" transition={{ type: "spring", stiffness: 520, damping: 38 }} />}
              <span className="relative">{i}:{r.name}{r.group === "lab" && <i className="tm-dot" />}</span>
            </button>
          );
        })}
      </div>
      <button type="button" className="tm-r" onClick={() => togglePalette()} data-cursor="command palette">
        <span className="kbd">ctrl+k │ </span><Clock />
      </button>
    </nav>
  );
}
