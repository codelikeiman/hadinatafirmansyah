import { motion } from "motion/react";
import { PROJECTS } from "../../data/profile";
import PageTitle from "../../components/fx/PageTitle";
import Timeline from "../../components/ui/Timeline";
import BorderBeam from "../../components/ui/BorderBeam";

const COMMITS = {
  PRPM_SYSTEM: ["feat(review): multi-reviewer scoring workflow", "perf(db): composite index on proposals(status, year)", "feat(export): PDF & Excel report pipeline"],
  AUTH_GATEWAY: ["feat(jwt): RS256 key rotation", "feat(ratelimit): adaptive sliding window", "fix(oauth2): PKCE verifier length"],
  DIGITAL_ARCHIVE: ["fix(android): scoped storage on SDK 33+", "feat(sync): offline-first SQLite queue", "chore(ci): flutter build matrix"],
  STEGANOGRAPH: ["feat(bmp): RLE8 decoder", "feat(quant): median-cut 24→8 bit", "test(lsb): capacity & detection metrics"],
};

function Meter({ label, value, color }) {
  return (
    <div className="flex items-center gap-2 text-[11px]">
      <span className="w-10 text-tx2">{label}</span>
      <div className="h-1.5 flex-1 bg-d3">
        <motion.div className="h-full" style={{ background: color, boxShadow: `0 0 8px ${color}` }} initial={{ width: 0 }} whileInView={{ width: `${Math.min(100, value * 2)}%` }} viewport={{ once: true }} transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }} />
      </div>
      <span className="w-10 text-right text-bright">{value}%</span>
    </div>
  );
}

export default function GitLog() {
  const data = PROJECTS.map(p => ({
    title: p.name,
    content: (
      <div className="fx-card relative overflow-hidden">
        <BorderBeam size={90} duration={9} />
        <div><span className="gl-g">*</span> <span className="gl-h">commit {p.id}</span> <em className="text-c">(HEAD → {p.name.toLowerCase()})</em></div>
        <div className="mt-1 text-[12px] text-tx2">image <span className="text-b">{p.image}</span> · {p.status} · port {p.port} · restarts {p.restarts}</div>
        <p className="!my-3 text-[13px]">{p.desc}</p>
        <div className="mb-3 space-y-1.5">
          <Meter label="cpu" value={p.cpu} color="#ffb000" />
          <Meter label="mem" value={p.mem} color="#00f0ff" />
        </div>
        <div className="border-l border-line2 pl-3 text-[12px]">
          {(COMMITS[p.name] ?? []).map((c, i) => (
            <motion.div key={c} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}>
              <span className="text-amber">●</span> <span className="text-tx">{c}</span>
            </motion.div>
          ))}
        </div>
        <div className="mt-3">{p.tags.map(t => <span key={t} className="tag">[{t}]</span>)}</div>
      </div>
    ),
  }));

  return (
    <div className="pg">
      <PageTitle text="git log --graph" sub="Riwayat proyek. Beam di kiri tumbuh mengikuti scroll (Motion useScroll + useTransform)." />
      <Timeline data={data} />
    </div>
  );
}
