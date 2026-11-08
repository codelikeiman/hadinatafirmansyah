import { motion } from "motion/react";
import { EDUCATION, PROFILE, RESUME, SKILLS } from "../../data/profile";
import { ROUTES } from "../../app/routes";
import PageTitle from "../../components/fx/PageTitle";
import TracingBeam from "../../components/ui/TracingBeam";
import TextGenerateEffect from "../../components/ui/TextGenerateEffect";
import Link from "../../app/Link";

const svc = SKILLS.map(s => s.id.replace(".service", ""));

const OPTIONS = [
  ["--backend", "Rancang REST/GraphQL API, skema database, dan antrean job yang tahan beban."],
  ["--ship", "Kontainerisasi dengan Docker, orkestrasi Kubernetes, CI/CD sampai produksi."],
  ["--debug", "Profiling query PostgreSQL, tuning cache Redis, membaca flamegraph."],
  ["--coffee", "Wajib. Tanpa flag ini proses berjalan 40% lebih lambat."],
];

function Section({ title, children, i }) {
  return (
    <motion.section initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ delay: i * 0.05, duration: 0.5 }}>
      <h2>{title}</h2>
      {children}
    </motion.section>
  );
}

export default function Man() {
  return (
    <div className="pg man">
      <PageTitle text="man firman" />
      <div className="mb-6 flex justify-between text-[12px] text-tx2"><span>FIRMAN(1)</span><span>User Commands</span><span>FIRMAN(1)</span></div>
      <TracingBeam>
        <Section title="NAME" i={0}><p>firman — {PROFILE.role.toLowerCase()}; builds backends and ships them in containers</p></Section>
        <Section title="SYNOPSIS" i={1}><p><b className="text-bright">firman</b> [--backend] [--ship] [--debug] [--coffee] [<i>project</i>...]</p></Section>
        <Section title="DESCRIPTION" i={2}>
          <TextGenerateEffect
            className="ml-8 max-w-[75ch] leading-7 max-md:ml-3.5"
            words={`${PROFILE.name} adalah backend developer di ${PROFILE.location.city}, Indonesia. Fokus pada desain API, tuning query database, dan menjaga sistem tetap hidup saat beban nyata datang. TypeScript-first, container-native, terobsesi dengan correctness. Bekerja dengan ${svc.slice(0, 6).join(", ")}, dan lainnya.`}
          />
        </Section>
        <Section title="OPTIONS" i={3}>
          {OPTIONS.map(([flag, text]) => (
            <div key={flag} className="mb-3 ml-8 max-md:ml-3.5"><b className="text-c">{flag}</b><p className="!ml-6 text-tx2">{text}</p></div>
          ))}
        </Section>
        <Section title="HISTORY" i={4}>
          {RESUME.map(r => (
            <p key={r.role}><span className="text-amber">{r.from}–{r.to ?? "now"}</span> {r.role} · {r.where} <span className="text-tx2">({r.stack.join(" · ")})</span></p>
          ))}
          <p><span className="text-amber">{EDUCATION.year}</span> {EDUCATION.degree}</p>
        </Section>
        <Section title="SERVICES" i={5}><p>{svc.join(", ")}</p></Section>
        <Section title="FILES" i={6}>
          <p><b>~/.config/firman/stack.toml</b> — konfigurasi stack default</p>
          <p><b>/var/log/firman/deploy.log</b> — 0 rollback bulan ini</p>
        </Section>
        <Section title="BUGS" i={7}><p>Kadang menulis test sebelum kodenya ada. Sudah dilaporkan sebagai fitur.</p></Section>
        <Section title="SEE ALSO" i={8}>
          <p className="flex flex-wrap gap-x-3 gap-y-1">
            {ROUTES.filter(r => r.path !== "/man").map(r => (
              <Link key={r.path} to={r.path} className="text-b underline decoration-dotted underline-offset-4 hover:text-g">{r.name.split(" ")[0]}(1)</Link>
            ))}
          </p>
        </Section>
      </TracingBeam>
    </div>
  );
}
