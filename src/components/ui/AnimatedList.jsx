import { Children, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "../../lib/cn";

/** Magic UI — AnimatedList: item muncul satu per satu dari atas dengan animasi pegas + layout. */
export default function AnimatedList({ children, className, delay = 1200, max = 6 }) {
  const items = useMemo(() => Children.toArray(children), [children]);
  const [count, setCount] = useState(1);

  useEffect(() => {
    const id = setInterval(() => setCount(c => c + 1), delay);
    return () => clearInterval(id);
  }, [delay]);

  const visible = useMemo(() => {
    const out = [];
    for (let i = 0; i < Math.min(count, max); i++) {
      const k = count - 1 - i;
      out.push({ key: k, node: items[((k % items.length) + items.length) % items.length] });
    }
    return out;
  }, [count, items, max]);

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <AnimatePresence initial={false}>
        {visible.map(({ key, node }) => (
          <motion.div
            key={key}
            layout
            initial={{ scale: 0, opacity: 0, y: -16 }}
            animate={{ scale: 1, opacity: 1, y: 0, originY: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 40 }}
            className="w-full"
          >
            {node}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
