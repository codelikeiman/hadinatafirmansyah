import { Suspense, lazy, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import PageTitle from "../../components/fx/PageTitle";
import PageLoader from "../../app/PageLoader";
import { cn } from "../../lib/cn";

// Dua engine fisika di chunk terpisah: matter.js (~80KB) & rapier WASM (~4MB) — diunduh saat tab dibuka.
const MatterPit = lazy(() => import("./MatterPit.jsx"));
const RapierYard = lazy(() => import("./RapierYard.jsx"));

const TABS = [
  { id: "matter", label: "matter.js · 2D", hint: "Drag & lempar chip tech stack. Ubah gravitasi, guncang, atau ledakkan." },
  { id: "rapier", label: "rapier · 3D", hint: "Klik untuk menembakkan bola plasma ke menara kontainer. Drag untuk orbit kamera." },
];

export default function Sandbox() {
  const [tab, setTab] = useState("matter");
  const current = TABS.find(t => t.id === tab);

  return (
    <div className="pg !max-w-[1280px]">
      <PageTitle text="docker run --physics" sub="Dua physics engine, satu tech stack. Semua body disimulasikan 60Hz dengan fixed timestep dan berhenti otomatis saat di luar layar." />
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex border border-line2 p-1">
          {TABS.map(t => (
            <button key={t.id} type="button" onClick={() => setTab(t.id)} className={cn("relative px-4 py-2 text-[12px] tracking-wider", tab === t.id ? "text-black" : "text-tx2 hover:text-g")}>
              {tab === t.id && <motion.span layoutId="sandbox-tab" className="absolute inset-0 bg-g shadow-[0_0_20px_#00ff41]" transition={{ type: "spring", stiffness: 480, damping: 36 }} />}
              <span className="relative">{t.label}</span>
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.p key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="text-[12px] text-tx2">{current.hint}</motion.p>
        </AnimatePresence>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, scale: 0.98, filter: "blur(6px)" }} animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }} exit={{ opacity: 0, scale: 1.02, filter: "blur(6px)" }} transition={{ duration: 0.35 }}>
          <Suspense fallback={<PageLoader label={`loading ${current.label}`} />}>
            {tab === "matter" ? <MatterPit /> : <RapierYard />}
          </Suspense>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
