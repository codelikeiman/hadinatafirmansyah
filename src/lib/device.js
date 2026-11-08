/** Info perangkat asli pengunjung untuk neofetch (dibaca sekali, aman bila API tidak ada). */
export function detectGpu() {
  try {
    const gl = document.createElement("canvas").getContext("webgl");
    if (!gl) return "software renderer";
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    const raw = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return String(raw).replace(/^ANGLE \((.*)\)$/, "$1").replace(/\s*\(0x[0-9a-f]+\)/gi, "").slice(0, 64);
  } catch {
    return "unknown";
  }
}

export function detectBrowser() {
  const brands = navigator.userAgentData?.brands?.filter(b => !/Not.?A.?Brand|Chromium/i.test(b.brand));
  if (brands?.length) return `${brands[0].brand} ${brands[0].version}`;
  const ua = navigator.userAgent;
  const m = /(Firefox|Edg|OPR|Chrome|Safari)\/(\d+)/.exec(ua);
  return m ? `${m[1] === "Edg" ? "Edge" : m[1]} ${m[2]}` : "unknown";
}

export function detectCores() {
  return navigator.hardwareConcurrency || 4;
}
