import { createContext, useContext } from "react";

export const RouterContext = createContext(null);

export function useRouter() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error("useRouter() harus dipakai di dalam <RouterProvider>");
  return ctx;
}

export const useNavigate = () => useRouter().navigate;

/** Baca path dari hash: "#/htop" → "/htop"; kosong / "#" → "/" */
export function readHashPath() {
  const h = window.location.hash;
  if (!h || h === "#" || h === "#/") return "/";
  if (!h.startsWith("#/")) return "/";
  const p = h.slice(1).split("?")[0].replace(/\/+$/, "");
  return p || "/";
}
