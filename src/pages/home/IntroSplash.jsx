import { useCallback, useEffect, useRef, useState } from "react";
import { GREETING_LANGS, GREETING_PHRASE } from "../../data/greetings";

function highlightGreeting(text) {
  const idx = text.indexOf(GREETING_PHRASE);
  if (idx === -1) return text;
  const end = idx + GREETING_PHRASE.length;
  return (
    <>
      {text.slice(0, idx)}
      <span className="intro-highlight">{text.slice(idx, end)}</span>
      {text.slice(end)}
    </>
  );
}

/** Intro polyglot: "halo, saya firmansyah" diketik dalam 38 bahasa pemrograman. */
export default function IntroSplash({ onComplete }) {
  const [langIndex, setLangIndex] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [exiting, setExiting] = useState(false);
  const doneRef = useRef(false);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    setExiting(true);
    setTimeout(onComplete, 520);
  }, [onComplete]);

  useEffect(() => {
    if (langIndex >= GREETING_LANGS.length) {
      const t = setTimeout(finish, 240);
      return () => clearTimeout(t);
    }
    const code = GREETING_LANGS[langIndex].code;
    if (charCount < code.length) {
      const step = 2 + Math.floor(Math.random() * 3);
      const t = setTimeout(() => setCharCount(c => Math.min(c + step, code.length)), 8 + Math.random() * 6);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => { setLangIndex(i => i + 1); setCharCount(0); }, 200);
    return () => clearTimeout(t);
  }, [langIndex, charCount, finish]);

  useEffect(() => {
    const onKey = e => { if (e.key === "Enter" || e.key === "Escape" || e.key === " ") finish(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [finish]);

  const total = GREETING_LANGS.length;
  const cur = GREETING_LANGS[Math.min(langIndex, total - 1)];
  const typed = cur.code.slice(0, langIndex >= total ? cur.code.length : charCount);
  const pct = Math.min((langIndex / total) * 100, 100);

  return (
    <div className={`intro-overlay${exiting ? " exiting" : ""}`} onClick={finish} role="dialog" aria-label="Intro">
      <div className="intro-inner">
        <div className="intro-lang-tag">
          <span>{cur.lang}</span>
          <span>{String(Math.min(langIndex + 1, total)).padStart(2, "0")} / {total}</span>
        </div>
        <div className="intro-code-block">
          <pre>{highlightGreeting(typed)}<span className="intro-cursor" /></pre>
        </div>
        <div className="intro-footer">
          <span>INITIALIZING GREETING SEQUENCE…</span>
          <span className="intro-skip">PRESS ENTER OR CLICK TO SKIP ▸</span>
        </div>
      </div>
      <div className="intro-progress-bar"><div className="intro-progress-fill" style={{ width: `${pct}%` }} /></div>
    </div>
  );
}
