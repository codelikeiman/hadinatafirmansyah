import { useState, useSyncExternalStore } from "react";
import { motion } from "motion/react";
import { PROFILE, PROJECTS, SKILLS } from "../../data/profile";
import { ROUTES } from "../../app/routes";
import PageTitle from "../../components/fx/PageTitle";
import MagicCard from "../../components/ui/MagicCard";
import BorderBeam from "../../components/ui/BorderBeam";
import NumberTicker from "../../components/ui/NumberTicker";
import { rise } from "../../lib/motion-presets";
import { detectBrowser, detectCores, detectGpu } from "../../lib/device";

const TUX = String.raw`        .--.
       |o_o |
       |:_/ |
      //   \ \
     (|     | )
    /'\_   _/'\
    \___)=(___/`;

const SWATCHES = ["#000", "#00ff41", "#39ff14", "#00f0ff", "#ffd400", "#ff003c", "#b26bff", "#c2ffd3"];

const subscribeResize = cb => { addEventListener("resize", cb); return () => removeEventListener("resize", cb); };
const getSize = () => `${innerWidth}x${innerHeight}`;

export default function Neofetch() {
  const [sys] = useState(() => ({ gpu: detectGpu(), browser: detectBrowser(), cores: detectCores(), tz: Intl.DateTimeFormat().resolvedOptions().timeZone }));
  const resolution = useSyncExternalStore(subscribeResize, getSize, () => "?");

  const rows = [
    ["OS", `${PROFILE.os} ${PROFILE.version.replace("v", "")} x86_64`],
    ["Host", `porto.vite.app (${PROFILE.location.city}, ${PROFILE.location.country})`],
    ["Kernel", "React 19 · Vite 8 · Motion 13 · Three r187"],
    ["Uptime", SKILLS[0].up],
    ["Shell", "zsh 5.9 + tmux (ctrl+b n/p)"],
    ["Services", `${SKILLS.length} running`],
    ["Containers", `${PROJECTS.length} deployed`],
    ["Windows", `${ROUTES.length} tmux windows`],
    ["Resolution", resolution],
    ["Terminal", sys.browser],
    ["CPU", `${sys.cores} logical cores (navigator)`],
    ["GPU", sys.gpu],
    ["Locale", `${navigator.language} · ${sys.tz}`],
    ["Theme", "phosphor-green [tty1]"],
  ];

  return (
    <div className="pg">
      <PageTitle text="neofetch" sub="Spesifikasi sistem — sebagian dibaca langsung dari perangkat kamu (GPU, browser, core, resolusi)." />
      <div className="nf">
        <MagicCard className="p-6">
          <BorderBeam size={140} duration={7} />
          <motion.pre
            initial={{ opacity: 0, scale: 0.7, rotate: -8 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            whileHover={{ scale: 1.08, rotate: 2 }}
            transition={{ type: "spring", stiffness: 180 }}
          >
            {TUX}
          </motion.pre>
          <div className="mt-6 grid grid-cols-2 gap-4 text-center">
            <div><div className="text-2xl font-bold text-g glow-text"><NumberTicker value={2847} /></div><div className="text-[10px] tracking-widest text-tx2">PACKAGES</div></div>
            <div><div className="text-2xl font-bold text-b"><NumberTicker value={99.9} decimalPlaces={1} suffix="%" /></div><div className="text-[10px] tracking-widest text-tx2">UPTIME SLA</div></div>
          </div>
        </MagicCard>
        <dl>
          <motion.div {...rise(0)}><span className="ps1">{PROFILE.handle.toLowerCase()}@porto</span></motion.div>
          <motion.div {...rise(1)}>{"-".repeat(22)}</motion.div>
          {rows.map(([k, v], i) => (
            <motion.div key={k} {...rise(i + 2)}><dt>{k}</dt><dd>{v}</dd></motion.div>
          ))}
          <motion.div {...rise(rows.length + 2)} style={{ marginTop: 14 }}>
            {SWATCHES.map((c, i) => (
              <motion.i
                key={c}
                className="sw"
                style={{ background: c, boxShadow: `0 0 12px ${c}` }}
                whileHover={{ y: -10, scaleY: 1.7 }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 1 + i * 0.05 }}
              />
            ))}
          </motion.div>
        </dl>
      </div>
    </div>
  );
}
