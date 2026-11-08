import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ROUTES, prefetchRoute } from "../../app/routes";
import { useRouter } from "../../app/router-context";
import { getFx, toggleFx } from "../../lib/fx-store";
import { confettiBurst, fireworksShow } from "../../lib/celebrate";
import { lockScroll, scrollTo } from "../../lib/scroll";
import { PROFILE } from "../../data/profile";
import { fuzzyScore } from "../../lib/fuzzy";
import { cn } from "../../lib/cn";
import { PALETTE_EVENT } from "../../lib/events";

function buildActions(navigate) {
  const fx = getFx();
  return [
    { id: "a-confetti", group: "actions", glyph: "✦", label: "confetti", desc: "rayakan sesuatu", run: () => confettiBurst() },
    { id: "a-fireworks", group: "actions", glyph: "✺", label: "fireworks", desc: "pertunjukan kembang api tsParticles", run: () => fireworksShow() },
    { id: "a-crt", group: "actions", glyph: "▥", label: `crt ${fx.crt ? "off" : "on"}`, desc: "toggle overlay scanline CRT", run: () => toggleFx("crt") },
    { id: "a-rain", group: "actions", glyph: "┋", label: `matrix ${fx.rain ? "off" : "on"}`, desc: "toggle hujan karakter", run: () => toggleFx("rain") },
    { id: "a-cursor", group: "actions", glyph: "⌖", label: `cursor ${fx.cursor ? "off" : "on"}`, desc: "toggle kursor reticle", run: () => toggleFx("cursor") },
    { id: "a-top", group: "actions", glyph: "↑", label: "scroll top", desc: "kembali ke atas halaman", run: () => scrollTo(0, { offset: 0 }) },
    { id: "a-mail", group: "actions", glyph: "@", label: "copy email", desc: PROFILE.contact.email, run: () => navigator.clipboard?.writeText(PROFILE.contact.email) },
    { id: "a-panic", group: "actions", glyph: "☠", label: "sudo rm -rf /", desc: "jangan.", run: () => navigate("/panic") },
  ];
}

function Highlight({ text, hits }) {
  if (!hits?.length) return text;
  const set = new Set(hits);
  return text.split("").map((ch, i) => (set.has(i) ? <b key={i} className="text-bright">{ch}</b> : ch));
}

/** Command palette (Ctrl/⌘+K): fuzzy search route & aksi, highlight shared-layout. */
export default function Palette() {
  const { navigate, path } = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const listRef = useRef(null);

  const openPalette = next => {
    setOpen(o => (typeof next === "boolean" ? next : !o));
    setQ("");
    setSel(0);
  };

  useEffect(() => {
    const onKey = e => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        openPalette();
      } else if (e.key === "Escape") setOpen(false);
    };
    const onToggle = e => openPalette(e.detail);
    addEventListener("keydown", onKey);
    addEventListener(PALETTE_EVENT, onToggle);
    return () => {
      removeEventListener("keydown", onKey);
      removeEventListener(PALETTE_EVENT, onToggle);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    lockScroll(true);
    return () => lockScroll(false);
  }, [open]);

  const items = useMemo(() => {
    if (!open) return [];
    const routes = ROUTES.map(r => ({
      id: r.path, group: r.group === "lab" ? "lab" : "pages", glyph: r.glyph, label: r.cmd, desc: r.desc,
      badge: r.badge, current: r.path === path, path: r.path, run: () => navigate(r.path),
    }));
    const all = [...routes, ...buildActions(navigate)];
    const needle = q.trim().toLowerCase();
    return all
      .map(it => {
        const a = fuzzyScore(needle, it.label);
        const b = fuzzyScore(needle, it.desc);
        const s = Math.max(a?.score ?? -1, (b?.score ?? -1) * 0.6);
        return s < 0 ? null : { ...it, hits: a?.hits, s };
      })
      .filter(Boolean)
      .sort((x, y) => (needle ? y.s - x.s : 0))
      .map((it, i, arr) => ({ ...it, header: !needle && (i === 0 || arr[i - 1].group !== it.group) ? it.group : null }));
  }, [open, q, path, navigate]);

  const active = items[Math.min(sel, items.length - 1)];

  useEffect(() => {
    if (active?.path) prefetchRoute(active.path);
    const list = listRef.current, el = list?.querySelector('[data-active="1"]');
    if (list && el) {
      if (el.offsetTop < list.scrollTop) list.scrollTop = el.offsetTop;
      else if (el.offsetTop + el.offsetHeight > list.scrollTop + list.clientHeight) list.scrollTop = el.offsetTop + el.offsetHeight - list.clientHeight;
    }
  }, [active]);

  const run = it => {
    if (!it) return;
    setOpen(false);
    it.run();
  };

  const onKeyDown = e => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSel(s => (s + 1) % Math.max(items.length, 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSel(s => (s - 1 + items.length) % Math.max(items.length, 1)); }
    else if (e.key === "Enter") { e.preventDefault(); run(active); }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[99998] grid place-items-start justify-center bg-black/70 px-4 pt-[14vh] backdrop-blur-[3px]"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onPointerDown={() => setOpen(false)}
          role="dialog" aria-modal="true" aria-label="Command palette"
        >
          <motion.div
            className="relative w-[min(640px,94vw)] overflow-hidden border border-g bg-d0/95 shadow-[0_0_0_1px_#00ff4122,0_0_80px_#00ff4155,inset_0_0_60px_#00ff410d]"
            initial={{ scale: 0.92, y: -24, filter: "blur(8px)" }}
            animate={{ scale: 1, y: 0, filter: "blur(0px)" }}
            exit={{ scale: 0.96, y: -8, opacity: 0, filter: "blur(6px)" }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
            onPointerDown={e => e.stopPropagation()}
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-g to-transparent" />
            <div className="flex items-center gap-2 border-b border-line px-4 py-3 text-sm">
              <span className="text-b">root@porto:~#</span>
              <input
                autoFocus
                value={q}
                onChange={e => { setQ(e.target.value); setSel(0); }}
                onKeyDown={onKeyDown}
                placeholder="ketik perintah atau nama halaman…"
                className="min-w-0 flex-1 border-0 bg-transparent text-bright outline-none placeholder:text-tx3"
                aria-label="Cari perintah"
              />
              <kbd className="border border-line px-1.5 text-[10px] text-tx2">ESC</kbd>
            </div>
            <div ref={listRef} data-lenis-prevent className="max-h-[52vh] overflow-y-auto py-2 no-scrollbar">
              {items.length === 0 && <div className="px-4 py-6 text-sm text-tx2">bash: {q}: command not found</div>}
              {items.map((it, i) => {
                const on = it === active;
                return (
                  <div key={it.id}>
                    {it.header && <div className="px-4 pb-1 pt-3 text-[10px] uppercase tracking-[.3em] text-tx3">{it.header}</div>}
                    <button
                      type="button"
                      data-active={on ? "1" : "0"}
                      onMouseMove={() => setSel(i)}
                      onClick={() => run(it)}
                      className={cn("relative flex w-full items-center gap-3 px-4 py-2 text-left text-[13px]", on ? "text-black" : "text-tx")}
                    >
                      {on && (
                        <motion.span layoutId="palette-pill" className="absolute inset-0 bg-g shadow-[0_0_24px_#00ff41]" transition={{ type: "spring", stiffness: 600, damping: 40 }} />
                      )}
                      <span className="relative w-4 text-center">{it.glyph}</span>
                      <span className="relative font-medium">$ <Highlight text={it.label} hits={it.hits} /></span>
                      <span className={cn("relative truncate text-xs", on ? "text-black/70" : "text-tx2")}>{it.desc}</span>
                      {it.badge && <span className={cn("relative ml-auto border px-1.5 text-[9px] tracking-widest", on ? "border-black/40" : "border-line2 text-b")}>{it.badge}</span>}
                      {it.current && <span className={cn("relative text-[10px]", it.badge ? "" : "ml-auto")}>●</span>}
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-4 border-t border-line px-4 py-2 text-[10px] tracking-widest text-tx3">
              <span>↑↓ pilih</span><span>↵ jalankan</span><span>esc tutup</span>
              <span className="ml-auto">tmux: ctrl+b n / p / 0-9</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
