import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

/** "5 minutes ago", "yesterday"... from an ISO date string. */
export function timeAgo(iso: string): string {
  let value = Math.round((new Date(iso).getTime() - Date.now()) / 1000);
  const steps: [number, Intl.RelativeTimeFormatUnit][] = [
    [60, "second"], [60, "minute"], [24, "hour"], [30, "day"], [12, "month"],
  ];
  let unit: Intl.RelativeTimeFormatUnit = "year";
  for (const [size, name] of steps) {
    if (Math.abs(value) < size) { unit = name; break; }
    value = Math.round(value / size);
  }
  return rtf.format(value, unit);
}
