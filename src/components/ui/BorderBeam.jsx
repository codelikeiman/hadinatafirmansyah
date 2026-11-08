import { cn } from "../../lib/cn";

/**
 * Magic UI — BorderBeam: berkas cahaya yang berjalan mengelilingi border
 * (CSS offset-path rect() + mask-composite, tanpa JS per frame).
 * Parent harus `position: relative`.
 */
export default function BorderBeam({
  className, size = 120, duration = 8, delay = 0, borderWidth = 1.5,
  colorFrom = "#00ff41", colorTo = "#00f0ff", reverse = false,
}) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 rounded-[inherit] border-transparent [mask-clip:padding-box,border-box] [mask-composite:intersect] [mask-image:linear-gradient(transparent,transparent),linear-gradient(#000,#000)]"
      style={{ borderWidth, borderStyle: "solid" }}
    >
      <div
        className={cn("absolute aspect-square animate-border-beam bg-gradient-to-l from-[var(--beam-from)] via-[var(--beam-to)] to-transparent", className)}
        style={{
          width: size,
          offsetPath: `rect(0 auto auto 0 round ${size}px)`,
          "--beam-from": colorFrom,
          "--beam-to": colorTo,
          "--duration": duration,
          animationDelay: `-${delay}s`,
          animationDirection: reverse ? "reverse" : "normal",
        }}
      />
    </div>
  );
}
