import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { cn } from "../../lib/cn";

/** Efek magnet: elemen tertarik ke arah kursor saat didekati, kembali dengan pegas. */
export default function Magnetic({ children, strength = 0.35, className }) {
  const ref = useRef(null);
  const x = useSpring(useMotionValue(0), { stiffness: 260, damping: 18, mass: 0.4 });
  const y = useSpring(useMotionValue(0), { stiffness: 260, damping: 18, mass: 0.4 });
  const onMove = e => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const reset = () => { x.set(0); y.set(0); };
  return (
    <motion.div ref={ref} onPointerMove={onMove} onPointerLeave={reset} style={{ x, y }} className={cn("inline-block", className)}>
      {children}
    </motion.div>
  );
}
