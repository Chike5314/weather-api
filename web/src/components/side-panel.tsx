import type { WeatherItem } from "@/lib/api";
import { kindOf, looks } from "@/lib/weather";
import { cn, timeAgo } from "@/lib/utils";

export function SidePanel({ rows }: { rows: WeatherItem[] }) {
  const tally = new Map<string, number>();
  rows.forEach((r) => { const k = r.weather.trim().toLowerCase(); tally.set(k, (tally.get(k) ?? 0) + 1); });
  const mix = [...tally].sort((a, b) => b[1] - a[1]).slice(0, 6);
  const max = mix[0]?.[1] ?? 1;
  const recent = [...rows].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 4);

  return (
    <aside className="border-t bg-[#f8f9fb] p-6 lg:border-t-0 lg:border-l">
      <div className="flex items-baseline justify-between">
        <b>Overview</b>
        <span className="text-4xl font-extrabold text-primary">{rows.length}</span>
      </div>
      <p className="text-sm text-muted-foreground">{rows.length === 1 ? "town tracked" : "towns tracked"}</p>

      <h3 className="mt-7 mb-3 text-lg font-extrabold">Conditions</h3>
      <div className="grid gap-2.5">
        {mix.length === 0 && <p className="text-sm text-muted-foreground">No data yet.</p>}
        {mix.map(([name, n]) => (
          <div key={name} className="grid grid-cols-[96px_1fr_20px] items-center gap-2.5 text-sm">
            <span className="truncate capitalize">{name}</span>
            <span className="h-2.5 overflow-hidden rounded-full bg-border"><i className="block h-full rounded-full bg-primary" style={{ width: `${(n / max) * 100}%` }} /></span>
            <b>{n}</b>
          </div>
        ))}
      </div>

      <h3 className="mt-7 mb-3 text-lg font-extrabold">Recently updated</h3>
      <ul className="grid gap-2.5">
        {recent.length === 0 && <li className="text-sm text-muted-foreground">Nothing updated yet.</li>}
        {recent.map((r) => {
          const { Icon, card, iconColor } = looks[kindOf(r.weather)];
          return (
            <li key={r.town} className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-sm">
              <span className={cn("grid size-11 flex-none place-items-center rounded-xl", card)}><Icon className={cn("size-6", iconColor)} /></span>
              <div className="min-w-0">
                <b className="block truncate">{r.town}</b>
                <small className="text-muted-foreground"><span className="capitalize">{r.weather}</span> &middot; {timeAgo(r.updatedAt)}</small>
              </div>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
