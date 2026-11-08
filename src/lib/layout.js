/**
 * Posisi elemen relatif terhadap container berdasarkan layout (offsetLeft/Top),
 * BUKAN getBoundingClientRect — sehingga tidak terdistorsi transform leluhur
 * (mis. animasi CRT power-on scaleY, parallax, tilt 3D).
 */
export function layoutRect(el, container) {
  let x = 0, y = 0, n = el;
  while (n && n !== container) {
    x += n.offsetLeft;
    y += n.offsetTop;
    const p = n.offsetParent;
    if (!p) break;
    // offsetParent melompati container → koreksi dengan border & lanjut
    if (p !== container && !container.contains(p)) {
      const cr = container.getBoundingClientRect(), er = el.getBoundingClientRect();
      return { x: er.left - cr.left, y: er.top - cr.top, w: el.offsetWidth, h: el.offsetHeight };
    }
    x += p.clientLeft || 0;
    y += p.clientTop || 0;
    n = p;
  }
  return { x, y, w: el.offsetWidth, h: el.offsetHeight };
}
