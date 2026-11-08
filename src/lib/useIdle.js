import { useEffect, useState } from "react";

/** true setelah browser idle (requestIdleCallback, fallback setTimeout) — untuk menunda efek non-kritis. */
export function useIdle(timeout = 1500) {
  const [idle, setIdle] = useState(false);
  useEffect(() => {
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(() => setIdle(true), { timeout });
      return () => window.cancelIdleCallback(id);
    }
    const t = setTimeout(() => setIdle(true), timeout);
    return () => clearTimeout(t);
  }, [timeout]);
  return idle;
}
