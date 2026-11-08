import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { onLenis } from "./scroll";

/**
 * GSAP sengaja tidak ikut bundle awal: modul ini hanya di-import oleh halaman
 * yang memakainya. Saat dimuat, ScrollTrigger disinkronkan ke event scroll
 * Lenis supaya trigger/scrub tetap presisi dengan smooth scroll.
 */
gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin);

let unhook = null;
onLenis(lenis => {
  unhook?.();
  unhook = lenis ? lenis.on("scroll", ScrollTrigger.update) : null;
});

export { gsap, ScrollTrigger };
