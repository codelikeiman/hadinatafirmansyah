import { Suspense, lazy, useEffect, useState } from "react";
import { useIdle } from "../../lib/useIdle";

// tsParticles (engine + preset slim) diunduh saat idle, tidak menghalangi render pertama
const NetworkParticles = lazy(() => import("./NetworkParticles"));
import "./home.css";
import IntroSplash from "./IntroSplash";
import { NavDots, SidePanel, StatusBar } from "./HomeChrome";
import { SECTION_IDS } from "./sections";
import Hero from "./Hero";
import About from "./About";
import Skills from "./Skills";
import Architecture from "./Architecture";
import Projects from "./Projects";
import TechGraph from "./TechGraph";
import Contact from "./Contact";
import Footer from "./Footer";
import Marquee from "../../components/ui/Marquee";
import ScrollProgress from "../../components/ui/ScrollProgress";
import { TICKER } from "../../data/profile";
import { useActiveSection } from "../../lib/useReveal";
import { lockScroll } from "../../lib/scroll";

const readIntroDone = () => {
  try {
    return sessionStorage.getItem("introDone") === "1";
  } catch {
    return true;
  }
};

export default function Home() {
  const [introDone, setIntroDone] = useState(readIntroDone);
  const active = useActiveSection(SECTION_IDS);
  const idle = useIdle(1200); // partikel latar dipasang setelah konten utama ter-render

  useEffect(() => {
    if (introDone) return;
    lockScroll(true);
    return () => lockScroll(false);
  }, [introDone]);

  const finishIntro = () => {
    try { sessionStorage.setItem("introDone", "1"); } catch { /* mode privat */ }
    setIntroDone(true);
  };

  return (
    <>
      {idle && <Suspense fallback={null}><NetworkParticles /></Suspense>}
      {!introDone && <IntroSplash onComplete={finishIntro} />}
      {introDone && (
        <>
          <StatusBar />
          <ScrollProgress className="top-8" />
          <SidePanel />
          <NavDots active={active} />
          <div className="main crt-on">
            <div className="ticker-wrap">
              <Marquee pauseOnHover className="py-2 [--duration:36s] [--gap:1.5rem]">
                {TICKER.map(t => (
                  <span key={t} className="text-[8px] tracking-[3px] text-tx2"><span className="mr-6 text-g">◆</span>{t}</span>
                ))}
              </Marquee>
            </div>
            <Hero />
            <About />
            <Skills />
            <Architecture />
            <Projects />
            <TechGraph />
            <Contact />
            <Footer />
          </div>
        </>
      )}
    </>
  );
}
