import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/** Sort items by createdAt ascending (oldest first, newest last). */
export function sortByCreatedAtAsc(items) {
  if (!Array.isArray(items)) return [];
  return [...items].sort((a, b) => {
    const tA = new Date(a?.createdAt || 0).getTime();
    const tB = new Date(b?.createdAt || 0).getTime();
    return tA - tB;
  });
}
