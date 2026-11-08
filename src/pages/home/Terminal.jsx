import { useCallback, useEffect, useRef, useState } from "react";
import { TERM_COMMANDS } from "../../data/terminal";
import { PROFILE } from "../../data/profile";
import { ROUTES, prefetchRoute, resolveRouteQuery } from "../../app/routes";
import { useNavigate } from "../../app/router-context";
import { confettiBurst, fireworksShow } from "../../lib/celebrate";
import { toggleFx } from "../../lib/fx-store";
import { togglePalette } from "../../lib/events";
import { scrollTo } from "../../lib/scroll";

const ESC = String.fromCharCode(27);
const ANSI = new RegExp(`${ESC}\\[([a-z]+)\\](.*?)${ESC}\\[/\\1\\]`, "g");
const COLORS = { g: "var(--g)", c: "var(--c)", a: "var(--a)", r: "var(--r)", b: "var(--b)", d: "var(--tx3)" };
const paint = (k, s) => `${ESC}[${k}]${s}${ESC}[/${k}]`;

function parseAnsi(text) {
  const parts = [];
  let last = 0, m;
  ANSI.lastIndex = 0;
  while ((m = ANSI.exec(text)) !== null) {
    if (m.index > last) parts.push({ t: text.slice(last, m.index) });
    parts.push({ t: m[2], c: COLORS[m[1]] ?? "var(--bright)", bold: m[1] === "b" });
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push({ t: text.slice(last) });
  return parts;
}

const DYNAMIC = ["pages", "cd ", "open ", "confetti", "fireworks", "matrix", "palette", "date", "uptime", "echo ", "history", "exit", "clear"];

/** Terminal interaktif: perintah statis + perintah yang benar-benar menjalankan aksi (navigasi, efek). */
export default function Terminal() {
  const navigate = useNavigate();
  const [lines, setLines] = useState([{ type: "welcome", text: `${PROFILE.os} ${PROFILE.version} · Type "help" for available commands. Try "cd glxgears".` }]);
  const [input, setInput] = useState("");
  const [hist, setHist] = useState([]);
  const [hi, setHi] = useState(-1);
  const bodyRef = useRef(null);
  const inpRef = useRef(null);
  const timers = useRef([]);

  useEffect(() => {
    const t = timers.current;
    return () => t.forEach(clearTimeout);
  }, []);
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [lines]);

  const print = useCallback((text, isErr = false) => setLines(l => [...l, { type: "out", text, isErr }]), []);

  const run = useCallback(cmd => {
    const raw = cmd.trim();
    const c = raw.toLowerCase();
    setHist(h => [...h, raw]);
    setHi(-1);
    if (c === "clear") { setLines([]); return; }
    setLines(l => [...l, { type: "cmd", text: raw }]);

    if (c === "sudo rm -rf /" || c === "sudo rm -rf / --no-preserve-root") {
      const steps = ["removing /usr ...", "removing /etc ...", "removing /var/lib/postgresql ...", "removing /boot/vmlinuz ...", paint("r", "Kernel panic - not syncing: Attempted to kill init!")];
      steps.forEach((s, i) => timers.current.push(setTimeout(() => print(s, i === steps.length - 1), 280 * (i + 1))));
      timers.current.push(setTimeout(() => navigate("/panic"), 280 * steps.length + 700));
      return;
    }
    const [head, ...rest] = c.split(/\s+/);
    const arg = rest.join(" ");
    if (c === "pages" || c === "ls /") {
      print(ROUTES.map((r, i) => `${String(i).padStart(2)}  ${paint(r.group === "lab" ? "a" : "g", r.path.padEnd(13))} ${r.desc}`).join("\n") + `\n${paint("d", "open with: cd <name>")}`);
      return;
    }
    if (head === "cd" || head === "open") {
      const r = resolveRouteQuery(arg);
      if (!r) { print(`cd: ${arg || "(empty)"}: No such page. Type "pages".`, true); return; }
      print(`${paint("g", "→")} opening ${r.path} ...`);
      prefetchRoute(r.path);
      timers.current.push(setTimeout(() => navigate(r.path), 380));
      return;
    }
    if (c === "confetti") { confettiBurst(); print(paint("g", "🎉 deployed to production. zero downtime.")); return; }
    if (c === "fireworks") { fireworksShow(); print(paint("a", "✺ launching fireworks.service ...")); return; }
    if (c === "matrix") { toggleFx("rain"); print("matrix rain toggled (visible on every page except home)."); return; }
    if (c === "palette") { togglePalette(true); return; }
    if (c === "date") { print(new Date().toString()); return; }
    if (c === "uptime") { print(`up 4 years, ${Math.floor(performance.now() / 60000)} min in this session, load average: 0.18, 0.22, 0.19`); return; }
    if (head === "echo") { print(raw.slice(5)); return; }
    if (c === "history") { print([...hist, raw].map((h, i) => `${String(i + 1).padStart(4)}  ${h}`).join("\n") + `\n${paint("d", "cinematic version: cd history")}`); return; }
    if (c === "exit") { print("logout"); scrollTo(0, { offset: 0 }); return; }

    const fn = TERM_COMMANDS[c];
    print(fn ? fn() : `bash: ${raw}: command not found\nType "help" to see available commands.`, !fn);
  }, [navigate, print, hist]);

  const onKey = e => {
    if (e.key === "Enter") { if (input.trim()) run(input); setInput(""); }
    else if (e.key === "ArrowUp") { e.preventDefault(); const ni = Math.min(hi + 1, hist.length - 1); setHi(ni); setInput(hist[hist.length - 1 - ni] || ""); }
    else if (e.key === "ArrowDown") { e.preventDefault(); const ni = Math.max(hi - 1, -1); setHi(ni); setInput(ni === -1 ? "" : hist[hist.length - 1 - ni] || ""); }
    else if (e.key === "Tab") {
      e.preventDefault();
      const v = input.toLowerCase();
      if (/^(cd|open) /.test(v)) {
        const q = v.split(" ").slice(1).join(" ");
        const m = ROUTES.map(r => r.path.slice(1) || "home").find(p => p.startsWith(q));
        if (m) setInput(`${v.split(" ")[0]} ${m}`);
        return;
      }
      const m = [...Object.keys(TERM_COMMANDS), ...DYNAMIC].find(k => k.startsWith(v));
      if (m) setInput(m);
    }
  };

  const prompt = (
    <>
      <span className="text-g">{PROFILE.handle}@{PROFILE.host}</span><span className="text-tx3">:</span><span className="text-b">~</span><span className="text-tx">$ </span>
    </>
  );

  return (
    <div className="terminal" onClick={() => inpRef.current?.focus()}>
      <div className="term-bar">
        <div className="term-btns">{["#ff5f56", "#ffbd2e", "#27c93f"].map(c => <div key={c} className="term-btn" style={{ background: c }} />)}</div>
        <span className="term-title">{PROFILE.handle}@{PROFILE.host} — bash</span>
        <span className="text-[8px] tracking-[2px] text-tx3">5.2.15</span>
      </div>
      <div className="term-body" ref={bodyRef} data-lenis-prevent>
        {lines.map((line, i) => {
          if (line.type === "welcome") return <div key={i} className="term-out text-c">{line.text}</div>;
          if (line.type === "cmd") return <div key={i} className="term-out">{prompt}<span className="text-bright">{line.text}</span></div>;
          return (
            <div key={i} className="term-out" style={{ color: line.isErr ? "var(--r)" : "var(--tx2)" }}>
              <pre className="m-0 whitespace-pre-wrap break-words font-mono">
                {parseAnsi(line.text).map((p, j) => <span key={j} style={{ color: p.c, fontWeight: p.bold ? 700 : undefined }}>{p.t}</span>)}
              </pre>
            </div>
          );
        })}
        <div className="term-irow">
          <span className="term-prompt">{prompt}</span>
          <input ref={inpRef} className="term-inp" value={input} onChange={e => setInput(e.target.value)} onKeyDown={onKey} autoComplete="off" spellCheck={false} aria-label="Terminal input" />
        </div>
      </div>
    </div>
  );
}
