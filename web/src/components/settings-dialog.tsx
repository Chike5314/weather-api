import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apiUrl: string;
  onSave: (url: string) => void;
}

export function SettingsDialog({ open, onOpenChange, apiUrl, onSave }: Props) {
  const [value, setValue] = useState(apiUrl);

  return (
    <Dialog open={open} onOpenChange={(o) => { if (o) setValue(apiUrl); onOpenChange(o); }}>
      <DialogContent>
        <form onSubmit={(e) => { e.preventDefault(); onSave(value); onOpenChange(false); }} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>API settings</DialogTitle>
            <DialogDescription>
              Paste the API Gateway URL from your deployed stack (the Endpoint output, ending in the stage name). Leave it empty for demo mode.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-1.5">
            <Label htmlFor="api-url">API URL</Label>
            <Input id="api-url" type="url" value={value} onChange={(e) => setValue(e.target.value)}
              placeholder="https://abc123.execute-api.us-east-1.amazonaws.com/dev/" />
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" variant="navy">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
