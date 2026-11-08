import { motion, useScroll, useSpring } from "motion/react";
import { cn } from "../../lib/cn";

/** Magic UI — ScrollProgress: bar progres scroll (Motion value → scaleX; nol re-render). */
export default function ScrollProgress({ className }) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 220, damping: 40, restDelta: 0.001 });
  return (
    <motion.div
      aria-hidden="true"
      className={cn("fixed inset-x-0 top-0 z-[1001] h-0.5 origin-left bg-gradient-to-r from-g via-b to-g shadow-[0_0_10px_#00ff41]", className)}
      style={{ scaleX }}
    />
  );
}
