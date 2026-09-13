"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, Star, UserPlus } from "lucide-react";
import { Badge, Dialog, EmptyState, ErrorState, Input, Rating, SheetContent, Skeleton, SwitchField, VerifiedMark, WorkerAvatar } from "@/components/ui";
import { useShiftCandidates } from "@/features/shifts";
import { ROLES } from "@/data/roles";
import type { Shift } from "@/types";
import { InviteButton } from "./invite-button";

interface InviteDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shift: Shift;
  excludeIds: ReadonlySet<string>;
  poolIds: ReadonlySet<string>;
}

/** Full ranked list, searchable, with a talent-pool filter. */
export function InviteDrawer({ open, onOpenChange, shift, excludeIds, poolIds }: InviteDrawerProps) {
  const [search, setSearch] = useState("");
  const [poolOnly, setPoolOnly] = useState(false);
  const candidates = useShiftCandidates(open ? shift.id : undefined);

  const list = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return (candidates.data ?? []).filter((c) => {
      if (excludeIds.has(c.worker.id)) return false;
      if (poolOnly && !poolIds.has(c.worker.id)) return false;
      if (!needle) return true;
      return `${c.worker.firstName} ${c.worker.lastName} ${c.worker.headline} ${c.worker.district}`.toLowerCase().includes(needle);
    });
  }, [candidates.data, excludeIds, poolIds, poolOnly, search]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <SheetContent title="Invite workers" description={`${ROLES[shift.role].label} · ${shift.workersNeeded} needed`} className="max-w-md">
        <div className="sticky top-0 z-10 space-y-3 border-b border-border bg-surface px-5 py-3">
          <Input type="search" aria-label="Search workers" placeholder="Search by name, skill or district" value={search} onChange={(e) => setSearch(e.target.value)} leading={<Search aria-hidden />} />
          <SwitchField label="Talent pool only" description={`${poolIds.size} saved workers`} checked={poolOnly} onCheckedChange={setPoolOnly} />
        </div>
        <div className="px-5 py-2">
          {candidates.isPending ? (
            <ul className="divide-y divide-border">{[0, 1, 2, 3, 4].map((i) => <li key={i} className="flex items-center gap-3 py-3"><Skeleton className="size-10 rounded-full" /><div className="flex-1"><Skeleton className="h-4 w-32" /><Skeleton className="mt-2 h-3 w-48" /></div><Skeleton className="h-8 w-20" /></li>)}</ul>
          ) : candidates.isError ? (
            <ErrorState compact title="We couldn't load workers" error={candidates.error} onRetry={() => void candidates.refetch()} retrying={candidates.isRefetching} />
          ) : list.length === 0 ? (
            <EmptyState compact icon={UserPlus} title={poolOnly ? "No one in your pool matches" : "No workers match"} description={poolOnly ? "Switch off the talent-pool filter to see everyone with this skill." : "Try a shorter search."} />
          ) : (
            <ul className="divide-y divide-border">
              {list.map((c) => (
                <li key={c.worker.id} className="flex items-center gap-3 py-3">
                  <Link href={`/employer/talent/${c.worker.id}`} className="shrink-0 rounded-full"><WorkerAvatar worker={c.worker} size="md" /></Link>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <Link href={`/employer/talent/${c.worker.id}`} className="truncate text-sm font-semibold text-fg hover:text-navy-800">{c.worker.firstName} {c.worker.lastName}</Link>
                      <VerifiedMark verifications={c.worker.verifications} />
                      {poolIds.has(c.worker.id) ? <Badge tone="amber"><Star className="fill-current" /> Pool</Badge> : null}
                    </div>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-fg-muted">
                      <Rating value={c.worker.rating} count={c.worker.ratingCount} />
                      <span className="tabular">{c.worker.reliability}% reliable</span>
                      <span>{c.worker.district}</span>
                    </p>
                    {c.reasons[0] ? <p className="mt-0.5 truncate text-xs text-success-700">✓ {c.reasons[0]}</p> : null}
                  </div>
                  <InviteButton shiftId={shift.id} shiftTitle={shift.title} worker={c.worker} className="h-11 sm:h-8" />
                </li>
              ))}
            </ul>
          )}
        </div>
      </SheetContent>
    </Dialog>
  );
}
