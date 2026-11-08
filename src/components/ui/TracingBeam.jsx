import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { cn } from "../../lib/cn";

/**
 * Aceternity — TracingBeam: garis vertikal di sisi konten yang "terisi"
 * cahaya mengikuti progres scroll (Motion useScroll + useTransform + pegas).
 */
export default function TracingBeam({ children, className }) {
  const ref = useRef(null);
  const contentRef = useRef(null);
  const [h, setH] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setH(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const y1 = useSpring(useTransform(scrollYProgress, [0, 0.8], [50, h]), { stiffness: 500, damping: 90 });
  const y2 = useSpring(useTransform(scrollYProgress, [0, 1], [50, h - 200]), { stiffness: 500, damping: 90 });
  const dot = useTransform(scrollYProgress, [0, 0.02], ["#00ff41", "#000000"]);

  return (
    <motion.div ref={ref} className={cn("relative mx-auto w-full", className)}>
      <div className="absolute -left-2 top-3 hidden md:block" aria-hidden="true">
        <div className="ml-[27px] flex size-4 items-center justify-center rounded-full border border-line2 shadow-[0_0_12px_#00ff4166]">
          <motion.div style={{ backgroundColor: dot }} className="size-2 rounded-full border border-g" />
        </div>
        <svg viewBox={`0 0 20 ${h}`} width="20" height={h} className="ml-4 block">
          <path d={`M 1 0V -36 l 18 24 V ${h * 0.8} l -18 24V ${h}`} fill="none" stroke="#0c4a20" strokeOpacity="0.8" />
          <motion.path d={`M 1 0V -36 l 18 24 V ${h * 0.8} l -18 24V ${h}`} fill="none" stroke="url(#tracing-grad)" strokeWidth="1.5" />
          <defs>
            <motion.linearGradient id="tracing-grad" gradientUnits="userSpaceOnUse" x1="0" x2="0" y1={y1} y2={y2}>
              <stop stopColor="#00f0ff" stopOpacity="0" />
              <stop stopColor="#00f0ff" />
              <stop offset="0.325" stopColor="#00ff41" />
              <stop offset="1" stopColor="#c2ffd3" stopOpacity="0" />
            </motion.linearGradient>
          </defs>
        </svg>
      </div>
      <div ref={contentRef} className="md:pl-14">{children}</div>
    </motion.div>
  );
}
