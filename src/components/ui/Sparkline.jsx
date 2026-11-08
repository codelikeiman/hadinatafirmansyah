import { useId } from "react";
import { cn } from "../../lib/cn";

/** Sparkline SVG super ringan (pengganti chart library untuk grafik mini). */
export default function Sparkline({ data, max = Math.max(...data, 1), color = "#00f0ff", className, fill = true }) {
  const id = useId().replace(/:/g, "");
  const n = Math.max(data.length - 1, 1);
  const pts = data.map((v, i) => `${(i / n) * 100},${30 - (v / max) * 27}`).join(" ");
  return (
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" className={cn("block h-full w-full", className)} aria-hidden="true">
      {fill && (
        <>
          <defs>
            <linearGradient id={`sp-${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.35" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon points={`0,30 ${pts} 100,30`} fill={`url(#sp-${id})`} />
        </>
      )}
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.4" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
    </svg>
  );
}
