import { useId, useMemo } from "react";
import Particles, { ParticlesProvider } from "@tsparticles/react";
import { initParticles } from "../../lib/particles";
import { prefersReducedMotion } from "../../lib/media";
import { cn } from "../../lib/cn";

/** Aceternity — SparklesCore (ditenagai tsParticles v4): debu bintang yang berkelip. */
export default function Sparkles({ className, background = "transparent", minSize = 0.4, maxSize = 1.4, speed = 2, particleColor = "#c2ffd3", particleDensity = 900 }) {
  const id = useId().replace(/:/g, "");
  const options = useMemo(() => ({
    background: { color: { value: background } },
    fullScreen: { enable: false, zIndex: 1 },
    fpsLimit: 60,
    pauseOnOutsideViewport: true,
    detectRetina: true,
    particles: {
      number: { value: particleDensity, density: { enable: true, width: 400, height: 400 } },
      paint: { fill: { enable: true, color: { value: particleColor } } },
      shape: { type: "circle" },
      size: { value: { min: minSize, max: maxSize } },
      opacity: { value: { min: 0.1, max: 1 }, animation: { enable: !prefersReducedMotion(), speed, sync: false, startValue: "random", destroy: "none" } },
      move: { enable: !prefersReducedMotion(), speed: { min: 0.1, max: 1 }, direction: "none", outModes: { default: "out" } },
    },
    interactivity: { events: { onClick: { enable: true, mode: "push" }, onHover: { enable: false } }, modes: { push: { quantity: 4 } } },
  }), [background, minSize, maxSize, speed, particleColor, particleDensity]);

  return (
    <div className={cn("relative size-full", className)}>
      <ParticlesProvider init={initParticles}>
        <Particles id={`sparkles-${id}`} className="size-full" options={options} />
      </ParticlesProvider>
    </div>
  );
}
