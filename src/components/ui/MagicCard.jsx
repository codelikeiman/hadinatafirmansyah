import { motion, useMotionTemplate, useMotionValue } from "motion/react";
import { cn } from "../../lib/cn";

/** Magic UI — MagicCard: border & isi menyala mengikuti posisi kursor (Motion values, tanpa re-render). */
export default function MagicCard({ children, className, gradientSize = 240, gradientColor = "rgba(0,255,65,.14)", gradientFrom = "#00ff41", gradientTo = "#00f0ff", ...rest }) {
  const mx = useMotionValue(-gradientSize);
  const my = useMotionValue(-gradientSize);
  const border = useMotionTemplate`radial-gradient(${gradientSize}px circle at ${mx}px ${my}px, ${gradientFrom}, ${gradientTo}, transparent 100%)`;
  const fill = useMotionTemplate`radial-gradient(${gradientSize}px circle at ${mx}px ${my}px, ${gradientColor}, transparent 100%)`;

  const onMove = e => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(e.clientX - r.left);
    my.set(e.clientY - r.top);
  };
  const reset = () => { mx.set(-gradientSize); my.set(-gradientSize); };

  return (
    <div {...rest} onPointerMove={onMove} onPointerLeave={reset} className={cn("group relative isolate overflow-hidden border border-line bg-d0", className)}>
      <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: border }} />
      <div aria-hidden="true" className="pointer-events-none absolute inset-px -z-10 bg-d0" />
      <motion.div aria-hidden="true" className="pointer-events-none absolute inset-px -z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: fill }} />
      {children}
    </div>
  );
}
