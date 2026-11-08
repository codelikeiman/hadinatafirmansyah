// Titik internet exchange / kota hub untuk simulasi traceroute.
// Koordinat publik kota (bukan lokasi server nyata).
export const HUBS = {
  MES: { name: "Medan", code: "MES", location: [3.5952, 98.6722], asn: "AS7713" },
  JKT: { name: "Jakarta IIX", code: "JKT", location: [-6.2088, 106.8456], asn: "AS4800" },
  SIN: { name: "Singapore Equinix", code: "SIN", location: [1.3521, 103.8198], asn: "AS4637" },
  HKG: { name: "Hong Kong HKIX", code: "HKG", location: [22.3193, 114.1694], asn: "AS4635" },
  TYO: { name: "Tokyo JPIX", code: "TYO", location: [35.6762, 139.6503], asn: "AS7527" },
  SYD: { name: "Sydney IX", code: "SYD", location: [-33.8688, 151.2093], asn: "AS7575" },
  MUM: { name: "Mumbai NIXI", code: "BOM", location: [19.076, 72.8777], asn: "AS9498" },
  FRA: { name: "Frankfurt DE-CIX", code: "FRA", location: [50.1109, 8.6821], asn: "AS6695" },
  LON: { name: "London LINX", code: "LON", location: [51.5074, -0.1278], asn: "AS5459" },
  NYC: { name: "New York NYIIX", code: "NYC", location: [40.7128, -74.006], asn: "AS6939" },
  LAX: { name: "Los Angeles Any2", code: "LAX", location: [34.0522, -118.2437], asn: "AS3356" },
  GRU: { name: "São Paulo IX.br", code: "GRU", location: [-23.5505, -46.6333], asn: "AS26162" },
};

// Kota contoh untuk "probe" + pemetaan zona waktu → perkiraan lokasi pengunjung.
export const PROBES = [
  { id: "you", label: "kamu (perkiraan dari zona waktu)" },
  { id: "sf", label: "San Francisco", location: [37.7749, -122.4194] },
  { id: "ny", label: "New York", location: [40.7128, -74.006] },
  { id: "lon", label: "London", location: [51.5074, -0.1278] },
  { id: "tyo", label: "Tokyo", location: [35.6762, 139.6503] },
  { id: "syd", label: "Sydney", location: [-33.8688, 151.2093] },
  { id: "sao", label: "São Paulo", location: [-23.5505, -46.6333] },
];

export const TZ_CITIES = {
  "Asia/Jakarta": [-6.2088, 106.8456], "Asia/Makassar": [-5.1477, 119.4327], "Asia/Jayapura": [-2.5337, 140.7181],
  "Asia/Pontianak": [-0.0263, 109.3425], "Asia/Singapore": [1.3521, 103.8198], "Asia/Kuala_Lumpur": [3.139, 101.6869],
  "Asia/Bangkok": [13.7563, 100.5018], "Asia/Ho_Chi_Minh": [10.8231, 106.6297], "Asia/Manila": [14.5995, 120.9842],
  "Asia/Hong_Kong": [22.3193, 114.1694], "Asia/Shanghai": [31.2304, 121.4737], "Asia/Tokyo": [35.6762, 139.6503],
  "Asia/Seoul": [37.5665, 126.978], "Asia/Kolkata": [19.076, 72.8777], "Asia/Calcutta": [19.076, 72.8777], "Asia/Dubai": [25.2048, 55.2708],
  "Australia/Sydney": [-33.8688, 151.2093], "Australia/Melbourne": [-37.8136, 144.9631], "Australia/Perth": [-31.9505, 115.8605],
  "Europe/London": [51.5074, -0.1278], "Europe/Berlin": [52.52, 13.405], "Europe/Paris": [48.8566, 2.3522],
  "Europe/Amsterdam": [52.3676, 4.9041], "Europe/Madrid": [40.4168, -3.7038], "Europe/Moscow": [55.7558, 37.6173],
  "America/New_York": [40.7128, -74.006], "America/Chicago": [41.8781, -87.6298], "America/Denver": [39.7392, -104.9903],
  "America/Los_Angeles": [34.0522, -118.2437], "America/Toronto": [43.6532, -79.3832], "America/Sao_Paulo": [-23.5505, -46.6333],
  "America/Mexico_City": [19.4326, -99.1332], "Africa/Lagos": [6.5244, 3.3792], "Africa/Johannesburg": [-26.2041, 28.0473],
  "UTC": [51.4779, -0.0015],
};
