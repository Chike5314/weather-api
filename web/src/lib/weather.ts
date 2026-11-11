import { Cloud, CloudFog, CloudLightning, CloudRain, Sun, Wind, type LucideIcon } from "lucide-react";

export type Kind = "sun" | "cloud" | "rain" | "storm" | "wind" | "fog";

/** The API stores free text, so map keywords to a visual condition. */
export function kindOf(weather: string): Kind {
  const w = weather.toLowerCase();
  if (/storm|thunder|lightning/.test(w)) return "storm";
  if (/rain|shower|drizzle|wet/.test(w)) return "rain";
  if (/fog|mist|haze/.test(w)) return "fog";
  if (/wind|breez|gust/.test(w)) return "wind";
  if (/cloud|overcast|grey|gray/.test(w)) return "cloud";
  return "sun";
}

export const looks: Record<Kind, { Icon: LucideIcon; card: string; iconColor: string }> = {
  sun: { Icon: Sun, card: "bg-gradient-to-br from-[#bfe6ea] to-[#ffd9ad] text-[#3a2a1c]", iconColor: "text-[#ffa733]" },
  cloud: { Icon: Cloud, card: "bg-gradient-to-br from-[#cfe1f7] to-[#e9e1f6] text-[#26324f]", iconColor: "text-white" },
  rain: { Icon: CloudRain, card: "bg-gradient-to-br from-[#a8bff0] to-[#7393d9] text-[#10204a]", iconColor: "text-white" },
  wind: { Icon: Wind, card: "bg-gradient-to-br from-[#9fc3f2] to-[#d3e4fb] text-[#17305c]", iconColor: "text-white" },
  storm: { Icon: CloudLightning, card: "bg-gradient-to-br from-[#7f8db9] to-[#4d5882] text-white", iconColor: "text-[#ffd54a]" },
  fog: { Icon: CloudFog, card: "bg-gradient-to-br from-[#e3e9ee] to-[#c4cdd6] text-[#2b3547]", iconColor: "text-white" },
};

export const SUGGESTIONS = ["sunny", "hot", "partly cloudy", "cloudy", "rainy", "stormy", "windy", "foggy"];
