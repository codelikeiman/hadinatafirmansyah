import { CONTACT_LINKS, PROFILE } from "../../data/profile";
import { useReveal } from "../../lib/useReveal";
import SectionHead from "./SectionHead";
import Terminal from "./Terminal";
import { Suspense, lazy } from "react";

// globe (cobe + WebGL) baru diunduh saat section contact mulai terlihat
const CobeGlobe = lazy(() => import("../../components/fx/CobeGlobe"));
import Ripple from "../../components/ui/Ripple";

const HOME = [PROFILE.location.lat, PROFILE.location.lng];
const POPS = [
  { id: "sin", location: [1.3521, 103.8198], label: "SIN" },
  { id: "nrt", location: [35.6762, 139.6503], label: "NRT" },
  { id: "fra", location: [50.1109, 8.6821], label: "FRA" },
  { id: "iad", location: [38.9445, -77.4558], label: "IAD" },
  { id: "syd", location: [-33.8688, 151.2093], label: "SYD" },
];
const MARKERS = [
  { id: "home", location: HOME, size: 0.09, label: `${PROFILE.location.city.toUpperCase()} · UTC+7` },
  ...POPS.map(p => ({ ...p, size: 0.035 })),
];
const ARCS = POPS.map(p => ({ id: `home-${p.id}`, from: HOME, to: p.location }));

export default function Contact() {
  const [ref, vis] = useReveal();
  return (
    <section id="contact" className="sec">
      <SectionHead label="// 06 — TRANSMISSION" title="LET'S" accent="CONNECT" />
      <div ref={ref} className={`reveal${vis ? " show" : ""} contact-grid`}>
        <div>
          <p className="mb-8 max-w-[440px] text-[15px] leading-[1.85] text-tx2">
            Open to interesting backend challenges, consulting, or building something from scratch together. Drop a message in the terminal or reach out directly.
          </p>
          <div className="contact-info">
            {CONTACT_LINKS.map(l => (
              <a key={l.key} className="cinfo-row no-underline" href={l.href} target={l.key === "EMAIL" ? undefined : "_blank"} rel="noreferrer noopener" data-cursor={l.key === "EMAIL" ? "mail" : "open"}>
                <div className="cinfo-key">{l.key}</div>
                <div className="cinfo-val">{l.label}</div>
              </a>
            ))}
          </div>
          <div className="mt-6 text-[9px] tracking-[2px] text-tx3">RESPONSE TIME: <span className="text-g">{"< 24h"}</span> · TZ: <span className="text-g">{PROFILE.location.tz}</span></div>
          <div className="relative mx-auto mt-8 w-full max-w-[420px]">
            <Ripple mainCircleSize={260} numCircles={4} className="[mask-image:none] opacity-60" />
            {vis ? <Suspense fallback={<div className="aspect-square w-full" />}><CobeGlobe markers={MARKERS} arcs={ARCS} focus={HOME} /></Suspense> : <div className="aspect-square w-full" />}
            <div className="mt-1 text-center text-[9px] tracking-[3px] text-tx3">cobe · drag to rotate · {POPS.length} edge PoPs</div>
          </div>
        </div>
        <Terminal />
      </div>
    </section>
  );
}
