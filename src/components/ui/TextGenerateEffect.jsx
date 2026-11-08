import { useEffect, useRef } from "react";
import { motion, stagger, useAnimate, useInView } from "motion/react";
import { cn } from "../../lib/cn";

/** Aceternity — TextGenerateEffect: kata demi kata muncul dari blur saat masuk viewport. */
export default function TextGenerateEffect({ words, className, filter = true, duration = 0.5, staggerDelay = 0.06 }) {
  const [scope, animate] = useAnimate();
  const inViewRef = useRef(null);
  const inView = useInView(inViewRef, { once: true, margin: "-40px" });
  const list = words.split(" ");

  useEffect(() => {
    if (!inView) return;
    animate("span", { opacity: 1, filter: filter ? "blur(0px)" : "none" }, { duration, delay: stagger(staggerDelay) });
  }, [inView, animate, filter, duration, staggerDelay]);

  return (
    <div ref={inViewRef} className={cn(className)}>
      <motion.div ref={scope}>
        {list.map((w, i) => (
          <motion.span key={w + i} className="opacity-0" style={{ filter: filter ? "blur(10px)" : "none" }}>
            {w}{" "}
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
}
