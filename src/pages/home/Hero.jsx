import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { animate, scrambleText, splitText, stagger } from "animejs";
import { BOOT_LINES, CONTACT_LINKS, PROFILE } from "../../data/profile";
import ShaderField from "../../components/fx/ShaderField";
import Spotlight from "../../components/ui/Spotlight";
import Magnetic from "../../components/ui/Magnetic";
import AsciiArt from "./AsciiArt";
import { scrollTo } from "../../lib/scroll";
import { togglePalette } from "../../lib/events";
import { prefersReducedMotion } from "../../lib/media";

const ROLE = "BACKEND DEVELOPER  &  SYSTEMS ENGINEER";

export default function Hero() {
  const heroRef = useRef(null);
  const nameRef = useRef(null);
  const roleRef = useRef(null);
  const [shown, setShown] = useState(0);
  const [nameVis, setNameVis] = useState(false);
  const [restVis, setRestVis] = useState(false);

  // boot log baris demi baris
  useEffect(() => {
    const timers = BOOT_LINES.map(({ t }, i) => setTimeout(() => setShown(i + 1), t));
    timers.push(setTimeout(() => setNameVis(true), 3900));
    timers.push(setTimeout(() => setRestVis(true), 4200));
    return () => timers.forEach(clearTimeout);
  }, []);

  // anime.js: nama dipecah per huruf lalu "dijatuhkan" berurutan dengan rotasi 3D
  useEffect(() => {
    if (!nameVis || !nameRef.current || prefersReducedMotion()) return;
    const split = splitText(nameRef.current, { chars: { wrap: "clip" } });
    const anim = animate(split.chars, {
      y: ["110%", "0%"],
      rotateX: [-80, 0],
      opacity: [0, 1],
      delay: stagger(38),
      duration: 900,
      ease: "outExpo",
    });
    return () => { anim.revert(); split.revert(); };
  }, [nameVis]);

  // anime.js scrambleText: role "di-decode" dari karakter blok
  useEffect(() => {
    if (!restVis || !roleRef.current || prefersReducedMotion()) return;
    const anim = animate(roleRef.current, { innerHTML: scrambleText({ text: ROLE, chars: "blocks", cursor: "█", revealRate: 40 }), duration: 1400 });
    return () => anim.revert();
  }, [restVis]);

  // Motion parallax: kolom teks naik lebih cepat, potret ASCII lebih lambat
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const yText = useTransform(scrollYProgress, [0, 1], [0, -160]);
  const yArt = useTransform(scrollYProgress, [0, 1], [0, 110]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const blur = useTransform(scrollYProgress, [0, 1], ["blur(0px)", "blur(8px)"]);
  const shaderOpacity = useTransform(scrollYProgress, [0, 1], [0.6, 0.15]);

  return (
    <section id="hero" ref={heroRef} className="hero">
      <motion.div className="absolute inset-0" style={{ opacity: shaderOpacity }}>
        <ShaderField preset="phosphor" />
      </motion.div>
      <Spotlight className="-top-40 left-0 md:-top-20 md:left-60" fill="#00ff41" />
      <div className="grid-bg" />
      <div className="scan-beam" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(0,0,0,.2)_0%,#000_75%)]" />

      <motion.div className="hero-col" style={{ position: "relative", zIndex: 1, maxWidth: "540px", flexShrink: 0, y: yText, opacity: fade, filter: blur }}>
        <div className="hero-boot">
          {BOOT_LINES.map(({ cls, text }, i) => (
            <div key={i} className={`boot-line${i < shown ? " show" : ""}`}><span className={cls}>{text}</span></div>
          ))}
        </div>

        <div className="hero-name-wrap" style={{ perspective: 600 }}>
          <div ref={nameRef} className={`hero-name${nameVis ? " show" : ""}`} data-t={PROFILE.name} style={{ viewTransitionName: "page-title" }}>
            FIRMANSYAH HADINATA
          </div>
        </div>

        <div ref={roleRef} className={`hero-role${restVis ? " show" : ""}`}>{ROLE}</div>

        <div className={`hero-desc${restVis ? " show" : ""}`}>
          I build the infrastructure that never sleeps — <code>REST APIs</code>, <code>distributed systems</code>, and{" "}
          <code>data pipelines</code> that handle real-world load. TypeScript-first, container-native, obsessed with correctness.
        </div>

        <div className={`hero-btns${restVis ? " show" : ""}`}>
          <Magnetic><button type="button" className="btn btn-prim" onClick={() => scrollTo("#projects")} data-cursor="scroll"><span>VIEW PROJECTS ▸</span></button></Magnetic>
          <Magnetic><button type="button" className="btn btn-ghost" onClick={() => scrollTo("#contact")}>CONTACT</button></Magnetic>
          <Magnetic><button type="button" className="btn btn-ghost" onClick={() => togglePalette(true)} data-cursor="ctrl+k">⌘K EXPLORE</button></Magnetic>
        </div>

        <div className={`hero-socials${restVis ? " show" : ""}`}>
          <div style={{ width: 24, height: 1, background: "var(--border2)" }} />
          {CONTACT_LINKS.filter(l => l.key !== "EMAIL").map(l => (
            <a key={l.key} href={l.href} target="_blank" rel="noreferrer noopener" className="h-soc-link">{l.key}</a>
          ))}
        </div>
      </motion.div>

      <motion.div className="hero-ascii-wrap" style={{ y: yArt }}>
        <div className="relative flex flex-col overflow-hidden border border-line2 bg-[rgba(0,8,3,.82)] shadow-[0_0_0_1px_var(--border),0_0_60px_rgba(0,255,65,.12),inset_0_0_60px_rgba(0,0,0,.4)]">
          <div className="flex shrink-0 items-center justify-between border-b border-line bg-d1 px-3.5 py-[7px]">
            <div className="flex gap-[5px]">{["#ff5f56", "#ffbd2e", "#27c93f"].map(c => <div key={c} className="size-[11px] rounded-full" style={{ background: c }} />)}</div>
            <span className="asc-title text-[9px] uppercase tracking-[3px] text-tx2">asciinator — portrait.bmp</span>
            <div className="asc-state flex items-center gap-1.5 text-[8px] tracking-[2px] text-tx3">
              <div className="size-[5px] rounded-full bg-g" style={{ animation: "p-dot 2s infinite" }} />RENDERING
            </div>
          </div>
          <div className="asc-ruler flex shrink-0 justify-between border-b border-line px-3.5 py-[3px] text-[7px] tracking-[2px] text-tx3">
            <span>$ render --mode=ascii --palette=256 --dither=floyd-steinberg</span>
            <span className="text-g">100%</span>
          </div>
          <div className="asc-area flex flex-1 items-center justify-center overflow-hidden p-3 [mask-image:linear-gradient(to_bottom,transparent_0%,black_6%,black_94%,transparent_100%)]">
            <AsciiArt visible={restVis} />
          </div>
          <div className="asc-foot flex shrink-0 gap-5 border-t border-line bg-d0 px-3.5 py-1 text-[7px] tracking-[2px] text-tx3">
            {[["COLS", "140"], ["ROWS", "64"], ["CHARS", "4"], ["PALETTE", "256"]].map(([k, v]) => (
              <span key={k}>{k}: <span className="text-amber">{v}</span></span>
            ))}
          </div>
        </div>
      </motion.div>

      {restVis && (
        <div className="hero-metrics">
          {[["LATENCY", "<1ms"], ["UPTIME", "99.9%"], ["REQ/DAY", "50k+"]].map(([k, v]) => (
            <div key={k}>{k} <span>{v}</span></div>
          ))}
        </div>
      )}

      <div className="scroll-hint" aria-hidden="true">
        <span className="scroll-txt">SCROLL</span>
        <div className="scroll-line" />
      </div>
    </section>
  );
}
