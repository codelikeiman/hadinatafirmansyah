import { Component } from "react";

/**
 * Batas error per halaman: satu halaman WebGL/3rd-party yang crash tidak
 * menjatuhkan seluruh situs. Tampil sebagai "segfault" bergaya kernel.
 */
export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("[segfault]", error, info?.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    return (
      <div className="segfault" role="alert">
        <h2>✖ SEGMENTATION FAULT (core dumped)</h2>
        <div>Proses halaman ini berhenti mendadak. Halaman lain tetap berjalan normal.</div>
        <pre>{String(error?.stack || error?.message || error)}</pre>
        <button type="button" onClick={() => this.setState({ error: null })}>↻ restart process</button>
        <button type="button" onClick={() => { window.location.hash = "#/"; }}>⌂ kembali ke home</button>
      </div>
    );
  }
}
