import { useState } from "react";
import { RefreshCw, Search, Settings, Sun } from "lucide-react";
import { useWeather } from "@/hooks/use-weather";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toaster } from "@/components/ui/sonner";
import { HeroCard } from "@/components/hero-card";
import { TownForm } from "@/components/town-form";
import { TownGrid } from "@/components/town-grid";
import { SidePanel } from "@/components/side-panel";
import { SettingsDialog } from "@/components/settings-dialog";

export default function App() {
  const w = useWeather();
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(false);
  const [settings, setSettings] = useState(false);

  const selectedItem = w.rows.find((r) => r.town === w.selected);
  const visible = w.rows.filter((r) => r.town.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="min-h-screen bg-[linear-gradient(90deg,var(--background)_72%,#6fb7c0_72%)] max-lg:bg-background">
      <div className="mx-auto max-w-[1240px] px-5 py-7">
        <div className="grid overflow-hidden rounded-[28px] bg-card shadow-2xl shadow-[#1d2742]/10 lg:grid-cols-[1fr_330px]">
          <main className="min-w-0 p-6 lg:p-7">
            <header className="mb-5 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2.5 font-extrabold">
                <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground"><Sun className="size-5" /></span>
                Weather desk
              </div>
              <h1 className="min-w-52 flex-1 text-2xl leading-tight font-extrabold">How's the weather<br />in your towns?</h1>
              <div className="relative w-full max-w-72 sm:w-72">
                <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input aria-label="Search a town" placeholder="Search a town" className="rounded-full border-0 bg-muted pl-10"
                  value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
              <Button variant="outline" size="icon" aria-label="API settings" onClick={() => setSettings(true)}><Settings /></Button>
            </header>

            {!w.apiUrl && (
              <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl bg-accent px-4 py-2.5 text-sm">
                <span>Demo mode: changes stay in this page. Add your API URL to use real data.</span>
                <Button size="sm" onClick={() => setSettings(true)}>Add API URL</Button>
              </div>
            )}

            <section className="mb-7 grid gap-4 lg:grid-cols-[1.25fr_1fr]">
              <HeroCard item={selectedItem} loading={w.loading} hasRows={w.rows.length > 0}
                onEdit={() => setEditing(true)}
                onDelete={async (town) => { const ok = await w.remove(town); if (ok) setEditing(false); return ok; }} />
              <TownForm key={editing ? `edit-${w.selected}` : "add"} editing={editing ? (selectedItem ?? null) : null}
                onSave={w.save} onCancel={() => setEditing(false)} />
            </section>

            <div className="mb-3.5 flex items-center justify-between">
              <h2 className="text-xl font-extrabold">All towns</h2>
              <Button size="sm" onClick={() => void w.refresh()} disabled={w.loading}><RefreshCw className={w.loading ? "animate-spin" : ""} /> Refresh</Button>
            </div>
            <TownGrid rows={visible} selected={w.selected} loading={w.loading} query={query}
              onSelect={(t) => { w.setSelected(t); setEditing(false); }} />
          </main>
          <SidePanel rows={w.rows} />
        </div>
      </div>

      <SettingsDialog open={settings} onOpenChange={setSettings} apiUrl={w.apiUrl} onSave={w.setApiUrl} />
      <Toaster position="bottom-center" />
    </div>
  );
}
