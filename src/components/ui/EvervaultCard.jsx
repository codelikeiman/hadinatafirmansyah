import { useState } from "react";
import { motion, useMotionTemplate, useMotionValue } from "motion/react";
import { cn } from "../../lib/cn";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789ｱｲｳｴｵ#$%&*+=<>";
const randomString = n => {
  let s = "";
  for (let i = 0; i < n; i++) s += CHARS[(Math.random() * CHARS.length) | 0];
  return s;
};

/**
 * Aceternity — EvervaultCard: hover memunculkan "ciphertext" acak yang
 * berganti tiap gerakan kursor, di-mask lingkaran yang mengikuti pointer.
 */
export default function EvervaultCard({ text, className, children }) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const [cipher, setCipher] = useState(() => randomString(1500));
  const mask = useMotionTemplate`radial-gradient(240px at ${mx}px ${my}px, white, transparent)`;

  const onMove = e => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(e.clientX - r.left);
    my.set(e.clientY - r.top);
    setCipher(randomString(1500));
  };

  return (
    <div onPointerMove={onMove} className={cn("group/ever relative flex aspect-square w-full items-center justify-center overflow-hidden border border-line bg-black", className)}>
      <div className="pointer-events-none">
        <div className="absolute inset-0 [mask-image:linear-gradient(white,transparent)] group-hover/ever:opacity-50" />
        <motion.div className="absolute inset-0 bg-gradient-to-r from-g2 to-b opacity-0 backdrop-blur-xl transition duration-500 group-hover/ever:opacity-100" style={{ maskImage: mask, WebkitMaskImage: mask }} />
        <motion.div className="absolute inset-0 opacity-0 mix-blend-overlay group-hover/ever:opacity-100" style={{ maskImage: mask, WebkitMaskImage: mask }}>
          <p className="absolute inset-x-0 h-full break-words whitespace-pre-wrap font-mono text-[11px] font-bold text-black">{cipher}</p>
        </motion.div>
      </div>
      <div className="relative z-10 flex size-40 items-center justify-center">
        <div className="absolute size-full rounded-full bg-black/85 blur-sm" />
        <span className="relative z-20 text-center text-3xl font-bold text-bright glow-text">{text ?? children}</span>
      </div>
    </div>
  );
}
