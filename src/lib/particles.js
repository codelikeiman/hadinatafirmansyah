import { tsParticles } from "@tsparticles/engine";

/**
 * tsParticles v4 hanya mengizinkan registrasi plugin SEBELUM container
 * pertama di-load. Karena partikel latar, Sparkles, confetti, dan fireworks
 * bisa muncul dalam urutan apa pun, semua plugin didaftarkan sekali di sini
 * (memoized) dan setiap pemakai menunggu ensureEngine() lebih dulu.
 */
let ready = null;

export function ensureEngine() {
  if (!ready) {
    ready = (async () => {
      const [{ loadSlim }, { confetti }, { fireworks }] = await Promise.all([
        import("@tsparticles/slim"),
        import("@tsparticles/confetti"),
        import("@tsparticles/fireworks"),
      ]);
      await loadSlim(tsParticles);
      await Promise.all([confetti.init(), fireworks.init()]);
      return { confetti, fireworks };
    })().catch(err => {
      ready = null;
      throw err;
    });
  }
  return ready;
}

/** Init stabil untuk <ParticlesProvider init={initParticles}> (satu fungsi untuk seluruh app). */
export async function initParticles() {
  await ensureEngine();
}
