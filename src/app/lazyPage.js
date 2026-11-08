import { createElement, lazy } from "react";

/**
 * Lazy page yang bisa di-preload.
 *
 * React.lazy biasa selalu suspend minimal sekali walau modulnya sudah ada di
 * cache. Itu merusak View Transitions: snapshot "halaman baru" malah berisi
 * fallback loader. Di sini, begitu `preload()` selesai, komponen asli
 * dirender sinkron, sehingga transisi selalu menangkap konten final.
 */
export function lazyPage(load) {
  let Component = null;
  let promise = null;

  const preload = () => {
    if (!promise) {
      promise = load().then(
        mod => {
          Component = mod.default;
          return mod;
        },
        err => {
          promise = null; // izinkan retry (mis. chunk gagal karena jaringan)
          throw err;
        },
      );
    }
    return promise;
  };

  const Lazy = lazy(preload);

  function Page(props) {
    return Component ? createElement(Component, props) : createElement(Lazy, props);
  }

  return { preload, Page, isLoaded: () => Component !== null };
}
