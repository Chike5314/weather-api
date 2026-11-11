import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { WeatherItem } from "@/lib/api";
import { kindOf, looks } from "@/lib/weather";
import { timeAgo, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Props {
  item?: WeatherItem;
  loading: boolean;
  hasRows: boolean;
  onEdit: () => void;
  onDelete: (town: string) => Promise<boolean>;
}

export function HeroCard({ item, loading, hasRows, onEdit, onDelete }: Props) {
  const [confirm, setConfirm] = useState(false);

  if (loading && !item) return <Skeleton className="min-h-72 rounded-3xl" />;

  if (!item) {
    return (
      <Card className="min-h-72 items-center justify-center rounded-3xl bg-muted text-center text-muted-foreground">
        <p className="font-bold text-foreground">{hasRows ? "Pick a town below" : "No towns yet"}</p>
        <p className="text-sm">{hasRows ? "Its weather will show here." : "Add your first town with the form."}</p>
      </Card>
    );
  }

  const kind = kindOf(item.weather);
  const { Icon, card, iconColor } = looks[kind];

  return (
    <Card className={cn("relative min-h-72 justify-between overflow-hidden rounded-3xl p-6", card)}>
      <Icon aria-hidden className={cn("absolute -top-4 -right-8 size-60 opacity-90", iconColor)} strokeWidth={1.4} />
      <div className="relative">
        <p className="text-sm font-semibold opacity-80">Selected town</p>
        <p className="mt-1 text-lg font-bold">{item.town}</p>
        <h2 className="mt-1 max-w-[80%] text-5xl leading-none font-extrabold break-words capitalize">{item.weather}</h2>
      </div>
      <div className="relative flex flex-wrap items-center gap-2">
        <span className="mr-auto text-sm font-semibold opacity-80">Updated {timeAgo(item.updatedAt)}</span>
        <Button variant="navy" size="sm" onClick={onEdit}><Pencil /> Edit weather</Button>
        <Button variant="glass" size="sm" className="text-destructive" onClick={() => setConfirm(true)}><Trash2 /> Delete</Button>
      </div>

      <Dialog open={confirm} onOpenChange={setConfirm}>
        <DialogContent className="text-foreground">
          <DialogHeader>
            <DialogTitle>Delete {item.town}?</DialogTitle>
            <DialogDescription>This removes its weather from the table. You can add it again later.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setConfirm(false)}>Keep it</Button>
            <Button variant="destructive" onClick={async () => { if (await onDelete(item.town)) setConfirm(false); }}>Delete town</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
