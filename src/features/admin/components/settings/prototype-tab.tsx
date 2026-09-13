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
import { errorMessage } from "@/lib/utils";

export function PrototypeTab() {
  const qc = useQueryClient();
  const [chaos, setChaos] = useState<boolean>(() => prototypeApi.getChaos());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  const toggleChaos = (on: boolean) => {
    prototypeApi.setChaos(on);
    setChaos(on);
    toast(on ? "Unreliable network on" : "Unreliable network off", {
      description: on
        ? "Roughly one in four requests will now fail, so every error and retry state is reachable."
        : "Requests succeed as normal again.",
    });
  };

  const reset = async () => {
    setResetting(true);
    try {
      prototypeApi.resetDemoData();
      await qc.invalidateQueries();
      setConfirmOpen(false);
      toast.success("Demo data reset", { description: "Events, destinations, users, partners and reports are back to the starting point." });
    } catch (err) {
      toast.error(errorMessage(err, "We couldn't reset the demo data."));
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Reset demo data</CardTitle>
          <CardDescription>Puts every event, destination, account, partner and report back to the seeded starting point. Data also resets by itself each day.</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <Dialog open={confirmOpen} onOpenChange={(o) => { if (!resetting) setConfirmOpen(o); }}>
            <Button variant="outline" onClick={() => setConfirmOpen(true)}><RotateCcw /> Reset demo data</Button>
            <DialogContent size="sm">
              <DialogHeader>
                <DialogTitle>Reset the demo?</DialogTitle>
                <DialogDescription>Anything published, verified, suspended or resolved in this session is discarded. This only affects your browser.</DialogDescription>
              </DialogHeader>
              <DialogBody className="text-sm leading-6 text-fg-muted">
                The eight review-queue submissions come back, the two unverified partners go back to pending, and the four open reports reopen.
              </DialogBody>
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
          <CardDescription>Roughly one in four requests will fail, so you can see how the console behaves when the API is having a bad morning.</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <SwitchField
            label={chaos ? "Failures on" : "Failures off"}
            description="Applies to every screen until you turn it off or reload the page."
            checked={chaos}
            onCheckedChange={toggleChaos}
            className="min-h-11"
          />
        </CardContent>
      </Card>
    </div>
  );
}
