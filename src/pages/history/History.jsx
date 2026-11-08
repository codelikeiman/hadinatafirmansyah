import { useEffect, useRef, useState } from "react";
import { useScroll } from "motion/react";
import { CHAPTERS, LENGTH, PROJECT_STATE, SHEET, stationTime } from "./script";
import Link from "../../app/Link";
import { scrollTo } from "../../lib/scroll";
import { canUseWebGL } from "../../lib/media";
import { cn } from "../../lib/cn";

const SCROLL_VH = 120; // vh scroll per detik sequence

const timecode = pos => {
  const s = Math.floor(pos), f = Math.floor((pos - s) * 24);
  return `00:00:${String(s).padStart(2, "0")}:${String(f).padStart(2, "0")}`;
};

/**
 * history | cinema — scroll menggerakkan playhead Theatre.js. Theatre meng-
 * interpolasi kamera, atmosfer, dan kartu chapter; scene Three.js & DOM
 * di-update langsung (tanpa re-render React per frame).
 */
export default function History() {
  const trackRef = useRef(null);
  const stageRef = useRef(null);
  const cardRefs = useRef([]);
  const introRef = useRef(null);
  const tcRef = useRef(null);
  const barRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });

  useEffect(() => {
    let disposed = false, cleanup = () => {};
    (async () => {
      const wantStudio = import.meta.env.DEV && /[?&]studio/.test(window.location.hash);
      // @theatre/core HARUS dimuat sebelum @theatre/studio
      const core = await import("@theatre/core");
      if (wantStudio) {
        const sm = await import("@theatre/studio");
        const studio = sm.default?.default ?? sm.default ?? sm; // interop CJS
        studio.initialize();
      }
      const scene = canUseWebGL() ? await import("./cinemaScene").then(m => m.createCinema(stageRef.current)) : null;
      if (disposed) { scene?.dispose(); return; }

      const getProject = core.getProject ?? core.default?.getProject; // interop CJS
      const project = getProject("Firman Cinema", { state: PROJECT_STATE });
      await project.ready;
      if (disposed) { scene?.dispose(); return; }
      const sheet = project.sheet(SHEET);
      const opts = { reconfigure: true };
      const cam = sheet.object("Camera", { x: 0, y: 1.6, z: 16, roll: 0, fov: 55 }, opts);
      const atmos = sheet.object("Atmosphere", { hue: 0, density: 0.018, warp: 0 }, opts);
      const intro = sheet.object("Intro", { opacity: 1, y: 0, blur: 0 }, opts);
      const chapters = CHAPTERS.map((_, i) => sheet.object(`Chapter${i + 1}`, { opacity: 0, y: 70, blur: 14 }, opts));

      const styleCard = (el, v) => {
        if (!el) return;
        el.style.opacity = v.opacity;
        el.style.transform = `translate3d(0,${v.y}px,0)`;
        el.style.filter = v.blur > 0.2 ? `blur(${v.blur}px)` : "none";
        el.style.visibility = v.opacity < 0.01 ? "hidden" : "visible";
      };
      const unsubs = [
        cam.onValuesChange(v => scene?.set(v)),
        atmos.onValuesChange(v => scene?.set(v)),
        intro.onValuesChange(v => styleCard(introRef.current, v)),
        ...chapters.map((o, i) => o.onValuesChange(v => styleCard(cardRefs.current[i], v))),
      ];

      const onProgress = p => {
        const pos = Math.max(0, Math.min(LENGTH, p * LENGTH));
        sheet.sequence.position = pos;
        if (tcRef.current) tcRef.current.textContent = timecode(pos);
        if (barRef.current) barRef.current.style.transform = `scaleX(${pos / LENGTH})`;
        let idx = 0;
        CHAPTERS.forEach((_, i) => { if (pos >= stationTime(i + 1) - 0.6) idx = i + 1; });
        setActive(idx);
      };
      const offScroll = scrollYProgress.on("change", onProgress);
      onProgress(scrollYProgress.get());
      setReady(true);

      cleanup = () => {
        offScroll();
        unsubs.forEach(u => u());
        ["Camera", "Atmosphere", "Intro", ...CHAPTERS.map((_, i) => `Chapter${i + 1}`)].forEach(k => sheet.detachObject(k));
        scene?.dispose();
      };
    })().catch(err => console.error("[history]", err));
    return () => { disposed = true; cleanup(); };
  }, [scrollYProgress]);

  const jump = k => {
    const el = trackRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const span = el.offsetHeight - window.innerHeight;
    const t = k === 0 ? 0 : stationTime(k) + 0.1;
    scrollTo(top + span * (t / LENGTH), { offset: 0, duration: 2.2 });
  };

  return (
    <div ref={trackRef} className="relative" style={{ height: `${LENGTH * SCROLL_VH}vh` }}>
      <div className="sticky top-0 h-[calc(100dvh-30px)] overflow-hidden">
        <div ref={stageRef} className="absolute inset-0" />
        {/* letterbox + grain + vignette */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[6vh] bg-black" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[6vh] bg-black" />
        <div className="film-grain pointer-events-none absolute inset-0 opacity-[.08] mix-blend-screen" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,.75))]" />

        <div className="pointer-events-none absolute left-5 top-[calc(6vh+12px)] flex items-center gap-3 text-[11px] tracking-[.25em] text-bright sm:left-10">
          <span className="text-red animate-flicker">● REC</span>
          <span ref={tcRef} className="tabular-nums">00:00:00:00</span>
          <span className="text-tx2">history | cinema</span>
        </div>

        <div ref={introRef} className="absolute inset-0 grid place-items-center px-6 text-center will-change-transform">
          <div>
            <div className="mb-3 text-[11px] tracking-[.5em] text-tx2">A FIRMAN.OS PRODUCTION</div>
            <h1 className="text-[clamp(2rem,7vw,5.5rem)] font-extrabold leading-none text-bright glow-text" style={{ viewTransitionName: "page-title" }}>history | cinema</h1>
            <p className="mx-auto mt-5 max-w-md text-[13px] leading-6 text-tx2">Perjalanan karier sebagai sinema yang dikendalikan scroll. Kamera, kabut, dan setiap adegan di-keyframe dengan Theatre.js.</p>
            <div className="mt-8 animate-bounce text-[11px] tracking-[.4em] text-g">▼ SCROLL TO PLAY ▼</div>
          </div>
        </div>

        {CHAPTERS.map((c, i) => (
          <div key={c.year} ref={el => { cardRefs.current[i] = el; }} className={cn("absolute top-1/2 w-[min(440px,86vw)] -translate-y-1/2 will-change-transform", i % 2 ? "right-5 sm:right-[7vw]" : "left-5 sm:left-[7vw]")} style={{ opacity: 0, visibility: "hidden" }}>
            <div className="border bg-black/70 p-5 backdrop-blur-md sm:p-6" style={{ borderColor: c.color, boxShadow: `0 0 50px ${c.color}33, inset 0 0 40px ${c.color}11` }}>
              <div className="text-[11px] tracking-[.35em]" style={{ color: c.color }}>CHAPTER {String(i + 1).padStart(2, "0")} · {c.where.toUpperCase()}</div>
              <div className="mt-2 text-5xl font-extrabold leading-none sm:text-6xl" style={{ color: c.color, textShadow: `0 0 30px ${c.color}` }}>{c.year}</div>
              <div className="mt-3 text-lg font-bold text-bright">{c.title}</div>
              <p className="mt-2 text-[13px] leading-6 text-tx">{c.text}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {c.stack.map(s => <span key={s} className="border px-2 py-0.5 text-[10px] tracking-wider text-bright" style={{ borderColor: `${c.color}88` }}>{s}</span>)}
              </div>
              {i === CHAPTERS.length - 1 && (
                <div className="mt-5 flex flex-wrap gap-2 text-[11px]">
                  <Link to="/" className="border border-g bg-g px-3 py-1.5 font-bold text-black no-underline">⌂ HOME</Link>
                  <Link to="/htop" className="border border-line2 px-3 py-1.5 text-tx2 no-underline hover:text-g">▤ htop</Link>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* scrubber timeline */}
        <div className="absolute inset-x-5 bottom-[calc(6vh+14px)] sm:inset-x-10">
          <div className="relative h-px bg-line2">
            <div ref={barRef} className="absolute inset-0 origin-left bg-g shadow-[0_0_10px_#00ff41]" style={{ transform: "scaleX(0)" }} />
            {[0, ...CHAPTERS.map((_, i) => i + 1)].map(k => {
              const t = k === 0 ? 0 : stationTime(k);
              return (
                <button key={k} type="button" onClick={() => jump(k)} className="group absolute -top-3 -translate-x-1/2 px-1 py-1" style={{ left: `${(t / LENGTH) * 100}%` }} data-cursor={k === 0 ? "intro" : CHAPTERS[k - 1].year}>
                  <span className={cn("block size-2.5 rotate-45 border transition-colors", active >= k ? "border-g bg-g shadow-[0_0_10px_#00ff41]" : "border-line2 bg-black")} />
                  <span className="absolute left-1/2 top-5 -translate-x-1/2 whitespace-nowrap text-[9px] tracking-widest text-tx2 opacity-70 group-hover:text-g">{k === 0 ? "START" : CHAPTERS[k - 1].year}</span>
                </button>
              );
            })}
          </div>
        </div>

        {!ready && <div className="absolute inset-0 grid place-items-center text-[12px] tracking-[.3em] text-tx2">LOADING THEATRE.JS…</div>}
      </div>
    </div>
  );
}
