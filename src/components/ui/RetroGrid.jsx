import { cn } from "../../lib/cn";

/** Magic UI — RetroGrid: lantai grid perspektif ala synthwave yang terus bergerak. */
export default function RetroGrid({ className, angle = 65, cellSize = 60, opacity = 0.55, lineColor = "rgba(0,255,65,.35)" }) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute size-full overflow-hidden [perspective:200px]", className)}
      style={{ "--grid-angle": `${angle}deg`, "--cell-size": `${cellSize}px`, opacity, "--line": lineColor }}
    >
      <div className="absolute inset-0 [transform:rotateX(var(--grid-angle))]">
        <div className="animate-retro-grid [background-image:linear-gradient(to_right,var(--line)_1px,transparent_0),linear-gradient(to_bottom,var(--line)_1px,transparent_0)] [background-repeat:repeat] [background-size:var(--cell-size)_var(--cell-size)] [height:300vh] [inset:0%_0px] [margin-left:-200%] [transform-origin:100%_0_0] [width:600vw]" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent to-90%" />
    </div>
  );
}
