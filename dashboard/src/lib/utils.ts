import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function kgToLb(kg: number | null | undefined): number | null {
  if (kg === null || kg === undefined) return null;
  return Math.round(kg * 2.20462 * 10) / 10;
}

export function msToHours(ms: number | null | undefined): number | null {
  if (ms === null || ms === undefined) return null;
  return Math.round((ms / 3_600_000) * 10) / 10;
}

export function fmtDelta(delta: number | null, unit = "", precision = 1): string {
  if (delta === null) return "—";
  const sign = delta > 0 ? "▲" : delta < 0 ? "▼" : "·";
  return `${sign} ${Math.abs(delta).toFixed(precision)}${unit}`;
}

export function relativeTime(date: Date | string | null): string {
  if (!date) return "never";
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}
