import { prefersReducedMotion } from "./media";
import { ensureEngine } from "./particles";

// tsParticles confetti & fireworks — dimuat dinamis lewat ensureEngine() (urutan registrasi plugin aman).
const PHOSPHOR = ["#00ff41", "#39ff14", "#c2ffd3", "#00f0ff", "#ffd400"];

export async function confettiBurst(origin = { x: 0.5, y: 0.6 }) {
  if (prefersReducedMotion()) return;
  const { confetti } = await ensureEngine();
  const base = { colors: PHOSPHOR, origin, ticks: 220, gravity: 0.9, scalar: 1.05, shapes: ["square", "circle"] };
  await confetti("fx-confetti", { ...base, particleCount: 90, spread: 70, startVelocity: 48 });
  setTimeout(() => confetti("fx-confetti", { ...base, particleCount: 60, spread: 120, startVelocity: 32, decay: 0.92 }), 180);
}

let fw = null;
export async function fireworksShow(ms = 6500) {
  if (prefersReducedMotion()) return;
  const { fireworks } = await ensureEngine();
  fw?.stop?.();
  fw = await fireworks("fx-fireworks", {
    colors: PHOSPHOR,
    background: "transparent",
    sounds: false,
    rate: { min: 4, max: 9 },
    brightness: { min: 60, max: 90 },
  });
  const inst = fw;
  setTimeout(() => {
    inst?.stop?.();
    if (fw === inst) fw = null;
  }, ms);
}
