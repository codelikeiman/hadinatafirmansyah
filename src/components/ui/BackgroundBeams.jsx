import { memo, useId, useMemo } from "react";
import { motion } from "motion/react";
import { seeded } from "../../lib/random";
import { cn } from "../../lib/cn";

/**
 * Aceternity — BackgroundBeams: puluhan kurva yang dialiri cahaya.
 * Jalur dibangkitkan prosedural (deterministik) alih-alih daftar path statis.
 */
function BackgroundBeams({ className, count = 34, seed = 11 }) {
  const uid = useId().replace(/:/g, "");
  const beams = useMemo(() => {
    const rnd = seeded(seed);
    return Array.from({ length: count }, (_, i) => {
      const o = i * 14 - 380;
      const d = `M${-380 + o} ${-189 - o * 0.4}C${-380 + o} ${-189 - o * 0.4} ${-312 + o} ${216 - o * 0.4} ${152 + o} ${343 - o * 0.4}C${616 + o} ${470 - o * 0.4} ${684 + o} ${875 - o * 0.4} ${684 + o} ${875 - o * 0.4}`;
      return { d, duration: rnd() * 10 + 10, delay: rnd() * 10, y2: 93 + rnd() * 8 };
    });
  }, [count, seed]);

  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute inset-0 flex items-center justify-center [mask-image:radial-gradient(ellipse_at_center,white,transparent_75%)]", className)}>
      <svg className="absolute size-full" width="100%" height="100%" viewBox="0 0 696 316" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
        <path d={beams.map(b => b.d).join(" ")} stroke={`url(#bb-static-${uid})`} strokeOpacity="0.06" strokeWidth="0.5" />
        {beams.map((b, i) => (
          <path key={i} d={b.d} stroke={`url(#bb-${uid}-${i})`} strokeOpacity="0.5" strokeWidth="0.6" />
        ))}
        <defs>
          {beams.map((b, i) => (
            <motion.linearGradient
              key={i} id={`bb-${uid}-${i}`}
              initial={{ x1: "0%", x2: "0%", y1: "0%", y2: "0%" }}
              animate={{ x1: ["0%", "100%"], x2: ["0%", "95%"], y1: ["0%", "100%"], y2: ["0%", `${b.y2}%`] }}
              transition={{ duration: b.duration, ease: "easeInOut", repeat: Infinity, delay: b.delay }}
            >
              <stop stopColor="#00ff41" stopOpacity="0" />
              <stop stopColor="#00ff41" />
              <stop offset="32.5%" stopColor="#00f0ff" />
              <stop offset="100%" stopColor="#c2ffd3" stopOpacity="0" />
            </motion.linearGradient>
          ))}
          <radialGradient id={`bb-static-${uid}`} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(352 34) rotate(90) scale(555 1560.62)">
            <stop offset="0.0666667" stopColor="#14802f" />
            <stop offset="0.243243" stopColor="#14802f" />
            <stop offset="0.43594" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
}

export default memo(BackgroundBeams);
