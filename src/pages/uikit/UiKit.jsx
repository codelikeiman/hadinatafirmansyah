import { useRef } from "react";
import { motion } from "motion/react";
import PageTitle from "../../components/fx/PageTitle";
import Marquee from "../../components/ui/Marquee";
import BorderBeam from "../../components/ui/BorderBeam";
import NumberTicker from "../../components/ui/NumberTicker";
import AnimatedBeam from "../../components/ui/AnimatedBeam";
import Meteors from "../../components/ui/Meteors";
import RetroGrid from "../../components/ui/RetroGrid";
import MagicCard from "../../components/ui/MagicCard";
import { Dock, DockIcon } from "../../components/ui/Dock";
import OrbitingCircles from "../../components/ui/OrbitingCircles";
import Ripple from "../../components/ui/Ripple";
import Spotlight from "../../components/ui/Spotlight";
import BackgroundBeams from "../../components/ui/BackgroundBeams";
import { CardBody, CardContainer, CardItem } from "../../components/ui/Card3D";
import EvervaultCard from "../../components/ui/EvervaultCard";
import TextGenerateEffect from "../../components/ui/TextGenerateEffect";
import Vortex from "../../components/ui/Vortex";
import Sparkles from "../../components/ui/Sparkles";
import TextHoverEffect from "../../components/ui/TextHoverEffect";
import ShineBorder from "../../components/ui/ShineBorder";
import FlickeringGrid from "../../components/ui/FlickeringGrid";
import AnimatedList from "../../components/ui/AnimatedList";
import { ROUTES } from "../../app/routes";
import { useRouter } from "../../app/router-context";
import { SKILLS, TOOLCHAIN } from "../../data/profile";
import { cn } from "../../lib/cn";

function Demo({ name, by, className, children, bodyClass }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 26 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.5 }}
      className={cn("relative flex min-w-0 flex-col overflow-hidden border border-line bg-d0", className)}
    >
      <div className="flex items-center justify-between border-b border-line px-3 py-2 text-[10px] tracking-[.2em]">
        <span className="text-bright">&lt;{name} /&gt;</span>
        <span className={cn("border px-1.5 py-0.5 text-[9px]", by === "Aceternity" ? "border-violet/60 text-violet" : "border-b/60 text-b")}>{by}</span>
      </div>
      <div className={cn("relative flex-1", bodyClass)}>{children}</div>
    </motion.div>
  );
}

function BeamDemo() {
  const box = useRef(null);
  const client = useRef(null), api = useRef(null), db = useRef(null), cache = useRef(null);
  return (
    <div ref={box} className="relative flex h-56 items-center justify-between px-6">
      <div ref={client} className="z-10 border border-g bg-black px-2 py-1 text-[11px] text-g">client</div>
      <div ref={api} className="z-10 border border-b bg-black px-3 py-2 text-[12px] text-b shadow-[0_0_20px_#00f0ff55]">api</div>
      <div className="z-10 flex flex-col gap-10">
        <div ref={db} className="border border-amber bg-black px-2 py-1 text-[11px] text-amber">db</div>
        <div ref={cache} className="border border-red bg-black px-2 py-1 text-[11px] text-red">cache</div>
      </div>
      <AnimatedBeam containerRef={box} fromRef={client} toRef={api} duration={3} />
      <AnimatedBeam containerRef={box} fromRef={api} toRef={db} duration={3} delay={0.6} curvature={30} />
      <AnimatedBeam containerRef={box} fromRef={api} toRef={cache} duration={3} delay={1.2} curvature={-30} reverse />
    </div>
  );
}

export default function UiKit() {
  const { navigate, path } = useRouter();
  const short = SKILLS.map(s => s.id.replace(".service", ""));

  return (
    <div className="pb-28">
      <header className="relative overflow-hidden border-b border-line">
        <BackgroundBeams />
        <Spotlight className="-top-32 left-0 md:left-40" fill="#00f0ff" />
        <div className="pg relative !min-h-0 !pb-10">
          <PageTitle text="ls /usr/share/ui" sub="Kit komponen bergaya Magic UI × Aceternity UI — ditulis ulang dengan Tailwind v4 + Motion, disesuaikan ke palet fosfor. Semua di bawah ini live, bukan gambar." />
          <div className="flex flex-wrap gap-6 text-[11px] text-tx2">
            <span><b className="text-2xl text-g"><NumberTicker value={24} /></b> komponen</span>
            <span><b className="text-2xl text-b"><NumberTicker value={0} /></b> gambar statis</span>
            <span><b className="text-2xl text-amber"><NumberTicker value={60} suffix="fps" /></b> target</span>
          </div>
        </div>
      </header>

      <div className="pg !min-h-0 !max-w-[1280px] !pt-10">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Demo name="Marquee" by="Magic UI" bodyClass="py-4">
            <Marquee pauseOnHover className="[--duration:22s]">{short.map(s => <span key={s} className="border border-line2 px-3 py-1 text-[11px] text-g">{s}</span>)}</Marquee>
            <Marquee reverse pauseOnHover className="[--duration:26s]">{TOOLCHAIN.map(s => <span key={s} className="border border-b/40 px-3 py-1 text-[11px] text-b">{s}</span>)}</Marquee>
          </Demo>

          <Demo name="BorderBeam" by="Magic UI" bodyClass="grid place-items-center p-6">
            <div className="relative w-full max-w-[260px] border border-line2 bg-black p-5 text-center">
              <BorderBeam size={90} duration={5} />
              <BorderBeam size={90} duration={5} delay={2.5} colorFrom="#ffd400" colorTo="#ff003c" />
              <div className="text-[10px] tracking-[.3em] text-tx2">STATUS</div>
              <div className="mt-1 text-xl font-bold text-g glow-text">ALL GREEN</div>
            </div>
          </Demo>

          <Demo name="NumberTicker" by="Magic UI" bodyClass="grid grid-cols-3 place-items-center gap-2 p-6 text-center">
            {[[50000, "req/day", "text-g"], [99.98, "% uptime", "text-b", 2], [847, "commits", "text-amber"]].map(([v, l, c, d]) => (
              <div key={l}><div className={cn("text-2xl font-bold", c)}><NumberTicker value={v} decimalPlaces={d ?? 0} /></div><div className="text-[10px] text-tx2">{l}</div></div>
            ))}
          </Demo>

          <Demo name="AnimatedBeam" by="Magic UI" className="md:col-span-2"><BeamDemo /></Demo>

          <Demo name="Meteors" by="Aceternity" bodyClass="h-56 overflow-hidden">
            <Meteors number={18} />
            <div className="relative grid h-full place-items-center text-center"><div><div className="text-lg font-bold text-bright">incoming traffic</div><div className="text-[11px] text-tx2">meteors · pure CSS</div></div></div>
          </Demo>

          <Demo name="RetroGrid" by="Magic UI" bodyClass="h-56 overflow-hidden">
            <RetroGrid />
            <div className="relative grid h-full place-items-center"><span className="bg-gradient-to-b from-bright to-g bg-clip-text text-4xl font-extrabold text-transparent">SYNTHWAVE</span></div>
          </Demo>

          <Demo name="OrbitingCircles" by="Magic UI" bodyClass="relative flex h-72 items-center justify-center overflow-hidden">
            <div className="z-10 border border-g bg-black px-2 py-1 text-[11px] text-g">kernel</div>
            <OrbitingCircles radius={70} duration={14} iconSize={52}>{short.slice(0, 4).map(s => <span key={s} className="border border-line2 bg-black px-1 text-[9px] text-bright">{s}</span>)}</OrbitingCircles>
            <OrbitingCircles radius={120} duration={22} reverse iconSize={60}>{short.slice(4, 9).map(s => <span key={s} className="border border-b/50 bg-black px-1 text-[9px] text-b">{s}</span>)}</OrbitingCircles>
          </Demo>

          <Demo name="Ripple" by="Magic UI" bodyClass="relative grid h-72 place-items-center overflow-hidden">
            <Ripple mainCircleSize={120} />
            <span className="z-10 text-sm tracking-[.3em] text-bright">PING</span>
          </Demo>

          <Demo name="MagicCard" by="Magic UI" bodyClass="p-4">
            <MagicCard className="h-56 p-5">
              <div className="text-[10px] tracking-[.3em] text-tx2">HOVER ME</div>
              <div className="mt-2 text-lg font-bold text-bright">Spotlight follows cursor</div>
              <p className="mt-2 text-[12px] leading-6 text-tx2">Gradien radial pada border & isi kartu digerakkan Motion values — nol re-render.</p>
            </MagicCard>
          </Demo>

          <Demo name="3DCard" by="Aceternity" bodyClass="grid place-items-center py-4">
            <CardContainer>
              <CardBody className="h-56 w-[260px] border border-line2 bg-black p-5">
                <CardItem translateZ={40} className="text-[10px] tracking-[.3em] text-tx2">DEPTH LAYERS</CardItem>
                <CardItem translateZ={80} className="mt-3 text-xl font-bold text-bright">translateZ(80px)</CardItem>
                <CardItem translateZ={120} className="mt-6 border border-g px-3 py-2 text-[11px] text-g shadow-[0_0_20px_#00ff4155]">floating chip</CardItem>
              </CardBody>
            </CardContainer>
          </Demo>

          <Demo name="EvervaultCard" by="Aceternity" bodyClass="p-4"><EvervaultCard text="0x7F" className="max-h-64" /></Demo>

          <Demo name="TextGenerateEffect" by="Aceternity" bodyClass="p-6">
            <TextGenerateEffect className="text-[15px] leading-7 text-bright" words="Every request is a story: parsed, authenticated, cached, persisted, and answered in under a millisecond of overhead." />
          </Demo>

          <Demo name="Vortex" by="Aceternity" className="md:col-span-2" bodyClass="h-72">
            <Vortex particleCount={420} baseHue={130} rangeY={90} className="grid h-72 place-items-center px-4 text-center">
              <div><div className="text-2xl font-extrabold text-white">event loop</div><div className="text-[11px] text-bright">simplex-noise flow field · canvas</div></div>
            </Vortex>
          </Demo>

          <Demo name="Sparkles" by="Aceternity" bodyClass="relative h-72 overflow-hidden">
            <div className="absolute inset-0"><Sparkles particleDensity={700} /></div>
            <div className="relative grid h-full place-items-center"><span className="text-3xl font-extrabold text-bright glow-text">tsParticles</span></div>
          </Demo>

          <Demo name="FlickeringGrid" by="Magic UI" bodyClass="relative h-56 overflow-hidden">
            <FlickeringGrid squareSize={4} gridGap={5} maxOpacity={0.45} />
            <div className="relative grid h-full place-items-center text-sm tracking-[.3em] text-bright">NOISE FLOOR</div>
          </Demo>

          <Demo name="AnimatedList" by="Magic UI" bodyClass="h-72 overflow-hidden p-3">
            <AnimatedList delay={1100} max={5}>
              {["✓ build passed", "✓ 128 tests green", "↑ pushed image :v2.4.1", "⇪ deployed to prod", "● health check ok"].map(t => <div key={t} className="w-full border border-line2 bg-black px-3 py-2 text-[11px] text-g">{t}</div>)}
            </AnimatedList>
          </Demo>

          <Demo name="ShineBorder" by="Magic UI" bodyClass="grid place-items-center p-8">
            <button type="button" onClick={() => navigate("/")} className="relative border border-transparent bg-black px-6 py-3 text-[12px] tracking-[.3em] text-bright">
              <ShineBorder borderWidth={1.5} duration={8} />
              ⌂ BACK HOME
            </button>
          </Demo>

          <Demo name="TextHoverEffect" by="Aceternity" className="md:col-span-2 xl:col-span-3" bodyClass="h-56 px-6">
            <TextHoverEffect text="UI KIT" />
          </Demo>
        </div>
        <p className="mt-6 text-[11px] text-tx3">Juga dipakai di halaman lain: TracingBeam (/man), Timeline (/git-log), Lamp & ShineBorder (/holo), Spotlight & Magnetic (home), ScrollProgress & Marquee (home).</p>
      </div>

      <div className="fixed inset-x-0 bottom-12 z-[900] flex justify-center px-3 max-sm:hidden">
        <Dock>
          {ROUTES.map(r => (
            <DockIcon key={r.path} label={r.name} onClick={() => navigate(r.path)} data-cursor={r.desc}
              className={cn("cursor-pointer text-lg", r.path === path && "border-g bg-g/15 shadow-[0_0_16px_#00ff41]")}>
              {r.glyph}
            </DockIcon>
          ))}
        </Dock>
      </div>
    </div>
  );
}
