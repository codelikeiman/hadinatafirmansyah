import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { cn } from "../../lib/cn";

/**
 * Aceternity — Timeline: judul sticky di kiri, beam vertikal yang tumbuh
 * mengikuti scroll (useScroll + useTransform), konten di kanan.
 * data: [{ title, content }]
 */
export default function Timeline({ data, className }) {
  const ref = useRef(null);
  const containerRef = useRef(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setHeight(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start 15%", "end 60%"] });
  const beamH = useTransform(scrollYProgress, [0, 1], [0, height]);
  const beamO = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <div ref={containerRef} className={cn("w-full", className)}>
      <div ref={ref} className="relative pb-10">
        {data.map((item, i) => (
          <div key={i} className="flex justify-start pt-10 md:gap-10 md:pt-24">
            <div className="sticky top-24 z-40 flex max-w-xs flex-col items-center self-start md:w-full md:flex-row lg:max-w-sm">
              <div className="absolute left-3 flex size-10 items-center justify-center rounded-full bg-black">
                <div className="size-4 rounded-full border border-line2 bg-d2 shadow-[0_0_14px_#00ff4188]" />
              </div>
              <h3 className="hidden text-xl font-bold text-tx2 md:block md:pl-20 md:text-3xl">{item.title}</h3>
            </div>
            <div className="relative w-full pl-20 pr-2 md:pl-4">
              <h3 className="mb-4 block text-left text-xl font-bold text-tx2 md:hidden">{item.title}</h3>
              {item.content}
            </div>
          </div>
        ))}
        <div
          style={{ height }}
          className="absolute left-8 top-0 w-[2px] overflow-hidden bg-[linear-gradient(to_bottom,transparent_0%,#0c4a20_10%,#0c4a20_90%,transparent_99%)] [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)]"
          aria-hidden="true"
        >
          <motion.div style={{ height: beamH, opacity: beamO }} className="absolute inset-x-0 top-0 w-[2px] rounded-full bg-gradient-to-t from-g via-b to-transparent from-[0%] via-[10%] shadow-[0_0_12px_#00ff41]" />
        </div>
      </div>
    </div>
  );
}
