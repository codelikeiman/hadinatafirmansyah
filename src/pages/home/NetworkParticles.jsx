import { useMemo } from "react";
import Particles, { ParticlesProvider } from "@tsparticles/react";
import { initParticles } from "../../lib/particles";
import { prefersReducedMotion } from "../../lib/media";

/** Latar jaringan node (tsParticles v4): link antar partikel, kursor menolak, klik menambah node. */
export default function NetworkParticles() {
  const options = useMemo(() => {
    const still = prefersReducedMotion();
    return {
      fullScreen: { enable: true, zIndex: 0 },
      background: { color: { value: "transparent" } },
      fpsLimit: 45,
      detectRetina: false, // garis 0.6px tetap tajam; hemat 4-9x piksel di layar DPR tinggi
      pauseOnBlur: true,
      particles: {
        number: { value: 60, density: { enable: true, width: 1400, height: 900 } },
        paint: { fill: { enable: true, color: { value: ["#00ff41", "#00f0ff", "#c2ffd3"] } } },
        shape: { type: "circle" },
        opacity: { value: { min: 0.15, max: 0.45 } },
        size: { value: { min: 0.6, max: 1.8 } },
        links: { enable: true, distance: 130, color: "#14802f", opacity: 0.35, width: 0.6 },
        move: { enable: !still, speed: 0.35, direction: "none", outModes: { default: "bounce" } },
      },
      interactivity: {
        detectsOn: "window",
        events: { onHover: { enable: !still, mode: ["repulse", "grab"] }, onClick: { enable: true, mode: "push" } },
        modes: { repulse: { distance: 110, duration: 0.6 }, grab: { distance: 160, links: { opacity: 0.5, color: "#00ff41" } }, push: { quantity: 3 } },
      },
    };
  }, []);

  return (
    <ParticlesProvider init={initParticles}>
      <Particles id="home-network" options={options} />
    </ParticlesProvider>
  );
}
