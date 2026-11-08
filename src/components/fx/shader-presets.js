/** Preset warna/karakter untuk <ShaderField>. resolution = skala render (lebih kecil = pixel lebih besar & lebih hemat). */
export const SHADER_PRESETS = {
  phosphor: { colA: "#00330d", colB: "#00ff41", colC: "#c2ffd3", levels: 4, dither: 1, scale: 2.2, intensity: 0.85, resolution: 0.5 },
  dither: { colA: "#002a3a", colB: "#00f0ff", colC: "#ffd400", levels: 3, dither: 1, scale: 1.6, intensity: 1, resolution: 0.34 },
  aurora: { colA: "#001a07", colB: "#00cc34", colC: "#00f0ff", levels: 6, dither: 0, scale: 1.4, intensity: 0.9, resolution: 0.75 },
  ember: { colA: "#2a0500", colB: "#ff003c", colC: "#ffd400", levels: 4, dither: 1, scale: 2.4, intensity: 1, resolution: 0.4 },
};
