import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "../../lib/media";

/**
 * Judul section: label kecil + judul besar. Saat masuk viewport, GSAP
 * ScrambleTextPlugin (dipicu ScrollTrigger yang sinkron dengan Lenis)
 * men-decode teks judul.
 */
export default function SectionHead({ label, title, accent }) {
  const ref = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion() || !textRef.current) return;
    let ctx = null, cancelled = false;
    // GSAP dimuat dinamis (paralel, setelah render pertama) — tidak ikut chunk awal
    import("../../lib/gsap").then(({ gsap, ScrollTrigger }) => {
      if (cancelled || !ref.current) return;
      ctx = gsap.context(() => {
        const el = textRef.current;
        const final = el.textContent;
        ScrollTrigger.create({
          trigger: ref.current,
          start: "top 85%",
          once: true,
          onEnter: () => {
            el.textContent = "";
            gsap.to(el, { duration: 1.1, ease: "none", scrambleText: { text: final, chars: "01<>/{}#$%█▓▒░", revealDelay: 0.25, speed: 0.6 } });
          },
        });
        gsap.from(ref.current.querySelector(".sec-label"), {
          x: -30, opacity: 0, duration: 0.8, ease: "expo.out",
          scrollTrigger: { trigger: ref.current, start: "top 85%", once: true },
        });
      }, ref);
    });
    return () => { cancelled = true; ctx?.revert(); };
  }, []);

  return (
    <div ref={ref}>
      <div className="sec-label">{label}</div>
      <h2 className="sec-title">
        <span ref={textRef} className="!text-bright">{title}</span> <span>{accent}</span>
      </h2>
    </div>
  );
}
