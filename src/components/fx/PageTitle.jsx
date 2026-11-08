import Scramble from "./Scramble";
import { cn } from "../../lib/cn";

/**
 * Judul halaman standar. `view-transition-name: page-title` membuat judul
 * "morph" (posisi, ukuran, isi) dari halaman lama ke halaman baru.
 */
export default function PageTitle({ text, className, sub }) {
  return (
    <header className={cn("mb-7", className)}>
      <h1 className="page-h1" style={{ viewTransitionName: "page-title" }}>
        <Scramble text={text} />
      </h1>
      {sub && <p className="mt-2 max-w-[70ch] text-[13px] leading-relaxed text-tx2">{sub}</p>}
    </header>
  );
}
