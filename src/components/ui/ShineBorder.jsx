import { cn } from "../../lib/cn";

/** Magic UI — ShineBorder: border yang berkilau berputar (radial-gradient + mask). Parent `relative`. */
export default function ShineBorder({ borderWidth = 1, duration = 12, shineColor = ["#00ff41", "#00f0ff", "#ffd400"], className }) {
  return (
    <div
      aria-hidden="true"
      style={{
        "--border-width": `${borderWidth}px`,
        "--shine-duration": `${duration}s`,
        backgroundImage: `radial-gradient(transparent, transparent, ${shineColor.join(",")}, transparent, transparent)`,
        backgroundSize: "300% 300%",
        mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
        WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
        WebkitMaskComposite: "xor",
        maskComposite: "exclude",
        padding: "var(--border-width)",
      }}
      className={cn("pointer-events-none absolute inset-0 size-full rounded-[inherit] animate-shine will-change-[background-position]", className)}
    />
  );
}
