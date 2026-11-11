import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { cleanUrl, loadApiUrl, makeClient, saveApiUrl, type WeatherItem } from "@/lib/api";

export function useWeather() {
  const [apiUrl, setApiUrlState] = useState(loadApiUrl);
  const client = useMemo(() => makeClient(apiUrl), [apiUrl]);
  const [rows, setRows] = useState<WeatherItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  const refresh = useCallback(async (prefer?: string | null) => {
    setLoading(true);
    try {
      const list = await client.list();
      setRows(list);
      setSelected((cur) => {
        const want = prefer ?? cur;
        return list.some((r) => r.town === want) ? want : (list[0]?.town ?? null);
      });
    } catch (e) {
      setRows([]);
      toast.error(e instanceof Error ? e.message : "Could not load towns");
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => { void refresh(); }, [refresh]);

  /** Runs an API action, then reloads. Returns true on success. */
  const run = useCallback(async (action: () => Promise<void>, success: string, prefer?: string | null) => {
    try {
      await action();
      toast.success(success);
      await refresh(prefer);
      return true;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
      return false;
    }
  }, [refresh]);

  const save = useCallback((town: string, weather: string) => {
    const existing = rows.find((r) => r.town.toLowerCase() === town.toLowerCase());
    return existing
      ? run(() => client.update(existing.town, weather), `Updated ${existing.town}`, existing.town)
      : run(() => client.create(town, weather), `Added ${town}`, town);
  }, [client, rows, run]);

  const remove = useCallback((town: string) => run(() => client.remove(town), `Deleted ${town}`, null), [client, run]);

  const setApiUrl = (url: string) => {
    const next = cleanUrl(url);
    saveApiUrl(next);
    setSelected(null);
    setApiUrlState(next);
  };

  return { apiUrl, setApiUrl, rows, loading, selected, setSelected, refresh, save, remove };
}
