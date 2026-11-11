export interface WeatherItem {
  town: string;
  weather: string;
  updatedAt: string;
}

const STORAGE_KEY = "weatherApiUrl";

export const cleanUrl = (u: string) => u.trim().replace(/\/+$/, "");

export function loadApiUrl(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? import.meta.env.VITE_API_URL ?? "";
  } catch {
    return import.meta.env.VITE_API_URL ?? "";
  }
}

export function saveApiUrl(url: string) {
  try { localStorage.setItem(STORAGE_KEY, url); } catch { /* storage blocked */ }
}

/* ---------- demo data (used when no API URL is set) ---------- */
const ago = (ms: number) => new Date(Date.now() - ms).toISOString();
let demoRows: WeatherItem[] = [
  { town: "Douala", weather: "hot", updatedAt: ago(3e5) },
  { town: "Yaounde", weather: "partly cloudy", updatedAt: ago(36e5) },
  { town: "Buea", weather: "rainy", updatedAt: ago(72e5) },
  { town: "Garoua", weather: "sunny", updatedAt: ago(864e5) },
  { town: "Bamenda", weather: "foggy", updatedAt: ago(1728e5) },
];

function demoClient() {
  const find = (town: string) => {
    const i = demoRows.findIndex((r) => r.town === town);
    if (i < 0) throw new Error("Weather not found");
    return i;
  };
  return {
    list: async () => demoRows.slice(),
    create: async (town: string, weather: string) => {
      demoRows = demoRows.filter((r) => r.town !== town);
      demoRows.push({ town, weather, updatedAt: new Date().toISOString() });
    },
    update: async (town: string, weather: string) => {
      const i = find(town);
      demoRows[i] = { ...demoRows[i], weather, updatedAt: new Date().toISOString() };
    },
    remove: async (town: string) => { demoRows.splice(find(town), 1); },
  };
}

/* ---------- real client ---------- */
function realClient(base: string) {
  async function call<T>(method: string, path: string, body?: unknown): Promise<T> {
    let res: Response;
    try {
      res = await fetch(cleanUrl(base) + path, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch {
      throw new Error("Could not reach the API. Check the URL, and that the stack with CORS enabled is deployed.");
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error((data as { message?: string }).message ?? `Request failed (${res.status})`);
    return data as T;
  }
  const enc = encodeURIComponent;
  return {
    list: () => call<WeatherItem[]>("GET", "/list-weathers"),
    create: (town: string, weather: string) => call<unknown>("POST", "/create-weather", { town, weather }).then(() => undefined),
    update: (town: string, weather: string) => call<unknown>("PUT", `/update-weather/${enc(town)}`, { weather }).then(() => undefined),
    remove: (town: string) => call<unknown>("DELETE", `/delete-weather/${enc(town)}`).then(() => undefined),
  };
}

export type WeatherClient = ReturnType<typeof demoClient>;
export const makeClient = (base: string): WeatherClient => (base ? realClient(base) : demoClient());
