// Output perintah statis terminal (dipindah dari App.jsx lama).
// Markup warna: \x1b[g]teks\x1b[/g]  (g=hijau c=cyan a=amber r=merah b=bold d=dim)
// Perintah dinamis (cd, pages, confetti, dst.) ada di pages/home/Terminal.jsx.
export const TERM_COMMANDS = {
  help: () => `\x1b[g]Available commands:\x1b[/g]
  whoami         → developer profile
  ls             → list directory
  cat resume.txt → work experience
  skills         → loaded service units
  projects       → running containers
  contact        → transmission channels
  hire           → initiate engagement
  ping           → test latency
  neofetch       → system information
  pages          → list every page (alias: ls /)
  cd <page>      → open a page, e.g. \x1b[c]cd glxgears\x1b[/c]
  confetti       → celebrate
  fireworks      → celebrate harder
  matrix         → toggle matrix rain
  palette        → command palette (ctrl+k)
  clear          → clear terminal
  \x1b[d]Tip: ↑/↓ history · Tab completion · never run sudo rm -rf /\x1b[/d]`,

  whoami: () => `\x1b[b]Firman_hadinata\x1b[/b] — backend developer & systems engineer
Specialization: \x1b[c]distributed systems\x1b[/c], \x1b[c]API design\x1b[/c], \x1b[c]data pipelines\x1b[/c]
Languages: TypeScript · C++ · Dart · SQL`,

  ls: () => `-rw-r--r--  1 Firman dev   4.2K Jun  5 12:00 \x1b[b]resume.txt\x1b[/b]
-rw-r--r--  1 Firman dev  12.8K Jun  5 11:45 \x1b[b]projects.json\x1b[/b]
-rwxr-xr-x  1 Firman dev   2.1K Jun  5 10:30 \x1b[g]deploy.sh\x1b[/g]
drwxr-xr-x  8 Firman dev   4.0K Jun  5 09:00 \x1b[c]node_modules/\x1b[/c]
-rw-------  1 Firman dev     64 May 15 08:00 .env
-rw-r--r--  1 Firman dev    128 Apr 20 14:22 .gitignore`,

  "cat resume.txt": () => `\x1b[b]WORK EXPERIENCE\x1b[/b]
─────────────────────────────────────────────────
2022 – Present  \x1b[g]Backend Developer\x1b[/g]
                PRPM System — Node.js · Express · Prisma · React

2021 – 2022     \x1b[c]Full Stack Developer\x1b[/c]
                Internal Tools — React · Laravel · MySQL

2020 – 2021     Junior Developer
                Web Projects — PHP · JavaScript · jQuery
─────────────────────────────────────────────────
\x1b[b]EDUCATION\x1b[/b]
B.Sc. Computer Science — 2024`,

  skills: () => `\x1b[g]● \x1b[/g]node.service        \x1b[g]active (running)\x1b[/g] since 3y 214d
\x1b[g]● \x1b[/g]typescript.service  \x1b[g]active (running)\x1b[/g] since 2y  80d
\x1b[g]● \x1b[/g]express.service     \x1b[g]active (running)\x1b[/g] since 3y  10d
\x1b[g]● \x1b[/g]prisma.service      \x1b[g]active (running)\x1b[/g] since 1y 300d
\x1b[g]● \x1b[/g]postgres.service    \x1b[g]active (running)\x1b[/g] since 2y 300d
\x1b[g]● \x1b[/g]redis.service       \x1b[g]active (running)\x1b[/g] since 2y  45d
\x1b[g]● \x1b[/g]docker.service      \x1b[g]active (running)\x1b[/g] since 2y 120d
─────────────────────────────────────────
\x1b[b]10 loaded, 10 active, 0 failed\x1b[/b]`,

  projects: () => `\x1b[b]CONTAINER ID   IMAGE                   STATUS        NAME\x1b[/b]
a1b2c3d4       node:20-express-prisma  Up 8 months   \x1b[g]PRPM_SYSTEM\x1b[/g]
e5f6g7h8       node:20-fastify-jwt     Up 2 years    \x1b[g]AUTH_GATEWAY\x1b[/g]
i9j0k1l2       flutter:3.19-storage    Up 1 year     \x1b[g]DIGITAL_ARCHIVE\x1b[/g]
m3n4o5p6       cpp:17-bmp-lsb          Up 4 months   \x1b[g]STEGANOGRAPH\x1b[/g]`,

  contact: () => `\x1b[b]TRANSMISSION CHANNELS\x1b[/b]
  \x1b[c]email\x1b[/c]    →  Firman@backend.dev
  \x1b[c]github\x1b[/c]   →  github.com/Firman-hadinata
  \x1b[c]linkedin\x1b[/c] →  linkedin.com/in/Firman-hadinata
  \x1b[c]telegram\x1b[/c] →  @Firman_backend`,

  hire: () => `\x1b[b]INITIATING ENGAGEMENT SEQUENCE\x1b[/b]
─────────────────────────────────
  checking portfolio...   \x1b[g]✓ PASS\x1b[/g]
  verifying skills...     \x1b[g]✓ PASS\x1b[/g]
  reviewing experience... \x1b[g]✓ PASS\x1b[/g]
  checking availability... \x1b[g]✓ AVAILABLE\x1b[/g]
─────────────────────────────────
\x1b[g]→ Send an email to Firman@backend.dev\x1b[/g]
  Let's build something great together.`,

  ping: () => `PING backend.dev (203.0.113.42): 56 data bytes
64 bytes from 203.0.113.42: icmp_seq=0 ttl=64 time=\x1b[g]0.412 ms\x1b[/g]
64 bytes from 203.0.113.42: icmp_seq=1 ttl=64 time=\x1b[g]0.389 ms\x1b[/g]
64 bytes from 203.0.113.42: icmp_seq=2 ttl=64 time=\x1b[g]0.401 ms\x1b[/g]
64 bytes from 203.0.113.42: icmp_seq=3 ttl=64 time=\x1b[g]0.395 ms\x1b[/g]
— backend.dev ping statistics —
4 packets transmitted, 4 received, \x1b[g]0% packet loss\x1b[/g]
round-trip min/avg/max = 0.389/0.399/0.412 ms`,

  neofetch: () => `\x1b[g]██████████████\x1b[/g]          Firman@backend.dev
\x1b[g]████████████████████\x1b[/g]    ─────────────────────
\x1b[g]██████\x1b[/g]\x1b[b]  Firman.OS  \x1b[/b]\x1b[g]██████\x1b[/g]    OS: Firman.OS v2.4.1-lts
\x1b[g]████████████████████\x1b[/g]    Kernel: Linux 6.6.0
\x1b[g]████████████████████\x1b[/g]    Uptime: 4 years
\x1b[g]██████████████\x1b[/g]          Shell: bash 5.2.15
                         Runtime: Node.js 20.x LTS
                         Packages: 2,847 (npm)
                         CPU: Ryzen 9 5900X @ 3.7GHz
                         Memory: 16GB / 32GB DDR5
                         Languages: TS · C++ · Dart · SQL
                         Editor: Neovim`,

  sudo: () => `\x1b[r][sudo] password for Firman:\x1b[/r]
Firman is not in the sudoers file. This incident will be reported.`,

  vim: () => `\x1b[r]You are now stuck in vim.\x1b[/r]
Press :q! to exit. Good luck.
(just kidding — type 'clear' to reset)`,

  "git log": () => `\x1b[a]commit f3a2d19\x1b[/a] (HEAD -> main, origin/main)
Author: Firmansyah Hadinata <Firman@backend.dev>
Date:   Thu Jun  5 12:00:00 2026

    feat: add interactive terminal to portfolio

\x1b[a]commit 9b1c4e7\x1b[/a]
Author: Firmansyah Hadinata <Firman@backend.dev>
Date:   Wed Jun  4 20:15:00 2026

    perf: optimize PostgreSQL query plans, -40% latency`,
};
