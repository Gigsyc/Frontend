"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { FlaskConical, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SwitchField } from "@/components/ui/checkbox";
import { Dialog, DialogBody, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { prototypeApi } from "@/features/prototype";

export function PrototypeTab() {
  const qc = useQueryClient();
  const [chaos, setChaos] = useState<boolean>(() => prototypeApi.getChaos());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  const toggleChaos = (on: boolean) => {
    prototypeApi.setChaos(on);
    setChaos(on);
    toast(on ? "Unreliable network on" : "Unreliable network off", {
      description: on ? "Roughly 1 in 4 requests will now fail. Retry buttons and error states are live." : "Requests succeed as normal again.",
    });
  };

  const reset = async () => {
    setResetting(true);
    try {
      prototypeApi.resetDemoData();
      await qc.invalidateQueries();
      setConfirmOpen(false);
      toast.success("Demo data reset", { description: "Shifts, bookings, invoices and notifications are back to the starting point." });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "We couldn't reset the demo data.");
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Reset demo data</CardTitle>
          <CardDescription>Puts every shift, booking, invoice and notification back to the seeded starting point. Data also resets by itself each day.</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <Dialog open={confirmOpen} onOpenChange={(o) => !resetting && setConfirmOpen(o)}>
            <Button variant="outline" onClick={() => setConfirmOpen(true)}><RotateCcw /> Reset demo data</Button>
            <DialogContent size="sm">
              <DialogHeader>
                <DialogTitle>Reset the demo?</DialogTitle>
                <DialogDescription>Anything you&rsquo;ve posted, confirmed, approved or paid in this session is discarded. This only affects your browser.</DialogDescription>
              </DialogHeader>
              <DialogBody className="text-sm text-fg-muted">Ikaze&rsquo;s seeded shifts, Aline&rsquo;s bookings and the three invoices come back exactly as they were on first load.</DialogBody>
              <DialogFooter>
                <DialogClose asChild><Button variant="ghost" disabled={resetting}>Keep my changes</Button></DialogClose>
                <Button variant="danger" onClick={() => void reset()} loading={resetting}>Reset everything</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FlaskConical className="size-4 text-fg-subtle" aria-hidden />
            <CardTitle>Simulate unreliable network</CardTitle>
          </div>
          <CardDescription>Roughly 1 in 4 requests will fail so you can see error states.</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <SwitchField
            label={chaos ? "Failures on" : "Failures off"}
            description="Applies to every screen until you turn it off or reload the page."
            checked={chaos}
            onCheckedChange={toggleChaos}
            className="min-h-[44px]"
          />
        </CardContent>
      </Card>
    </div>
  );
}
