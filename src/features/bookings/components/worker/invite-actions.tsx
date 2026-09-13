"use client";

import { Check, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRespondToInvite } from "../../queries";

interface InviteActionsProps {
  bookingId: string;
  shiftTitle: string;
  /** Omitted while the employer is still loading — the copy drops the name rather than guessing at it. */
  employerName?: string;
  size?: "md" | "lg";
  className?: string;
  /** Called after the store has recorded the decision. */
  onDecided?: (accepted: boolean) => void;
}

/** Accept / Decline pair for an invitation. Shared by the Discover invite card and the shift detail action bar. */
export function InviteActions({ bookingId, shiftTitle, employerName, size = "md", className, onDecided }: InviteActionsProps) {
  const respond = useRespondToInvite();
  const [choice, setChoice] = useState<"accept" | "decline" | null>(null);

  const decide = (accept: boolean) => {
    setChoice(accept ? "accept" : "decline");
    respond.mutate(
      { bookingId, accept },
      {
        onSuccess: () => {
          if (accept) {
            toast.success(`You're confirmed for ${shiftTitle}`, {
              description: employerName
                ? `It's in your schedule. ${employerName} will share the check-in code on the day.`
                : "It's in your schedule. You'll get the check-in code on the day.",
            });
          } else {
            toast(`Invitation declined`, { description: `We've let ${employerName ?? "the employer"} know.` });
          }
          onDecided?.(accept);
        },
        onError: (err) => toast.error(err instanceof Error ? err.message : "We couldn't record that. Try again."),
        onSettled: () => setChoice(null),
      },
    );
  };

  return (
    <div className={cn("flex gap-2", className)}>
      <Button variant="outline" size={size} className="flex-1" onClick={() => decide(false)} disabled={respond.isPending} loading={choice === "decline"}>
        {choice !== "decline" ? <X /> : null} Decline
      </Button>
      <Button size={size} className="flex-1" onClick={() => decide(true)} disabled={respond.isPending} loading={choice === "accept"}>
        {choice !== "accept" ? <Check /> : null} Accept
      </Button>
    </div>
  );
}
