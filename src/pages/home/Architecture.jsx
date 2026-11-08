import { createRef, useMemo, useRef } from "react";
import { ACCESS_LOG } from "../../data/profile";
import SectionHead from "./SectionHead";
import AnimatedBeam from "../../components/ui/AnimatedBeam";
import AnimatedList from "../../components/ui/AnimatedList";
import FlickeringGrid from "../../components/ui/FlickeringGrid";
import { cn } from "../../lib/cn";

const NODES = [
  { id: "web", col: 1, glyph: "◱", name: "Browser", sub: "React SPA" },
  { id: "mobile", col: 1, glyph: "▯", name: "Mobile", sub: "Flutter app" },
  { id: "nginx", col: 2, glyph: "⇄", name: "Nginx", sub: "TLS · reverse proxy", hot: true },
  { id: "auth", col: 3, glyph: "⚿", name: "Auth Gateway", sub: "Fastify · RS256 JWT" },
  { id: "api", col: 3, glyph: "λ", name: "API", sub: "Express · GraphQL", hot: true },
  { id: "redis", col: 4, glyph: "⚡", name: "Redis", sub: "cache · rate limit" },
  { id: "pg", col: 4, glyph: "⛁", name: "PostgreSQL", sub: "Prisma ORM" },
  { id: "mq", col: 4, glyph: "⇶", name: "RabbitMQ", sub: "job queue" },
  { id: "worker", col: 5, glyph: "⚙", name: "Workers", sub: "export · cron" },
  { id: "s3", col: 5, glyph: "☁", name: "AWS S3", sub: "PDF / Excel" },
];

const EDGES = [
  ["web", "nginx", 0], ["mobile", "nginx", 0.4], ["nginx", "auth", 0.8], ["nginx", "api", 1.1],
  ["auth", "redis", 1.5], ["api", "redis", 1.7], ["api", "pg", 1.9], ["api", "mq", 2.2],
  ["mq", "worker", 2.6], ["worker", "pg", 3.0, true], ["worker", "s3", 3.2],
];

function Node({ node, nodeRef }) {
  return (
    <div
      ref={nodeRef}
      className={cn(
        "relative z-10 flex w-full max-w-[150px] flex-col items-center gap-1 border bg-black px-2 py-2.5 text-center",
        node.hot ? "border-g shadow-[0_0_24px_#00ff4155]" : "border-line2 shadow-[0_0_12px_#00ff4122]",
      )}
    >
      <span className="text-xl leading-none text-g glow-text">{node.glyph}</span>
      <span className="text-[11px] font-semibold text-bright">{node.name}</span>
      <span className="text-[9px] text-tx2">{node.sub}</span>
    </div>
  );
}

/** Diagram arsitektur backend: request mengalir lewat AnimatedBeam (Magic UI). */
export default function Architecture() {
  const containerRef = useRef(null);
  const refs = useMemo(() => Object.fromEntries(NODES.map(n => [n.id, createRef()])), []);
  const cols = [1, 2, 3, 4, 5].map(c => NODES.filter(n => n.col === c));

  return (
    <section id="architecture" className="sec">
      <SectionHead label="// 03 — SYSTEM DESIGN" title="REQUEST" accent="LIFECYCLE" />
      <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
        <div ref={containerRef} className="relative overflow-hidden border border-line bg-d0 px-3 py-10 sm:px-6">
          <FlickeringGrid squareSize={3} gridGap={7} maxOpacity={0.18} flickerChance={0.2} />
          <div className="relative grid grid-cols-5 items-center gap-3 sm:gap-8">
            {cols.map((list, i) => (
              <div key={i} className="flex flex-col items-center justify-center gap-8 sm:gap-12">
                {list.map(n => <Node key={n.id} node={n} nodeRef={refs[n.id]} />)}
              </div>
            ))}
          </div>
          {EDGES.map(([a, b, delay, reverse]) => (
            <AnimatedBeam
              key={a + b}
              containerRef={containerRef}
              fromRef={refs[a]}
              toRef={refs[b]}
              delay={delay}
              duration={3.2}
              reverse={!!reverse}
              curvature={a === "nginx" ? (b === "auth" ? 40 : -40) : 0}
            />
          ))}
          <div className="absolute bottom-2 right-3 text-[8px] tracking-[2px] text-tx3">ANIMATED BEAM · {EDGES.length} EDGES · LIVE</div>
        </div>
        <div className="relative h-[360px] overflow-hidden border border-line bg-black p-3 xl:h-auto">
          <div className="mb-2 text-[9px] tracking-[3px] text-tx2">$ tail -f access.log</div>
          <AnimatedList delay={1400} max={7}>
            {ACCESS_LOG.map(l => (
              <div key={l.t} className="w-full border-l-2 bg-d1 px-2 py-1.5 text-[10px]" style={{ borderColor: `var(--${l.c})`, color: `var(--${l.c})` }}>
                {l.t}
              </div>
            ))}
          </AnimatedList>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black" />
        </div>
      </div>
    </section>
  );
}
