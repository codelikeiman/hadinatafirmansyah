import { memo, useEffect, useRef, useState } from "react";

/**
 * Potret ASCII berwarna (140×64 karakter) digambar ke canvas. JSON 176KB-nya
 * di-import dinamis → tidak ikut bundle awal.
 */
function AsciiArt({ visible }) {
  const ref = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([import("../../data/ascii-portrait.json"), document.fonts?.ready ?? Promise.resolve()]).then(([mod]) => {
      const data = mod.default;
      const c = ref.current;
      if (cancelled || !c) return;
      const ctx = c.getContext("2d");
      const fs = 8.5, lh = Math.ceil(fs * 1.15);
      ctx.font = `${fs}px "JetBrains Mono", monospace`;
      const cw = ctx.measureText("W").width;
      c.width = Math.ceil(data.columns * cw);
      c.height = data.rowCount * lh;
      ctx.font = `${fs}px "JetBrains Mono", monospace`;
      ctx.textBaseline = "top";
      data.rows.forEach((row, ri) => {
        const { text, colors } = row;
        for (let i = 0; i < text.length; i++) {
          const col = colors[i];
          if (!col) continue;
          ctx.fillStyle = col;
          ctx.fillText(text[i], i * cw, ri * lh);
        }
      });
      setReady(true);
    });
    return () => { cancelled = true; };
  }, []);

  const on = visible && ready;
  return (
    <canvas
      ref={ref}
      className="ascii-canvas"
      aria-label="Potret ASCII Firmansyah"
      role="img"
      style={{
        display: "block",
        imageRendering: "pixelated",
        opacity: on ? 1 : 0,
        clipPath: on ? "inset(0 0 0 0)" : "inset(0 0 100% 0)",
        filter: on ? "none" : "brightness(3)",
        transition: "opacity 1.2s ease .3s, clip-path 1.8s steps(32) .3s, filter 2s ease .6s",
        maxHeight: "calc(100vh - 100px)",
        width: "auto",
      }}
    />
  );
}

export default memo(AsciiArt);
