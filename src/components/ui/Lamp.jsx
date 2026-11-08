import { motion } from "motion/react";
import { cn } from "../../lib/cn";

/** Aceternity — Lamp: dua kerucut cahaya bertemu di tengah, melebar saat masuk viewport. */
export default function Lamp({ children, className, color = "#00ff41" }) {
  const reveal = (from, to) => ({
    initial: { opacity: 0.5, width: from },
    whileInView: { opacity: 1, width: to },
    viewport: { once: true },
    transition: { delay: 0.3, duration: 0.8, ease: "easeInOut" },
  });
  return (
    <div className={cn("relative z-0 flex min-h-[560px] w-full flex-col items-center justify-center overflow-hidden bg-black", className)}>
      <div className="relative isolate z-0 flex w-full flex-1 scale-y-125 items-center justify-center" aria-hidden="true">
        <motion.div {...reveal("15rem", "30rem")} style={{ backgroundImage: `conic-gradient(var(--conic-position), var(--tw-gradient-stops))`, "--conic-position": "from 70deg at center top", "--tw-gradient-stops": `${color}, transparent, transparent` }}
          className="absolute inset-auto right-1/2 h-56 overflow-visible">
          <div className="absolute bottom-0 left-0 z-20 h-40 w-full bg-black [mask-image:linear-gradient(to_top,white,transparent)]" />
          <div className="absolute bottom-0 left-0 z-20 h-full w-40 bg-black [mask-image:linear-gradient(to_right,white,transparent)]" />
        </motion.div>
        <motion.div {...reveal("15rem", "30rem")} style={{ backgroundImage: `conic-gradient(var(--conic-position), var(--tw-gradient-stops))`, "--conic-position": "from 290deg at center top", "--tw-gradient-stops": `transparent, transparent, ${color}` }}
          className="absolute inset-auto left-1/2 h-56">
          <div className="absolute bottom-0 right-0 z-20 h-full w-40 bg-black [mask-image:linear-gradient(to_left,white,transparent)]" />
          <div className="absolute bottom-0 right-0 z-20 h-40 w-full bg-black [mask-image:linear-gradient(to_top,white,transparent)]" />
        </motion.div>
        <div className="absolute top-1/2 h-48 w-full translate-y-12 scale-x-150 bg-black blur-2xl" />
        <div className="absolute top-1/2 z-50 h-48 w-full bg-transparent opacity-10 backdrop-blur-md" />
        <div className="absolute inset-auto z-50 h-36 w-[28rem] -translate-y-1/2 rounded-full opacity-50 blur-3xl" style={{ background: color }} />
        <motion.div {...reveal("8rem", "16rem")} className="absolute inset-auto z-30 h-36 -translate-y-[6rem] rounded-full blur-2xl" style={{ background: "#c2ffd3" }} />
        <motion.div {...reveal("15rem", "30rem")} className="absolute inset-auto z-50 h-0.5 -translate-y-[7rem]" style={{ background: "#c2ffd3", boxShadow: `0 0 20px ${color}` }} />
        <div className="absolute inset-auto z-40 h-44 w-full -translate-y-[12.5rem] bg-black" />
      </div>
      <div className="relative z-50 flex -translate-y-72 flex-col items-center px-5">{children}</div>
    </div>
  );
}
