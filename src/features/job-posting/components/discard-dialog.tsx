"use client";

import { Button, Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui";

interface DiscardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDiscard: () => void;
}

export function DiscardDialog({ open, onOpenChange, onDiscard }: DiscardDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Leave without posting?</DialogTitle>
          <DialogDescription>What you&apos;ve filled in so far will be lost. To come back to it later, use Save draft instead — you only need the role and a title.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline">Keep editing</Button></DialogClose>
          <Button variant="danger" onClick={onDiscard}>Discard</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
