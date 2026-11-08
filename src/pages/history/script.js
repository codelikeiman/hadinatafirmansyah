import { EDUCATION, RESUME, SKILLS } from "../../data/profile";
import { buildProjectState } from "./theatreState";

/** Naskah sinema: chapter diambil dari data CV (profile.js). */
export const CHAPTERS = [
  ...RESUME.map((r, i) => ({
    year: String(r.from),
    title: r.role,
    where: r.where,
    stack: r.stack,
    text: [
      `Era ${r.where.toLowerCase()} — merilis fitur nyata dengan ${r.stack.join(", ")}.`,
      `Naik level ke ${r.stack.join(" + ")}: frontend dan backend dalam satu tangan.`,
      `Fokus penuh di backend: API, skema data, antrean job, dan performa query.`,
    ][i] ?? `${r.role} · ${r.where}`,
    color: ["#ffb000", "#00f0ff", "#00ff41"][i % 3],
  })),
  { year: String(EDUCATION.year), title: EDUCATION.degree, where: "graduated", stack: ["Algorithms", "Systems", "Networks"], text: "Teori bertemu praktik: gelar sarjana ilmu komputer selesai.", color: "#b26bff" },
  { year: "NOW", title: `${SKILLS.length} services running`, where: "uptime 4y+", stack: SKILLS.slice(0, 6).map(s => s.id.replace(".service", "")), text: "Semua service aktif. Siap untuk tantangan berikutnya.", color: "#c2ffd3" },
];

export const SHEET = "Cinema";
export const LENGTH = 12;
export const STATION_GAP = 40;
export const stationTime = k => 1.8 + (k - 1) * 2; // chapter k (1..N) tiba di detik ini
export const stationZ = k => -STATION_GAP * k;
export const stationX = k => (k % 2 ? 3.2 : -3.2);

function buildKeyframes() {
  const N = CHAPTERS.length;
  const cam = { x: [[0, 0]], y: [[0, 1.6]], z: [[0, 16]], roll: [[0, 0]], fov: [[0, 55]] };
  const atmos = { hue: [[0, 0]], density: [[0, 0.018]], warp: [[0, 0]] };
  const objects = { Camera: cam, Atmosphere: atmos };

  objects.Intro = { opacity: [[0, 1], [0.6, 1], [1.1, 0]], y: [[0, 0], [1.1, -60]], blur: [[0, 0], [1.1, 12]] };

  for (let k = 1; k <= N; k++) {
    const t = stationTime(k), z = stationZ(k), x = stationX(k);
    cam.z.push([t - 0.35, z + 19], [t + 0.45, z + 15]);
    cam.x.push([t - 0.35, -x * 0.35], [t + 0.45, -x * 0.2]);
    cam.y.push([t - 0.35, 1.2], [t + 0.45, 1.6]);
    cam.roll.push([t - 0.35, 0], [t + 0.45, 0]);
    cam.fov.push([t - 0.35, 50], [t + 0.45, 52]);
    atmos.hue.push([t - 0.35, k - 1], [t + 0.45, k - 1]);
    atmos.density.push([t - 0.35, 0.014], [t + 0.45, 0.014]);
    atmos.warp.push([t - 0.35, 0], [t + 0.45, 0]);
    if (k < N) {
      const mid = t + 1.0;
      cam.roll.push([mid, k % 2 ? 0.22 : -0.22]);
      cam.fov.push([mid, 74]);
      atmos.density.push([mid, 0.024]);
      atmos.warp.push([mid, 1]);
    }
    objects[`Chapter${k}`] = {
      opacity: [[t - 0.6, 0], [t - 0.15, 1], [t + 0.45, 1], [t + 0.85, 0]],
      y: [[t - 0.6, 70], [t - 0.15, 0], [t + 0.45, 0], [t + 0.85, -70]],
      blur: [[t - 0.6, 14], [t - 0.15, 0], [t + 0.45, 0], [t + 0.85, 14]],
    };
  }
  // finale
  const end = stationTime(N);
  cam.z.push([LENGTH, stationZ(N) - 30]);
  cam.y.push([LENGTH, 4]);
  cam.fov.push([LENGTH, 64]);
  objects[`Chapter${N}`].opacity = [[end - 0.6, 0], [end - 0.15, 1], [LENGTH, 1]];
  objects[`Chapter${N}`].y = [[end - 0.6, 70], [end - 0.15, 0], [LENGTH, 0]];
  objects[`Chapter${N}`].blur = [[end - 0.6, 14], [end - 0.15, 0], [LENGTH, 0]];
  return objects;
}

export const PROJECT_STATE = buildProjectState(SHEET, LENGTH, buildKeyframes());
