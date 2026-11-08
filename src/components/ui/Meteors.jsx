import { useMemo } from "react";
import { seeded } from "../../lib/random";
import { cn } from "../../lib/cn";

/** Magic UI / Aceternity — Meteors: hujan meteor diagonal (posisi deterministik, murni CSS). */
export default function Meteors({ number = 20, seed = 7, minDelay = 0.2, maxDelay = 2, minDuration = 3, maxDuration = 9, angle = 215, className }) {
  const meteors = useMemo(() => {
    const rnd = seeded(seed);
    return Array.from({ length: number }, () => ({
      left: `${Math.floor(rnd() * 110) - 5}%`,
      delay: `${rnd() * (maxDelay - minDelay) + minDelay}s`,
      duration: `${Math.floor(rnd() * (maxDuration - minDuration) + minDuration)}s`,
    }));
  }, [number, seed, minDelay, maxDelay, minDuration, maxDuration]);

  return meteors.map((m, i) => (
    <span
      key={i}
      aria-hidden="true"
      className={cn("pointer-events-none absolute top-[-5%] size-0.5 animate-meteor bg-g shadow-[0_0_0_1px_#00ff4122,0_0_8px_#00ff41]", className)}
      style={{ left: m.left, animationDelay: m.delay, "--meteor-duration": m.duration, "--angle": `${angle}deg` }}
    >
      <span className="pointer-events-none absolute top-1/2 -z-10 h-px w-[60px] -translate-y-1/2 bg-gradient-to-r from-g to-transparent" />
    </span>
  ));
}
