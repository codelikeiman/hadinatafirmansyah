import { useId, useRef, useState } from "react";
import { motion } from "motion/react";

/**
 * Aceternity — TextHoverEffect: teks SVG raksasa bergaris tepi; gradien
 * berwarna hanya terlihat di sekitar kursor (radial mask), stroke digambar saat mount.
 */
export default function TextHoverEffect({ text, duration = 0, className }) {
  const svgRef = useRef(null);
  const uid = useId().replace(/:/g, "");
  const [hovered, setHovered] = useState(false);
  const [mask, setMask] = useState({ cx: "50%", cy: "50%" });

  const onMove = e => {
    const r = svgRef.current?.getBoundingClientRect();
    if (r) setMask({ cx: `${((e.clientX - r.left) / r.width) * 100}%`, cy: `${((e.clientY - r.top) / r.height) * 100}%` });
  };

  return (
    <svg
      ref={svgRef} width="100%" height="100%" viewBox="0 0 300 100" xmlns="http://www.w3.org/2000/svg"
      onPointerEnter={() => setHovered(true)} onPointerLeave={() => setHovered(false)} onPointerMove={onMove}
      className={className} role="img" aria-label={text}
    >
      <defs>
        <linearGradient id={`th-grad-${uid}`} gradientUnits="userSpaceOnUse" cx="50%" cy="50%" r="25%">
          {hovered && (
            <>
              <stop offset="0%" stopColor="#ffd400" />
              <stop offset="25%" stopColor="#ff003c" />
              <stop offset="50%" stopColor="#00f0ff" />
              <stop offset="75%" stopColor="#00ff41" />
              <stop offset="100%" stopColor="#b26bff" />
            </>
          )}
        </linearGradient>
        <motion.radialGradient id={`th-mask-${uid}`} gradientUnits="userSpaceOnUse" r="22%" initial={{ cx: "50%", cy: "50%" }} animate={mask} transition={{ duration, ease: "easeOut" }}>
          <stop offset="0%" stopColor="white" />
          <stop offset="100%" stopColor="black" />
        </motion.radialGradient>
        <mask id={`th-m-${uid}`}>
          <rect x="0" y="0" width="100%" height="100%" fill={`url(#th-mask-${uid})`} />
        </mask>
      </defs>
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" strokeWidth="0.3" className="fill-transparent stroke-line2 font-mono text-7xl font-bold" style={{ opacity: hovered ? 0.7 : 0 }}>
        {text}
      </text>
      <motion.text
        x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" strokeWidth="0.3"
        className="fill-transparent stroke-g font-mono text-7xl font-bold"
        initial={{ strokeDashoffset: 1000, strokeDasharray: 1000 }}
        animate={{ strokeDashoffset: 0, strokeDasharray: 1000 }}
        transition={{ duration: 4, ease: "easeInOut" }}
      >
        {text}
      </motion.text>
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" stroke={`url(#th-grad-${uid})`} strokeWidth="0.3" mask={`url(#th-m-${uid})`} className="fill-transparent font-mono text-7xl font-bold">
        {text}
      </text>
    </svg>
  );
}
