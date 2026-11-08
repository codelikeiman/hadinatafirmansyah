/** Preset animasi Motion yang dipakai berulang. */
export const rise = i => ({
  initial: { opacity: 0, x: -24 },
  animate: { opacity: 1, x: 0 },
  transition: { delay: i * 0.07, type: "spring", stiffness: 200, damping: 20 },
});

export const fadeUp = (i = 0, d = 0.06) => ({
  initial: { opacity: 0, y: 24, filter: "blur(6px)" },
  whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
  viewport: { once: true, margin: "-60px" },
  transition: { delay: i * d, duration: 0.6, ease: [0.16, 1, 0.3, 1] },
});
