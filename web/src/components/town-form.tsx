import { useState } from "react";
import type { WeatherItem } from "@/lib/api";
import { SUGGESTIONS } from "@/lib/weather";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  /** When set, the form edits this town's weather instead of adding a town. */
  editing: WeatherItem | null;
  onSave: (town: string, weather: string) => Promise<boolean>;
  onCancel: () => void;
}

export function TownForm({ editing, onSave, onCancel }: Props) {
  const [town, setTown] = useState(editing?.town ?? "");
  const [weather, setWeather] = useState(editing?.weather ?? "");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const ok = await onSave(town.trim(), weather.trim());
    setBusy(false);
    if (ok) { setTown(""); setWeather(""); onCancel(); }
  }

  return (
    <Card className="rounded-3xl bg-lime">
      <form onSubmit={submit} className="flex h-full flex-col gap-3" autoComplete="off">
        <CardHeader><CardTitle className="text-xl">{editing ? "Edit weather" : "Add a town"}</CardTitle></CardHeader>
        <div className="grid gap-1.5">
          <Label htmlFor="town">Town</Label>
          <Input id="town" required maxLength={80} placeholder="e.g. Douala" value={town} disabled={!!editing}
            onChange={(e) => setTown(e.target.value)} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="weather">Weather</Label>
          <Input id="weather" required maxLength={60} list="weather-kinds" placeholder="e.g. partly cloudy" value={weather}
            autoFocus={!!editing} onChange={(e) => setWeather(e.target.value)} />
          <datalist id="weather-kinds">{SUGGESTIONS.map((s) => <option key={s} value={s} />)}</datalist>
        </div>
        <div className="mt-auto flex gap-2 pt-1">
          <Button type="submit" variant="navy" className="flex-1" disabled={busy}>{editing ? "Save changes" : "Add town"}</Button>
          {editing && <Button type="button" variant="glass" onClick={onCancel}>Cancel</Button>}
        </div>
      </form>
    </Card>
  );
}
