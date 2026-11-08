import { HUBS, TZ_CITIES } from "../data/network";
import { estimateRtt, haversine } from "./geo";

/** Perkiraan lokasi pengunjung dari zona waktu (tanpa izin geolokasi, tanpa request jaringan). */
export function guessVisitor() {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  if (TZ_CITIES[tz]) return { tz, location: TZ_CITIES[tz] };
  const offsetH = -new Date().getTimezoneOffset() / 60;
  return { tz, location: [20, Math.max(-179, Math.min(179, offsetH * 15))] };
}

/** Pilih rantai hub yang masuk akal dari lokasi sumber ke Medan. */
function hubChain([lat, lng]) {
  const H = HUBS;
  if (lng > 95 && lng < 120 && lat < 10 && lat > -12) return lat < -3 ? [H.JKT] : [H.SIN];       // Indonesia / SEA selatan
  if (lng >= 90 && lng < 150 && lat >= 10) return lng > 125 ? [H.TYO, H.HKG, H.SIN] : [H.HKG, H.SIN]; // Asia Timur
  if (lng >= 110 && lat <= -12) return [H.SYD, H.SIN];                                            // Oseania
  if (lng >= 40 && lng < 90) return [H.MUM, H.SIN];                                               // Asia Selatan / Timur Tengah
  if (lng >= -25 && lng < 40) return lat < 30 ? [H.FRA, H.MUM, H.SIN] : [H.FRA, H.MUM, H.SIN];    // Eropa / Afrika
  if (lng < -30 && lat < 0) return [H.GRU, H.LAX, H.TYO, H.SIN];                                  // Amerika Selatan
  if (lng < -100) return [H.LAX, H.TYO, H.HKG, H.SIN];                                            // Amerika barat
  return [H.NYC, H.LON, H.FRA, H.MUM, H.SIN];                                                     // Amerika timur
}

/** IP tiruan yang deterministik (murni) dari kode hub; hop terakhir = 203.0.113.42 (TEST-NET-3, sama dengan banner SSH). */
function fakeIp(code, i) {
  if (code === "MES") return "203.0.113.42";
  let h = 2166136261;
  for (const ch of code + i) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  return `${(h % 180) + 23}.${(h >>> 8) % 255}.${(h >>> 16) % 255}.${(h >>> 24) % 254 + 1}`;
}

/**
 * Bangun daftar hop: gateway lokal → hub → Medan. RTT dihitung kumulatif dari
 * jarak great-circle (lihat estimateRtt). Ini simulasi, bukan traceroute sungguhan.
 */
export function buildRoute(source) {
  const chain = [...hubChain(source), HUBS.MES];
  const hops = [{ code: "GW", name: "local gateway", location: source, asn: "AS—", ip: "192.168.1.1" }];
  chain.forEach((h, i) => hops.push({ ...h, ip: fakeIp(h.code, i + 1) }));
  let km = 0;
  return hops.map((h, i) => {
    if (i > 0) km += haversine(hops[i - 1].location, h.location);
    const base = i === 0 ? 0.4 : estimateRtt(km, i);
    const rtt = [base, base * 1.03 + 0.2, base * 0.98 + 0.1].map(v => Math.round(v * 1000) / 1000);
    return { ...h, km: Math.round(km), rtt, hop: i + 1 };
  });
}
