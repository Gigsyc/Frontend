"use client";

import { Button, Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui";

interface LeaveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLeave: () => void;
  editing: boolean;
}

export function LeaveDialog({ open, onOpenChange, onLeave, editing }: LeaveDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>{editing ? "Leave without saving your changes?" : "Leave without submitting?"}</DialogTitle>
          <DialogDescription>
            {editing
              ? "The event keeps what GigSyc already has; the changes you made here will be lost."
              : "What you've filled in so far will be lost. To come back to it later, use Save as draft instead — you only need the basics."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline" className="h-11">Keep editing</Button></DialogClose>
          <Button variant="danger" onClick={onLeave} className="h-11">Leave</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
