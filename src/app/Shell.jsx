import { Suspense, useEffect } from "react";
import { motion } from "motion/react";
import { useRouter } from "./router-context";
import ErrorBoundary from "./ErrorBoundary";
import PageLoader from "./PageLoader";
import { useGlobalHotkeys } from "./useGlobalHotkeys";
import { useGlobalTilt } from "../lib/useGlobalTilt";
import { useIdle } from "../lib/useIdle";
import { ROUTES, prefetchRoute } from "./routes";
import { supportsViewTransitions } from "../lib/media";
import SmoothScroll from "../components/shell/SmoothScroll";
import Palette from "../components/shell/Palette";
import Tmux from "../components/shell/Tmux";
import Cursor from "../components/fx/Cursor";
import Crt from "../components/fx/Crt";
import MatrixRain from "../components/fx/MatrixRain";

const VT = supportsViewTransitions();

export default function Shell() {
  const { path, route } = useRouter();
  const Page = route.page.Page;
  useGlobalTilt();
  useGlobalHotkeys();
  const idle = useIdle(4000);

  // setelah idle: prefetch chunk halaman "core" yang ringan (halaman lab yang berat tetap on-hover)
  useEffect(() => {
    if (!idle || navigator.connection?.saveData) return;
    ROUTES.filter(r => r.group === "core").forEach(r => prefetchRoute(r.path));
  }, [idle]);

  return (
    <SmoothScroll>
      {path !== "/" && <MatrixRain />}
      {/* tanpa View Transitions API → fallback fade Motion biasa */}
      <motion.main
        key={path}
        id="page"
        className="page-root"
        initial={VT ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        <ErrorBoundary key={path}>
          <Suspense fallback={<PageLoader label={`loading ${route.name}`} />}>
            <Page />
          </Suspense>
        </ErrorBoundary>
      </motion.main>
      <motion.div
        key={"wipe" + path}
        className="wipe"
        aria-hidden="true"
        initial={{ y: "-100%" }}
        animate={{ y: "110%" }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      />
      <div id="fx-confetti" className="fx-layer" />
      <div id="fx-fireworks" className="fx-layer" />
      <Crt />
      <Palette />
      <Tmux />
      <Cursor />
    </SmoothScroll>
  );
}
