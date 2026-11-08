import { Children } from "react";
import { cn } from "../../lib/cn";

/** Magic UI — OrbitingCircles: elemen anak mengorbit pusat (CSS custom properties + keyframes). */
export default function OrbitingCircles({ className, children, reverse = false, duration = 20, radius = 160, path = true, iconSize = 34, speed = 1 }) {
  const items = Children.toArray(children);
  const calc = duration / speed;
  return (
    <>
      {path && (
        <svg aria-hidden="true" className="pointer-events-none absolute inset-0 size-full">
          <circle className="stroke-line2/60 stroke-1" cx="50%" cy="50%" r={radius} fill="none" strokeDasharray="2 6" />
        </svg>
      )}
      {items.map((child, i) => (
        <div
          key={i}
          style={{ "--duration": calc, "--radius": radius, "--angle": (360 / items.length) * i, width: iconSize, height: iconSize }}
          className={cn("absolute left-1/2 top-1/2 flex transform-gpu animate-orbit items-center justify-center", reverse && "[animation-direction:reverse]", className)}
        >
          <div style={{ marginLeft: -iconSize / 2, marginTop: -iconSize / 2 }} className="flex size-full items-center justify-center">{child}</div>
        </div>
      ))}
    </>
  );
}
