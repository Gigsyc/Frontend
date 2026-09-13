"use client";

import { Send } from "lucide-react";
import { toast } from "sonner";
import { Button, type ButtonProps } from "@/components/ui";
import { useInviteWorker } from "@/features/bookings";
import type { Worker } from "@/types";

interface InviteButtonProps extends Pick<ButtonProps, "size" | "variant" | "className"> {
  shiftId: string;
  shiftTitle: string;
  worker: Worker;
}

/** One mutation per button so a slow invite only spins its own row. */
export function InviteButton({ shiftId, shiftTitle, worker, size = "sm", variant = "outline", className }: InviteButtonProps) {
  const invite = useInviteWorker();
  const send = () =>
    invite.mutate(
      { shiftId, workerId: worker.id },
      {
        onSuccess: () => toast.success(`Invited ${worker.firstName}`, { description: `${shiftTitle} · they'll see it in their app now.` }),
        onError: (err) => toast.error(err instanceof Error ? err.message : "Couldn't send the invite. Try again."),
      },
    );
  return (
    <Button size={size} variant={variant} onClick={send} loading={invite.isPending} className={className} aria-label={`Invite ${worker.firstName} ${worker.lastName}`}>
      <Send /> Invite
    </Button>
  );
}
