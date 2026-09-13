"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { FlaskConical, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SwitchField } from "@/components/ui/checkbox";
import { Dialog, DialogBody, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { prototypeApi } from "@/features/prototype";

/** Demo-only controls. Not part of the product — hence the flask and the muted framing. */
export function PrototypeCard() {
  const qc = useQueryClient();
  // The store is a client singleton and chaos is never persisted, so reading it lazily matches what the server rendered.
  const [chaos, setChaos] = useState(() => prototypeApi.getChaos());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  const toggleChaos = (on: boolean) => {
    prototypeApi.setChaos(on);
    setChaos(on);
    toast(on ? "Unreliable network on" : "Unreliable network off", { description: on ? "Roughly one in four requests will fail so you can see error states." : "Requests succeed normally again." });
  };

  const reset = async () => {
    setResetting(true);
    prototypeApi.resetDemoData();
    await qc.invalidateQueries();
    setResetting(false);
    setConfirmOpen(false);
    toast.success("Demo data reset", { description: "Shifts, bookings, payouts and your profile are back to the seed." });
  };

  return (
    <Card className="border border-dashed border-border-strong shadow-none">
      <CardHeader className="px-4 sm:px-5">
        <div className="flex items-center gap-2">
          <FlaskConical className="size-4 text-fg-muted" aria-hidden />
          <CardTitle>Prototype</CardTitle>
        </div>
        <CardDescription>Controls for demoing this build. They won&rsquo;t exist in the real app.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 px-4 pt-3 sm:px-5">
        <SwitchField label="Simulate unreliable network" description="Fail about one in four requests to show retry and error states." checked={chaos} onCheckedChange={toggleChaos} className="min-h-11" />
        <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-fg">Reset demo data</p>
            <p className="text-[13px] text-fg-muted">Puts every shift, booking and rating back to the seed. Your edits to this profile are lost.</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setConfirmOpen(true)} className="sm:shrink-0"><RotateCcw /> Reset</Button>
        </div>
      </CardContent>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Reset demo data?</DialogTitle>
            <DialogDescription>Everything you changed in this session — applications, ratings, profile edits — goes back to the starting state.</DialogDescription>
          </DialogHeader>
          <DialogBody className="text-sm text-fg-muted">The store also resets itself automatically once a day.</DialogBody>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Keep my changes</Button></DialogClose>
            <Button variant="danger" onClick={reset} loading={resetting}>Reset everything</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
