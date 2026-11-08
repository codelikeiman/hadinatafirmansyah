import { useEffect, useState } from "react";

/**
 * true selama elemen terlihat di viewport DAN tab aktif — dipakai untuk
 * menjeda loop rAF / WebGL saat tidak terlihat (hemat baterai & GPU).
 */
export function useInViewport(ref, { rootMargin = "120px", once = false } = {}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let inView = false;
    const sync = () => setVisible(inView && !document.hidden);
    const io = new IntersectionObserver(([e]) => {
      inView = e.isIntersecting;
      sync();
      if (once && inView) io.disconnect();
    }, { rootMargin });
    io.observe(el);
    document.addEventListener("visibilitychange", sync);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [ref, rootMargin, once]);
  return visible;
}
