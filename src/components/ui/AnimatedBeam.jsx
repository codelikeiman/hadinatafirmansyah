import { useEffect, useId, useState } from "react";
import { motion } from "motion/react";
import { cn } from "../../lib/cn";
import { layoutRect } from "../../lib/layout";

/**
 * Magic UI — AnimatedBeam: kurva SVG antara dua elemen (ref) dengan gradien
 * yang mengalir di sepanjang jalur. Posisi dihitung ulang via ResizeObserver.
 */
export default function AnimatedBeam({
  className, containerRef, fromRef, toRef, curvature = 0, reverse = false,
  duration = 4.5, delay = 0, pathColor = "#14802f", pathWidth = 2, pathOpacity = 0.6,
  gradientStartColor = "#00ff41", gradientStopColor = "#00f0ff",
  startXOffset = 0, startYOffset = 0, endXOffset = 0, endYOffset = 0,
}) {
  const id = useId();
  const [geo, setGeo] = useState({ d: "", w: 0, h: 0 });

  const coords = reverse
    ? { x1: ["90%", "-10%"], x2: ["100%", "0%"], y1: ["0%", "0%"], y2: ["0%", "0%"] }
    : { x1: ["10%", "110%"], x2: ["0%", "100%"], y1: ["0%", "0%"], y2: ["0%", "0%"] };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const update = () => {
      const a = fromRef.current, b = toRef.current;
      if (!a || !b) return;
      const ra = layoutRect(a, container), rb = layoutRect(b, container);
      const sx = ra.x + ra.w / 2 + startXOffset;
      const sy = ra.y + ra.h / 2 + startYOffset;
      const ex = rb.x + rb.w / 2 + endXOffset;
      const ey = rb.y + rb.h / 2 + endYOffset;
      const cy = sy - curvature;
      setGeo({ d: `M ${sx},${sy} Q ${(sx + ex) / 2},${cy} ${ex},${ey}`, w: container.clientWidth, h: container.clientHeight });
    };
    // ResizeObserver selalu memanggil callback sekali setelah observe → posisi awal ikut terhitung
    const ro = new ResizeObserver(update);
    ro.observe(container);
    if (fromRef.current) ro.observe(fromRef.current);
    if (toRef.current) ro.observe(toRef.current);
    return () => ro.disconnect();
  }, [containerRef, fromRef, toRef, curvature, startXOffset, startYOffset, endXOffset, endYOffset]);

  return (
    <svg
      fill="none" width={geo.w} height={geo.h} xmlns="http://www.w3.org/2000/svg"
      className={cn("pointer-events-none absolute left-0 top-0 transform-gpu stroke-2", className)}
      viewBox={`0 0 ${geo.w || 1} ${geo.h || 1}`} aria-hidden="true"
    >
      <path d={geo.d} stroke={pathColor} strokeWidth={pathWidth} strokeOpacity={pathOpacity} strokeLinecap="round" />
      <path d={geo.d} strokeWidth={pathWidth} stroke={`url(#${CSS.escape(id)})`} strokeOpacity="1" strokeLinecap="round" />
      <defs>
        <motion.linearGradient
          id={id} gradientUnits="userSpaceOnUse"
          initial={{ x1: "0%", x2: "0%", y1: "0%", y2: "0%" }}
          animate={coords}
          transition={{ delay, duration, ease: [0.16, 1, 0.3, 1], repeat: Infinity, repeatDelay: 0 }}
        >
          <stop stopColor={gradientStartColor} stopOpacity="0" />
          <stop stopColor={gradientStartColor} />
          <stop offset="32.5%" stopColor={gradientStopColor} />
          <stop offset="100%" stopColor={gradientStopColor} stopOpacity="0" />
        </motion.linearGradient>
      </defs>
    </svg>
  );
}
