import type { WeatherItem } from "@/lib/api";
import { kindOf, looks } from "@/lib/weather";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  rows: WeatherItem[];
  selected: string | null;
  loading: boolean;
  query: string;
  onSelect: (town: string) => void;
}

export function TownGrid({ rows, selected, loading, query, onSelect }: Props) {
  if (loading && rows.length === 0) {
    return <div className="grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-3.5">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}</div>;
  }
  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground">{query ? `No town matches "${query}".` : "Nothing to show yet. Add a town to get started."}</p>;
  }
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-3.5">
      {rows.map((r) => {
        const { Icon, card, iconColor } = looks[kindOf(r.weather)];
        return (
          <button key={r.town} aria-pressed={r.town === selected} onClick={() => onSelect(r.town)}
            className={cn("relative flex min-h-32 cursor-pointer flex-col justify-between rounded-2xl p-4 text-left outline-none transition-transform hover:-translate-y-0.5 focus-visible:ring-[3px] focus-visible:ring-ring",
              card, r.town === selected && "ring-[3px] ring-primary")}>
            <Icon aria-hidden className={cn("absolute top-3 right-3 size-10", iconColor)} />
            <b className="pr-12 break-words">{r.town}</b>
            <span className="font-semibold break-words capitalize opacity-90">{r.weather}</span>
          </button>
        );
      })}
    </div>
  );
}
