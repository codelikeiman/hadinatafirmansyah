import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import PageTitle from "../../components/fx/PageTitle";
import ShaderField from "../../components/fx/ShaderField";
import { CardBody, CardContainer, CardItem } from "../../components/ui/Card3D";
import ShineBorder from "../../components/ui/ShineBorder";
import Sparkles from "../../components/ui/Sparkles";
import Lamp from "../../components/ui/Lamp";
import { CONTACT_LINKS, PROFILE } from "../../data/profile";
import { useInViewport } from "../../lib/useInViewport";
import { cn } from "../../lib/cn";
import LocalBoundary from "../../components/fx/LocalBoundary";

// Runtime Spline (~2MB + modul WASM opsional) & SDK Unicorn Studio (~900KB) hanya diunduh saat panelnya terlihat.
const Spline = lazy(() => import("@splinetool/react-spline"));
const UnicornScene = lazy(() => import("unicornstudio-react"));

// Scene contoh resmi dari README @splinetool/react-spline; ganti via VITE_SPLINE_SCENE.
const SPLINE_SCENE = import.meta.env.VITE_SPLINE_SCENE || "https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode";
const UNICORN_ID = import.meta.env.VITE_UNICORN_PROJECT_ID || "";
const SPLINE_TIMEOUT = 15000;

function Frame({ title, tag, status, children, className }) {
  return (
    <div className={cn("relative overflow-hidden border border-line2 bg-black", className)}>
      {/* bracket sudut proyektor */}
      {["left-2 top-2 border-l-2 border-t-2", "right-2 top-2 border-r-2 border-t-2", "bottom-2 left-2 border-b-2 border-l-2", "bottom-2 right-2 border-b-2 border-r-2"].map(c => (
        <span key={c} className={cn("pointer-events-none absolute z-20 size-5 border-b", c)} />
      ))}
      <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between bg-gradient-to-b from-black/90 to-transparent px-5 pt-4 pb-6 text-[10px] tracking-[.3em]">
        <span className="text-bright">{title}</span>
        <span className="flex items-center gap-2 text-tx2"><i className={cn("size-1.5 rounded-full", status === "live" ? "bg-g shadow-[0_0_8px_#00ff41]" : status === "fallback" ? "bg-amber" : "animate-pulse bg-b")} />{tag}</span>
      </div>
      {children}
      <div className="pointer-events-none absolute inset-0 z-10 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,.18)_0_1px,transparent_1px_3px)] mix-blend-multiply" />
      <div className="pointer-events-none absolute inset-0 z-10 animate-flicker bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(0,0,0,.7))]" />
    </div>
  );
}

function SplinePanel() {
  const ref = useRef(null);
  const visible = useInViewport(ref, { once: true, rootMargin: "200px" });
  // idle → probing (HEAD) → loading (Spline dipasang) → live | fallback
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    if (!visible) return;
    let alive = true;
    // preflight: jangan pasang runtime Spline bila scene tak terjangkau (offline / adblock / proxy)
    fetch(SPLINE_SCENE, { method: "HEAD", mode: "cors" })
      .then(r => alive && setStatus(r.ok ? "loading" : "fallback"))
      .catch(() => alive && setStatus("fallback"));
    // Spline tidak punya onError: anggap gagal bila scene tak selesai dimuat dalam batas waktu
    const t = setTimeout(() => alive && setStatus(s => (s === "live" ? s : "fallback")), SPLINE_TIMEOUT);
    return () => { alive = false; clearTimeout(t); };
  }, [visible]);

  const label = { live: "SPLINE RUNTIME · LIVE", fallback: "OFFLINE · FALLBACK" }[status] ?? "PROJECTOR WARMING UP";
  return (
    <div ref={ref}>
      <Frame title="spline://scene.splinecode" tag={label} status={status} className="h-[62vh] min-h-[420px]">
        {status === "fallback" && (
          <div className="absolute inset-0">
            <ShaderField preset="aurora" />
            <div className="absolute inset-0 grid place-items-center p-6 text-center text-[12px] text-tx2">
              <div className="max-w-sm border border-amber/60 bg-black/70 p-4">
                <div className="mb-1 text-amber">⚠ scene Spline tidak terjangkau</div>
                Runtime siap; set <code className="text-c">VITE_SPLINE_SCENE</code> ke URL scene (.splinecode) milikmu.
              </div>
            </div>
          </div>
        )}
        {(status === "loading" || status === "live") && (
          <LocalBoundary onError={() => setStatus("fallback")}>
            <Suspense fallback={null}>
              <motion.div className="absolute inset-0" initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: status === "live" ? 1 : 0, scale: status === "live" ? 1 : 1.04 }} transition={{ duration: 1.2 }}>
                <Spline scene={SPLINE_SCENE} onLoad={() => setStatus("live")} className="size-full" />
              </motion.div>
            </Suspense>
          </LocalBoundary>
        )}
        {(status === "idle" || status === "loading") && (
          <div className="absolute inset-0 grid place-items-center text-[11px] tracking-[.3em] text-tx2"><div className="text-center"><div className="mx-auto mb-3 size-12 animate-spin border border-b [animation-duration:2.2s]" />LOADING SPLINE RUNTIME…</div></div>
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-1/3 bg-[radial-gradient(ellipse_at_bottom,rgba(0,240,255,.25),transparent_70%)]" />
      </Frame>
    </div>
  );
}

function UnicornPanel() {
  const ref = useRef(null);
  const visible = useInViewport(ref, { once: true, rootMargin: "200px" });
  const [failed, setFailed] = useState(false);
  const live = Boolean(UNICORN_ID) && !failed;
  return (
    <div ref={ref}>
      <Frame title="unicorn.studio://scene" tag={live ? "UNICORN STUDIO SDK" : "DITHER SHADER (OGL)"} status={live ? "live" : "fallback"} className="h-[46vh] min-h-[320px]">
        {live && visible ? (
          <LocalBoundary onError={() => setFailed(true)}>
            <Suspense fallback={null}>
              <UnicornScene projectId={UNICORN_ID} lazyLoad production scale={0.75} dpi={1.5} fps={60} width="100%" height="100%" onError={() => setFailed(true)} altText="Unicorn Studio scene" />
            </Suspense>
          </LocalBoundary>
        ) : (
          <>
            <ShaderField preset="dither" />
            <div className="absolute bottom-4 left-5 z-20 max-w-xs text-[11px] leading-5 text-tx2">
              Fallback: shader dithering Bayer 8×8 buatan sendiri (OGL). Set <code className="text-c">VITE_UNICORN_PROJECT_ID</code> untuk memuat scene Unicorn Studio asli.
            </div>
          </>
        )}
      </Frame>
    </div>
  );
}

function HoloCard() {
  return (
    <CardContainer intensity={18} containerClassName="py-6">
      <CardBody className="relative h-[340px] w-[min(520px,90vw)] border border-g/60 bg-[linear-gradient(135deg,rgba(0,255,65,.12),rgba(0,240,255,.06)_45%,rgba(178,107,255,.1))] p-7 shadow-[0_0_80px_#00ff4133] backdrop-blur-sm">
        <ShineBorder borderWidth={1.5} duration={10} />
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <Sparkles particleDensity={260} minSize={0.4} maxSize={1.2} particleColor="#c2ffd3" />
        </div>
        <CardItem translateZ={30} className="text-[10px] tracking-[.4em] text-tx2">HOLO-ID // {PROFILE.os.toUpperCase()}</CardItem>
        <CardItem translateZ={70} className="mt-4 text-3xl font-extrabold leading-tight text-bright glow-text sm:text-4xl">{PROFILE.name}</CardItem>
        <CardItem translateZ={50} className="mt-2 text-[12px] tracking-[.25em] text-g">{PROFILE.role.toUpperCase()}</CardItem>
        <CardItem translateZ={40} className="mt-6 grid grid-cols-2 gap-x-6 gap-y-1 text-[11px]">
          {CONTACT_LINKS.map(l => <a key={l.key} href={l.href} target={l.key === "EMAIL" ? undefined : "_blank"} rel="noreferrer noopener" className="truncate text-tx no-underline hover:text-g"><span className="text-tx2">{l.key.toLowerCase()}:</span> {l.label}</a>)}
        </CardItem>
        <CardItem translateZ={90} translateX={10} className="absolute bottom-6 right-7 grid size-16 place-items-center border border-b text-2xl text-b shadow-[0_0_30px_#00f0ff66]">◈</CardItem>
        <CardItem translateZ={20} className="absolute bottom-6 left-7 text-[10px] tracking-widest text-tx3">{PROFILE.location.city.toUpperCase()} · {PROFILE.location.lat.toFixed(2)}N {PROFILE.location.lng.toFixed(2)}E</CardItem>
      </CardBody>
    </CardContainer>
  );
}

export default function Holo() {
  return (
    <div className="pg !max-w-[1280px]">
      <PageTitle text="holo --project" sub="Ruang proyeksi 3D: scene Spline interaktif, scene shader ala Unicorn Studio, dan kartu identitas holografik (Aceternity 3D card + tsParticles)." />
      <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
        <SplinePanel />
        <div className="flex flex-col gap-5">
          <UnicornPanel />
          <div className="border border-line bg-d0 p-4 text-[11px] leading-6 text-tx2">
            <div className="mb-1 tracking-[.3em] text-bright">ENV</div>
            <div><span className="text-c">VITE_SPLINE_SCENE</span> = {import.meta.env.VITE_SPLINE_SCENE ? "custom" : "demo resmi Spline"}</div>
            <div><span className="text-c">VITE_UNICORN_PROJECT_ID</span> = {UNICORN_ID ? UNICORN_ID : "(kosong → fallback shader)"}</div>
          </div>
        </div>
      </div>
      <Lamp className="mt-10 min-h-[640px] !bg-transparent" color="#00ff41">
        <HoloCard />
      </Lamp>
    </div>
  );
}
