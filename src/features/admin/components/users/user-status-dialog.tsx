"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogBody, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useSetUserStatus } from "@/features/admin";
import { errorMessage } from "@/lib/utils";
import type { PlatformUser } from "@/types";
import { confirmCopy, NEXT_STATUS, type UserAction } from "./user-actions";

interface Props {
  target: { user: PlatformUser; action: UserAction } | null;
  onClose: () => void;
}

export function UserStatusDialog({ target, onClose }: Props) {
  const setStatus = useSetUserStatus();
  if (!target) return null;

  const copy = confirmCopy(target.action, target.user);
  const destructive = target.action === "suspend";

  const run = () => {
    setStatus.mutate(
      { id: target.user.id, status: NEXT_STATUS[target.action] },
      {
        onSuccess: () => { toast.success(copy.toast); onClose(); },
        onError: (err) => toast.error(errorMessage(err, "We couldn't update this account. Try again.")),
      },
    );
  };

  return (
    <Dialog open onOpenChange={(o) => { if (!o && !setStatus.isPending) onClose(); }}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>{copy.title}</DialogTitle>
          <DialogDescription>{target.user.email}</DialogDescription>
        </DialogHeader>
        <DialogBody className="text-sm leading-6 text-fg-muted">{copy.body}</DialogBody>
        <DialogFooter>
          <DialogClose asChild><Button variant="ghost" disabled={setStatus.isPending}>Cancel</Button></DialogClose>
          <Button variant={destructive ? "danger" : "primary"} loading={setStatus.isPending} onClick={run}>{copy.confirm}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
