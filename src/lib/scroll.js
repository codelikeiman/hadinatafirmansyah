// Penyimpan instance Lenis global, supaya router, tombol, dan nav-dots bisa
// men-scroll dengan smoothing yang sama tanpa harus lewat React context.
let lenis = null;
const listeners = new Set();

export function setLenis(instance) {
  lenis = instance;
  listeners.forEach(fn => fn(lenis));
}

export const getLenis = () => lenis;

export function onLenis(fn) {
  listeners.add(fn);
  if (lenis) fn(lenis);
  return () => listeners.delete(fn);
}

/** Scroll ke elemen/selector/angka; pakai Lenis kalau aktif. */
export function scrollTo(target, { immediate = false, offset = -48, duration } = {}) {
  if (lenis) {
    lenis.scrollTo(target, { immediate, offset, duration, force: true });
    return;
  }
  if (typeof target === "number") {
    window.scrollTo({ top: target, behavior: immediate ? "instant" : "smooth" });
    return;
  }
  const el = typeof target === "string" ? document.querySelector(target) : target;
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY + offset;
  window.scrollTo({ top, behavior: immediate ? "instant" : "smooth" });
}

export const scrollToTop = (immediate = true) => scrollTo(0, { immediate, offset: 0 });

export function lockScroll(locked) {
  if (lenis) (locked ? lenis.stop() : lenis.start());
  document.documentElement.style.overflow = locked ? "hidden" : "";
}
