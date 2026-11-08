import { lazyPage } from "./lazyPage";

/**
 * Tabel route tunggal: dipakai router, tmux bar, command palette, dock,
 * terminal (`cd <page>`), dan prefetch. Setiap halaman di-split jadi chunk
 * sendiri dan baru diunduh saat dibuka (atau saat link-nya di-hover).
 *
 * group: "core" = halaman portofolio, "lab" = halaman eksperimen visual.
 */
export const ROUTES = [
  {
    path: "/", name: "home", cmd: "startx", glyph: "⌂", group: "core",
    desc: "boot the full portfolio",
    page: lazyPage(() => import("../pages/home/Home.jsx")),
  },
  {
    path: "/neofetch", name: "neofetch", cmd: "neofetch", glyph: "◉", group: "core",
    desc: "system info",
    page: lazyPage(() => import("../pages/neofetch/Neofetch.jsx")),
  },
  {
    path: "/htop", name: "htop", cmd: "htop", glyph: "▤", group: "core",
    desc: "live skills monitor",
    page: lazyPage(() => import("../pages/htop/Htop.jsx")),
  },
  {
    path: "/git-log", name: "git log", cmd: "git log --graph", glyph: "⑂", group: "core",
    desc: "project history",
    page: lazyPage(() => import("../pages/gitlog/GitLog.jsx")),
  },
  {
    path: "/man", name: "man firman", cmd: "man firman", glyph: "§", group: "core",
    desc: "manual page",
    page: lazyPage(() => import("../pages/man/Man.jsx")),
  },
  {
    path: "/scan", name: "nmap", cmd: "nmap -sV", glyph: "⌖", group: "core",
    desc: "scan the target",
    page: lazyPage(() => import("../pages/scan/Scan.jsx")),
  },
  {
    path: "/glxgears", name: "glxgears", cmd: "glxgears --webgpu", glyph: "✹", group: "lab",
    desc: "three.js WebGPU · TSL reactor core", badge: "WEBGPU",
    page: lazyPage(() => import("../pages/glxgears/Glxgears.jsx")),
  },
  {
    path: "/traceroute", name: "traceroute", cmd: "traceroute backend.dev", glyph: "◍", group: "lab",
    desc: "cobe globe · live packet routes", badge: "GLOBE",
    page: lazyPage(() => import("../pages/traceroute/Traceroute.jsx")),
  },
  {
    path: "/sandbox", name: "sandbox", cmd: "docker run --physics", glyph: "⬢", group: "lab",
    desc: "matter.js + rapier physics playground", badge: "PHYSICS",
    page: lazyPage(() => import("../pages/sandbox/Sandbox.jsx")),
  },
  {
    path: "/history", name: "history", cmd: "history | cinema", glyph: "⏵", group: "lab",
    desc: "theatre.js cinematic career log", badge: "CINEMA",
    page: lazyPage(() => import("../pages/history/History.jsx")),
  },
  {
    path: "/lab", name: "motion lab", cmd: "./motion-lab", glyph: "∿", group: "lab",
    desc: "rive · dotlottie · anime.js · motion", badge: "MOTION",
    page: lazyPage(() => import("../pages/lab/Lab.jsx")),
  },
  {
    path: "/holo", name: "holo", cmd: "holo --project", glyph: "◈", group: "lab",
    desc: "spline 3D + unicorn studio scenes", badge: "3D",
    page: lazyPage(() => import("../pages/holo/Holo.jsx")),
  },
  {
    path: "/ui", name: "ui kit", cmd: "ls /usr/share/ui", glyph: "▦", group: "lab",
    desc: "magic ui × aceternity component kit", badge: "UI",
    page: lazyPage(() => import("../pages/uikit/UiKit.jsx")),
  },
];

export const PANIC_ROUTE = {
  path: "/panic", name: "kernel panic", cmd: "sudo rm -rf /", glyph: "☠", group: "hidden",
  desc: "something went terribly wrong",
  page: lazyPage(() => import("../pages/panic/Panic.jsx")),
};

const byPath = new Map(ROUTES.map(r => [r.path, r]));

/** Route untuk path tertentu; path tak dikenal → kernel panic (404). */
export const findRoute = path => byPath.get(path) ?? PANIC_ROUTE;

export const isKnownPath = path => byPath.has(path) || path === PANIC_ROUTE.path;

/** Unduh chunk halaman lebih awal (hover/focus pada link). */
export const prefetchRoute = path => findRoute(path).page.preload().catch(() => {});

/** Cari route dari nama/cmd/path yang diketik user di terminal / palette. */
export function resolveRouteQuery(q) {
  const s = q.trim().toLowerCase().replace(/^\/+/, "").replace(/^#\/?/, "");
  if (!s || s === "~" || s === "home") return byPath.get("/");
  return ROUTES.find(r => r.path.slice(1) === s || r.name === s || r.cmd.split(" ")[0] === s) ?? null;
}
