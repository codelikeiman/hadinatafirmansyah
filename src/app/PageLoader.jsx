/** Fallback Suspense: murni CSS (tanpa WASM/Lottie) agar tampil instan. */
export default function PageLoader({ label = "loading module" }) {
  return (
    <div className="page-loader" role="status" aria-live="polite">
      <div className="text-center">
        <div className="pl-hex" />
        <div>{label}<span className="cur" /></div>
        <div className="pl-bar"><i /></div>
        <div className="text-[10px] text-tx3">fetching chunk · verifying integrity · linking</div>
      </div>
    </div>
  );
}
