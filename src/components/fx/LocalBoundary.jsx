import { Component } from "react";

/**
 * Error boundary kecil untuk widget pihak ketiga (Spline, Rive, Unicorn…):
 * kegagalan satu widget cukup diganti fallback, halaman tetap hidup.
 */
export default class LocalBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    console.warn("[widget fallback]", error?.message ?? error);
    this.props.onError?.(error);
  }

  render() {
    return this.state.failed ? (this.props.fallback ?? null) : this.props.children;
  }
}
