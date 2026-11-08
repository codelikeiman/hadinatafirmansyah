import { CONTACT_LINKS, PROFILE } from "../../data/profile";
import TextHoverEffect from "../../components/ui/TextHoverEffect";

const YEAR = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="relative border-t border-line">
      <div className="mx-auto h-[22vw] max-h-[260px] min-h-[120px] w-full px-4">
        <TextHoverEffect text="FIRMAN.OS" />
      </div>
      <div className="footer">
        <span className="ft-txt">{PROFILE.os} {PROFILE.version} © {YEAR} — ALL SYSTEMS NOMINAL</span>
        <div className="ft-links">
          {CONTACT_LINKS.map(l => (
            <a key={l.key} href={l.href} target={l.key === "EMAIL" ? undefined : "_blank"} rel="noreferrer noopener" className="ft-lnk">{l.key === "EMAIL" ? "MAIL" : l.key.slice(0, 2)}</a>
          ))}
        </div>
        <span className="ft-txt">BUILT WITH <span className="text-g">◆</span> CAFFEINE · VITE 8 · REACT 19</span>
      </div>
    </footer>
  );
}
