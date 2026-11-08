import { cn } from "../../lib/cn";

/** Magic UI — Ripple: lingkaran konsentris yang berdenyut (radar). */
export default function Ripple({ mainCircleSize = 180, mainCircleOpacity = 0.22, numCircles = 7, className }) {
  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute inset-0 select-none [mask-image:linear-gradient(to_bottom,white,transparent)]", className)}>
      {Array.from({ length: numCircles }, (_, i) => {
        const size = mainCircleSize + i * 70;
        return (
          <div
            key={i}
            className="absolute left-1/2 top-1/2 animate-ripple rounded-full border border-g/40 bg-g/[0.04] shadow-[0_0_30px_#00ff4122]"
            style={{ width: size, height: size, opacity: mainCircleOpacity - i * 0.025, "--i": i, borderStyle: i === numCircles - 1 ? "dashed" : "solid" }}
          />
        );
      })}
    </div>
  );
}
