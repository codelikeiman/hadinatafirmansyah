import { Children, cloneElement, isValidElement, useRef } from "react";
import { motion, useMotionValue, useMotionValueEvent, useSpring } from "motion/react";
import { cn } from "../../lib/cn";

/**
 * Magic UI — Dock: magnifikasi ala macOS. Jarak pointer → ukuran ikon
 * dihitung di event handler (bukan saat render) lalu dihaluskan pegas.
 */
export function Dock({ children, className, magnification = 62, distance = 150, baseSize = 42 }) {
  const mouseX = useMotionValue(Infinity);
  return (
    <motion.div
      onPointerMove={e => mouseX.set(e.clientX)}
      onPointerLeave={() => mouseX.set(Infinity)}
      className={cn("mx-auto flex h-[74px] w-max items-end gap-2 border border-line2 bg-d0/80 px-3 pb-3 backdrop-blur-md shadow-[0_0_40px_#00ff4122]", className)}
    >
      {Children.map(children, child => (isValidElement(child) ? cloneElement(child, { mouseX, magnification, distance, baseSize }) : child))}
    </motion.div>
  );
}

export function DockIcon({ mouseX, magnification = 62, distance = 150, baseSize = 42, className, children, label, ...rest }) {
  const ref = useRef(null);
  const size = useSpring(baseSize, { mass: 0.1, stiffness: 160, damping: 13 });

  useMotionValueEvent(mouseX, "change", x => {
    const el = ref.current;
    if (!el || !Number.isFinite(x)) { size.set(baseSize); return; }
    const r = el.getBoundingClientRect();
    const d = Math.abs(x - (r.left + r.width / 2));
    const t = Math.max(0, 1 - d / distance);
    size.set(baseSize + (magnification - baseSize) * (1 - (1 - t) * (1 - t)));
  });

  return (
    <motion.div
      ref={ref}
      style={{ width: size, height: size }}
      className={cn("group relative flex aspect-square shrink-0 items-center justify-center border border-line2 bg-black text-g", className)}
      {...rest}
    >
      {children}
      {label && (
        <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap border border-g bg-black px-2 py-0.5 text-[10px] text-g opacity-0 transition-opacity group-hover:opacity-100">
          {label}
        </span>
      )}
    </motion.div>
  );
}
