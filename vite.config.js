import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Vendor yang dipakai di hampir semua halaman dipisah ke chunk sendiri supaya
// cache browser tetap valid walau kode aplikasi berubah. Library berat lain
// (three, rapier, spline, theatre, rive, lottie, unicorn) sengaja TIDAK
// dikelompokkan: rolldown memecahnya otomatis per halaman yang memakainya,
// jadi mereka hanya diunduh saat halaman itu dibuka.
const vendorGroups = [
  ['react-vendor', /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/],
  ['motion', /[\\/]node_modules[\\/](motion|framer-motion|motion-dom|motion-utils)[\\/]/],
  ['lenis', /[\\/]node_modules[\\/]lenis[\\/]/],
]

/**
 * recharts meng-import `es-toolkit/compat/<fn>` yang hanya tersedia sebagai CJS.
 * Rolldown 1.0.x salah me-rename wrapper CJS-nya (`var require_get = require_get()`)
 * → "TypeError: t is not a function" saat runtime. Plugin ini mengalihkan setiap
 * import tersebut ke build ESM resmi `es-toolkit/compat` (bonus: tree-shaking per fungsi).
 */
function esToolkitCompatEsm() {
  const PREFIX = '\0es-toolkit-compat:'
  return {
    name: 'es-toolkit-compat-esm',
    enforce: 'pre',
    resolveId(source) {
      const m = /^es-toolkit\/compat\/([A-Za-z0-9_$]+)$/.exec(source)
      return m ? PREFIX + m[1] : null
    },
    load(id) {
      if (!id.startsWith(PREFIX)) return null
      const name = id.slice(PREFIX.length)
      return `export { ${name} as default } from 'es-toolkit/compat';`
    },
  }
}

export default defineConfig({
  plugins: [esToolkitCompatEsm(), react(), tailwindcss()],
  optimizeDeps: {
    rolldownOptions: { plugins: [esToolkitCompatEsm()] },
  },
  build: {
    target: 'es2022',
    // Chunk WebGPU/Spline/Rapier memang besar (WASM di-inline), tetapi semuanya
    // lazy per-route dan tidak pernah ikut di initial load.
    chunkSizeWarningLimit: 4800,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: vendorGroups.map(([name, test], i) => ({ name, test, priority: 100 - i })),
        },
      },
    },
  },
})
