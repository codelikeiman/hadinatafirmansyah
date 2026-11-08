import { useEffect } from "react";
import Lenis from "lenis";
import { setLenis } from "../../lib/scroll";

/**
 * Lenis smooth scroll global dengan rAF-nya sendiri (GSAP tidak dimuat di
 * critical path). ScrollTrigger, bila halaman memakainya, menyinkronkan diri
 * lewat lib/gsap.js; Motion `useScroll` membaca scroll native yang digerakkan
 * Lenis. prefers-reduced-motion → smoothing otomatis mati (respectReducedMotion).
 */
export default function SmoothScroll({ children }) {
  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.085,
      wheelMultiplier: 1,
      touchMultiplier: 1.4,
      allowNestedScroll: true,
      stopInertiaOnNavigate: true,
    });
    setLenis(lenis);
    return () => {
      lenis.destroy();
      setLenis(null);
    };
  }, []);
  return children;
}
