/**
 * Semua data konten portofolio ada di sini (satu sumber kebenaran).
 * Ubah data di file ini → seluruh halaman (home, htop, git-log, traceroute,
 * history, terminal, dst.) ikut berubah.
 *
 * ⚠️ Kontak di bawah masih memakai nilai dari versi lama situs. Ganti dengan
 * akun asli kamu (email, GitHub, LinkedIn, Telegram) sebelum dipublikasikan.
 */
export const PROFILE = {
  name: "Firmansyah Hadinata",
  handle: "Firman",
  role: "Backend Developer & Systems Engineer",
  host: "backend.dev",
  os: "Firman.OS",
  version: "v2.4.1-lts",
  location: { city: "Medan", country: "ID", lat: 3.5952, lng: 98.6722, tz: "Asia/Jakarta" },
  contact: {
    email: "Firman@backend.dev",
    github: "github.com/Firman-hadinata",
    linkedin: "linkedin.com/in/Firman-hadinata",
    telegram: "@Firman_backend",
  },
  stats: [
    { value: 4, suffix: "+", label: "Years shipping" },
    { value: 10, suffix: "+", label: "Projects deployed" },
    { value: 50, suffix: "k+", label: "Req/day served" },
    { value: 0, suffix: "", label: "Prod incidents (this month)" },
  ],
};

export const CONTACT_LINKS = [
  { key: "EMAIL", label: PROFILE.contact.email, href: `mailto:${PROFILE.contact.email}` },
  { key: "GITHUB", label: PROFILE.contact.github, href: `https://${PROFILE.contact.github}` },
  { key: "LINKEDIN", label: PROFILE.contact.linkedin, href: `https://${PROFILE.contact.linkedin}` },
  { key: "TELEGRAM", label: PROFILE.contact.telegram, href: `https://t.me/${PROFILE.contact.telegram.replace("@", "")}` },
];

export const SKILLS = [
  { id: "node.service", desc: "Node.js Runtime", ver: "v20.x LTS", up: "3y 214d", load: 92, pid: 1 },
  { id: "typescript.service", desc: "Type Safety Layer", ver: "5.x", up: "2y  80d", load: 90, pid: 2 },
  { id: "express.service", desc: "HTTP Server Framework", ver: "4.x", up: "3y  10d", load: 88, pid: 3 },
  { id: "prisma.service", desc: "ORM & Query Builder", ver: "5.x", up: "1y 300d", load: 85, pid: 4 },
  { id: "postgres.service", desc: "Relational Database", ver: "15.x", up: "2y 300d", load: 86, pid: 5 },
  { id: "redis.service", desc: "In-Memory Cache / Queue", ver: "7.x", up: "2y  45d", load: 83, pid: 6 },
  { id: "docker.service", desc: "Container Runtime", ver: "24.x", up: "2y 120d", load: 82, pid: 7 },
  { id: "graphql.service", desc: "Query Language API Layer", ver: "16.x", up: "1y 200d", load: 78, pid: 8 },
  { id: "kubernetes.service", desc: "Container Orchestration", ver: "1.28.x", up: "1y  50d", load: 70, pid: 9 },
  { id: "jest.service", desc: "Unit / Integration Testing", ver: "29.x", up: "2y  15d", load: 80, pid: 10 },
];

/** "3y 214d" → jumlah hari */
export const uptimeDays = up => {
  const m = /(\d+)y\s+(\d+)d/.exec(up);
  return m ? Number(m[1]) * 365 + Number(m[2]) : 0;
};

export const TOOLCHAIN = ["Git", "Linux", "Nginx", "AWS", "Vercel", "CI/CD", "Terraform", "Zod", "tRPC", "Nx", "pnpm", "Vite"];

export const PROJECTS = [
  {
    id: "a1b2c3d4", name: "PRPM_SYSTEM", image: "node:20-express-prisma",
    status: "Up 8 months", cpu: 18, mem: 42, restarts: 0,
    desc: "Academic research & community service proposal management. Multi-role architecture (admin, ketua_prpm, dosen, reviewer, mahasiswa) with JWT auth, PDF/Excel export, and reviewer workflows.",
    tags: ["Node.js", "TypeScript", "Prisma", "PostgreSQL", "React", "Redis"],
    port: "3000/tcp",
  },
  {
    id: "e5f6g7h8", name: "AUTH_GATEWAY", image: "node:20-fastify-jwt",
    status: "Up 2 years", cpu: 8, mem: 28, restarts: 2,
    desc: "High-performance auth gateway with RS256 JWT, refresh-token rotation, adaptive rate limiting, and OAuth2. Serves 50k+ req/day with sub-1ms auth overhead.",
    tags: ["Fastify", "JWT", "Redis", "TypeScript", "PostgreSQL"],
    port: "4000/tcp",
  },
  {
    id: "i9j0k1l2", name: "DIGITAL_ARCHIVE", image: "flutter:3.19-storage",
    status: "Up 1 year", cpu: 5, mem: 18, restarts: 1,
    desc: "Cross-platform mobile document manager. Android storage permission handling across SDK versions, FileProvider config, SQLite local persistence, offline-first architecture.",
    tags: ["Flutter", "Dart", "SQLite", "Android", "Provider"],
    port: "—",
  },
  {
    id: "m3n4o5p6", name: "STEGANOGRAPH", image: "cpp:17-bmp-lsb",
    status: "Up 4 months", cpu: 2, mem: 12, restarts: 0,
    desc: "C++ image steganography toolkit. BMP RLE8 decoder, 24-bit→8-bit quantization via Median Cut algorithm, LSB embedding with capacity analysis and detection-resistance metrics.",
    tags: ["C++17", "BMP", "Algorithms", "OpenCV"],
    port: "—",
  },
];

/** Riwayat kerja & pendidikan (dari `cat resume.txt` di terminal). */
export const RESUME = [
  { from: 2020, to: 2021, role: "Junior Developer", where: "Web Projects", stack: ["PHP", "JavaScript", "jQuery"], tone: "dim" },
  { from: 2021, to: 2022, role: "Full Stack Developer", where: "Internal Tools", stack: ["React", "Laravel", "MySQL"], tone: "c" },
  { from: 2022, to: null, role: "Backend Developer", where: "PRPM System", stack: ["Node.js", "Express", "Prisma", "React"], tone: "g" },
];
export const EDUCATION = { degree: "B.Sc. Computer Science", year: 2024 };

export const GRAPH_NODES = [
  { id: "Node.js", g: "runtime", lv: 92 }, { id: "TypeScript", g: "lang", lv: 90 },
  { id: "Express", g: "fw", lv: 88 }, { id: "Fastify", g: "fw", lv: 75 },
  { id: "PostgreSQL", g: "db", lv: 86 }, { id: "Redis", g: "cache", lv: 83 },
  { id: "Prisma", g: "orm", lv: 85 }, { id: "Docker", g: "infra", lv: 82 },
  { id: "Kubernetes", g: "infra", lv: 70 }, { id: "Nginx", g: "infra", lv: 78 },
  { id: "GraphQL", g: "api", lv: 78 }, { id: "REST", g: "api", lv: 95 },
  { id: "JWT", g: "auth", lv: 90 }, { id: "RabbitMQ", g: "mq", lv: 72 },
  { id: "Jest", g: "test", lv: 80 }, { id: "Linux", g: "infra", lv: 88 },
  { id: "Git", g: "infra", lv: 92 }, { id: "AWS", g: "cloud", lv: 74 },
];

export const GRAPH_LINKS = [
  ["Node.js", "TypeScript"], ["Node.js", "Express"], ["Node.js", "Fastify"],
  ["TypeScript", "Prisma"], ["Prisma", "PostgreSQL"], ["Node.js", "Redis"],
  ["Express", "JWT"], ["Express", "REST"], ["Node.js", "GraphQL"],
  ["Node.js", "RabbitMQ"], ["Docker", "Kubernetes"], ["Nginx", "Docker"],
  ["Node.js", "Jest"], ["Docker", "AWS"], ["Linux", "Docker"],
  ["Linux", "Nginx"], ["Git", "Docker"], ["JWT", "GraphQL"], ["Fastify", "JWT"],
];

/** Warna grup graph — disesuaikan ke palet fosfor neon. */
export const G_COLORS = {
  runtime: "#00ff41", lang: "#00f0ff", fw: "#39ff14", db: "#ffb000",
  cache: "#ff3b3b", orm: "#b26bff", infra: "#7dffb0", api: "#c2ffd3",
  auth: "#ff8a3d", mq: "#ff5fa2", test: "#a0ffc8", cloud: "#4dd2ff",
};

export const GRAPH_GROUPS = [
  ["runtime", "Runtime"], ["lang", "Language"], ["fw", "Framework"], ["db", "Database"], ["cache", "Cache"],
  ["infra", "Infra"], ["api", "API"], ["auth", "Auth"], ["mq", "Messaging"], ["test", "Testing"], ["cloud", "Cloud"],
];

export const BOOT_LINES = [
  { t: 280, cls: "prompt", text: "$ ssh Firman@backend.dev -i ~/.ssh/id_ed25519" },
  { t: 700, cls: "info", text: "Resolving backend.dev... 203.0.113.42" },
  { t: 1050, cls: "info", text: "Establishing secure channel (ED25519)..." },
  { t: 1400, cls: "ok", text: "✓ Host authenticity verified. Connection established." },
  { t: 1750, cls: "dim", text: "───────────────────────────────────────────────────────" },
  { t: 2100, cls: "bright", text: "  Welcome to Firman.OS  v2.4.1-lts  (GNU/Linux 6.6.0)" },
  { t: 2400, cls: "dim", text: "  System information as of Fri Jun  5 12:42:11 UTC 2026" },
  { t: 2700, cls: "dim", text: "  Uptime: 4 years  ·  Load avg: 0.18 0.22 0.19" },
  { t: 3000, cls: "dim", text: "  Running processes: 24  ·  Active services: 10" },
  { t: 3300, cls: "dim", text: "───────────────────────────────────────────────────────" },
  { t: 3550, cls: "ok", text: "  System ready. All services nominal." },
];

export const PROCS = [
  { pid: 1, name: "node.js", cpu: 18.2, mem: 42.1, user: "Firman" },
  { pid: 2, name: "typescript", cpu: 12.4, mem: 28.3, user: "Firman" },
  { pid: 3, name: "postgresql", cpu: 8.1, mem: 15.7, user: "postgres" },
  { pid: 4, name: "redis-server", cpu: 3.2, mem: 8.4, user: "redis" },
  { pid: 5, name: "nginx", cpu: 1.8, mem: 4.2, user: "www" },
  { pid: 6, name: "docker", cpu: 5.6, mem: 12.0, user: "Firman" },
];

export const ACCESS_LOG = [
  { c: "g", t: "GET /api/proposals 200 12ms" }, { c: "g", t: "POST /api/auth/refresh 200 3ms" },
  { c: "a", t: "WARN: Redis cache miss key=user:42" }, { c: "g", t: "PUT /api/proposals/17 200 28ms" },
  { c: "c", t: "DB: query executed 8ms (idx)" }, { c: "g", t: "GET /api/users/me 200 6ms" },
  { c: "a", t: "RATE_LIMIT: 94/100 req/min" }, { c: "g", t: "DELETE /api/tokens/old 200" },
  { c: "c", t: "CRON: cleanup sessions +0ms" }, { c: "g", t: "GET /api/reports/export 200" },
];

export const TICKER = ["AVAILABLE_FOR_HIRE", "BACKEND_DEVELOPER", "NODE_JS_SPECIALIST", "API_ARCHITECT", "DISTRIBUTED_SYSTEMS", "TYPESCRIPT_FIRST", "DATABASE_WHISPERER", "DOCKER_NATIVE", "OPEN_SOURCE"];
