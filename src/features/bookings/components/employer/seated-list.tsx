"use client";

import Link from "next/link";
import { useState } from "react";
import { MoreHorizontal, UserMinus } from "lucide-react";
import { toast } from "sonner";
import {
  BookingStatusBadge, Button, Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, Rating, WorkerAvatar,
} from "@/components/ui";
import { useDeclineBooking } from "@/features/bookings";
import { formatTimeAgo } from "@/lib/utils";
import type { StaffingRow } from "./use-shift-staffing";

interface SeatedListProps {
  rows: StaffingRow[];
  /** "Confirmed" rows can be removed; "Invited" rows are read-only until the worker replies. */
  kind: "confirmed" | "invited";
}

const VERB = { confirmed: "Confirmed", invited: "Invited" } as const;

/** Compact rows for people already attached to the shift. */
export function SeatedList({ rows, kind }: SeatedListProps) {
  const [removing, setRemoving] = useState<StaffingRow | null>(null);
  const decline = useDeclineBooking();

  const remove = () => {
    if (!removing) return;
    const { worker, booking } = removing;
    decline.mutate(booking.id, {
      onSuccess: () => {
        toast.success(`${worker.firstName} removed from the shift`, { description: "Their spot is open again." });
        setRemoving(null);
      },
      onError: (err) => toast.error(err instanceof Error ? err.message : "Couldn't remove. Try again."),
    });
  };

  return (
    <>
      <ul className="divide-y divide-border">
        {rows.map(({ worker, booking }) => (
          <li key={booking.id} className="flex items-center gap-3 py-3">
            <Link href={`/employer/talent/${worker.id}`} className="shrink-0 rounded-full"><WorkerAvatar worker={worker} size="md" /></Link>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <Link href={`/employer/talent/${worker.id}`} className="truncate text-sm font-semibold text-fg hover:text-navy-800">{worker.firstName} {worker.lastName}</Link>
                <BookingStatusBadge status={booking.status} />
              </div>
              <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-fg-muted">
                <Rating value={worker.rating} count={worker.ratingCount} />
                <span className="tabular">{worker.reliability}% reliable</span>
                <span>{VERB[kind]} {formatTimeAgo(booking.createdAt)}</span>
              </p>
            </div>
            {kind === "confirmed" && booking.status === "confirmed" ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label={`Actions for ${worker.firstName} ${worker.lastName}`} className="size-11 shrink-0 text-fg-muted md:size-10"><MoreHorizontal /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild><Link href={`/employer/talent/${worker.id}`}>View profile</Link></DropdownMenuItem>
                  <DropdownMenuItem destructive onSelect={() => setRemoving({ worker, booking })}><UserMinus /> Remove from shift</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : kind === "invited" ? (
              <span className="shrink-0 text-xs text-fg-subtle">Awaiting reply</span>
            ) : null}
          </li>
        ))}
      </ul>

      <Dialog open={!!removing} onOpenChange={(o) => { if (!o && !decline.isPending) setRemoving(null); }}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Remove {removing?.worker.firstName} from this shift?</DialogTitle>
            <DialogDescription>They&apos;ll be told their booking was cancelled by you. It won&apos;t count against their reliability.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline" disabled={decline.isPending}>Keep them</Button></DialogClose>
            <Button variant="danger" onClick={remove} loading={decline.isPending}>Remove</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
