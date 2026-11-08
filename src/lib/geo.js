// Utilitas geografi untuk globe cobe & traceroute.
const R_EARTH = 6371; // km
const toRad = d => (d * Math.PI) / 180;

/** sudut (phi, theta) cobe yang menghadapkan lokasi [lat, lng] ke kamera */
export const focusAngles = ([lat, lng]) => [Math.PI - (toRad(lng) - Math.PI / 2), toRad(lat)];

/** lat/lng → vektor 3D di bola satuan (rumus identik dengan internal cobe v2) */
export function latLngTo3D([lat, lng]) {
  const r = toRad(lat), a = toRad(lng) - Math.PI, o = Math.cos(r);
  return [-o * Math.cos(a), Math.sin(r), o * Math.sin(a)];
}

/**
 * Proyeksi marker ke koordinat layar (0..1) — salinan matematika `O()`/`W()`
 * di cobe v2 untuk aspect 1, scale 1, offset 0, radius globe 0.8.
 */
export function projectMarker(location, phi, theta, elevation = 0.015) {
  const v = latLngTo3D(location).map(c => c * (0.8 + elevation));
  const cr = Math.cos(theta), cp = Math.cos(phi), sr = Math.sin(theta), sp = Math.sin(phi);
  const c = cp * v[0] + sp * v[2];
  const s = sp * sr * v[0] + cr * v[1] - cp * sr * v[2];
  const front = -sp * cr * v[0] + sr * v[1] + cp * cr * v[2] >= 0 || c * c + s * s >= 0.64;
  return { x: (c + 1) / 2, y: (-s + 1) / 2, visible: front };
}

/** jarak great-circle (km) */
export function haversine([lat1, lng1], [lat2, lng2]) {
  const dLat = toRad(lat2 - lat1), dLng = toRad(lng2 - lng1);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R_EARTH * Math.asin(Math.sqrt(h));
}

/**
 * Perkiraan RTT (ms): cahaya di fiber ≈ 200.000 km/s, rute nyata ≈ 1.6× jarak
 * garis lurus, plus ~1.5 ms overhead per hop.
 */
export const estimateRtt = (km, hops = 1) => (2 * km * 1.6) / 200 + hops * 1.5;
