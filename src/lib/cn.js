import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Gabungkan class Tailwind dengan aman (konvensi shadcn / Magic UI / Aceternity). */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
