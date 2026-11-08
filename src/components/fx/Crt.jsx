import { useFx } from "../../lib/fx-store";

/** Overlay CRT global (scanline, vignette, flicker, roll bar). */
export default function Crt() {
  const { crt } = useFx();
  if (!crt) return null;
  return <div className="crt" aria-hidden="true" style={{ viewTransitionName: "crt" }} />;
}
