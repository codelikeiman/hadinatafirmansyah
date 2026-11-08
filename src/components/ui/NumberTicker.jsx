import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "motion/react";
import { cn } from "../../lib/cn";

/** Magic UI — NumberTicker: angka berpegas naik saat masuk viewport (update DOM langsung, nol re-render). */
export default function NumberTicker({ value, startValue = 0, direction = "up", delay = 0, decimalPlaces = 0, className, suffix = "" }) {
  const ref = useRef(null);
  const motionValue = useMotionValue(direction === "down" ? value : startValue);
  const spring = useSpring(motionValue, { damping: 60, stiffness: 100 });
  const inView = useInView(ref, { once: true, margin: "0px" });

  useEffect(() => {
    if (!inView) return;
    const t = setTimeout(() => motionValue.set(direction === "down" ? startValue : value), delay * 1000);
    return () => clearTimeout(t);
  }, [motionValue, inView, delay, value, direction, startValue]);

  useEffect(() => {
    const fmt = new Intl.NumberFormat("en-US", { minimumFractionDigits: decimalPlaces, maximumFractionDigits: decimalPlaces });
    return spring.on("change", latest => {
      if (ref.current) ref.current.textContent = fmt.format(Number(latest.toFixed(decimalPlaces))) + suffix;
    });
  }, [spring, decimalPlaces, suffix]);

  return (
    <span ref={ref} className={cn("inline-block tabular-nums", className)}>
      {startValue}{suffix}
    </span>
  );
}
