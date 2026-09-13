"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogBody, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useSetPartnerVerified } from "@/features/admin";
import { errorMessage } from "@/lib/utils";
import type { Employer } from "@/types";

export type VerifyAction = "verify" | "revoke";

interface Props {
  target: { partner: Employer; action: VerifyAction } | null;
  onClose: () => void;
}

export function VerifyPartnerDialog({ target, onClose }: Props) {
  const setVerified = useSetPartnerVerified();
  if (!target) return null;

  const { partner, action } = target;
  const verifying = action === "verify";

  const run = () => {
    setVerified.mutate(
      { employerId: partner.id, verified: verifying },
      {
        onSuccess: () => {
          toast.success(
            verifying ? `Verified. ${partner.name} can now take payments.` : `Verification revoked for ${partner.name}.`,
            { description: verifying ? "Their contact account is active and the verified mark shows on every listing." : "Their listings lose the verified mark and paid events are paused." },
          );
          onClose();
        },
        onError: (err) => toast.error(errorMessage(err, "We couldn't update this partner. Try again.")),
      },
    );
  };

  return (
    <Dialog open onOpenChange={(o) => { if (!o && !setVerified.isPending) onClose(); }}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>{verifying ? `Verify ${partner.name}?` : `Revoke verification for ${partner.name}?`}</DialogTitle>
          <DialogDescription>{partner.contact.name} · {partner.contact.email}</DialogDescription>
        </DialogHeader>
        <DialogBody className="text-sm leading-6 text-fg-muted">
          {verifying
            ? "Verifying confirms you have seen their registration documents and bank details. Their events can charge for tickets and their contact account becomes active."
            : "Their events stay online but lose the verified mark, ticket sales stop, and the contact account goes back to pending."}
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild><Button variant="ghost" disabled={setVerified.isPending}>Cancel</Button></DialogClose>
          <Button variant={verifying ? "primary" : "danger"} loading={setVerified.isPending} onClick={run}>
            {verifying ? "Verify partner" : "Revoke verification"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
