"use client";

import { Button } from "@/components/ui/button";

/**
 * The counts and covers both come from one public events query, so both steps offer the same
 * quiet recovery. The control keeps a 44px target — on a flaky connection it is the one thing
 * the person actually needs to hit.
 */
export function EventsRetry({ message, onRetry, disabled }: {
  message: string;
  onRetry: () => void;
  disabled?: boolean;
}) {
  return (
    <p className="mt-3 flex flex-wrap items-center gap-x-2 text-[13px] text-fg-muted">
      {message}
      <Button variant="link" className="h-auto min-h-11 px-0 text-[13px]" disabled={disabled} onClick={onRetry}>
        Try again
      </Button>
    </p>
  );
}
