"use client";

import { CalendarDays, Users } from "lucide-react";
import { motion } from "motion/react";
import { eventDateLabel, eventPriceLabel, isEventFree } from "@/components/common";
import { WorkerAvatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { Rating } from "@/components/ui/rating";
import { VerifiedMark } from "@/components/ui/verified";
import { SERVICE_FEE_RATE } from "@/data/roles";
import { useEvents } from "@/features/events";
import { TourFrame, TourRowsSkeleton, listMotion } from "@/features/marketing/components/business/tour-frame";
import { useOpenShifts, useShiftCandidates } from "@/features/shifts";
import { formatRwf } from "@/lib/utils";
import { PREVIEW_INVOICE_SUBTOTAL } from "./content";

/**
 * The two live frames read the same store the public board and the staffing screen read, so
 * a partner is never shown a date or a person that the rest of the product disagrees with.
 */

/** How an event looks to someone browsing the board. */
export function EventsBoardPreview() {
  const events = useEvents({});
  const rows = events.data?.slice(0, 3) ?? [];

  return (
    <TourFrame title="Events · on the public board">
      {events.isError ? (
        <ErrorState compact title="Couldn't load the board" error={events.error} onRetry={() => { void events.refetch(); }} retrying={events.isRefetching} />
      ) : events.isPending ? (
        <TourRowsSkeleton rows={3} />
      ) : rows.length === 0 ? (
        <EmptyState compact icon={CalendarDays} title="Nothing on right now" description="Published events sit here with their date, place and price — yours among them." />
      ) : (
        <ul className="flex flex-col gap-2">
          {rows.map((e, i) => (
            <motion.li
              key={e.id}
              initial={listMotion.initial}
              animate={listMotion.animate}
              transition={listMotion.transition(i)}
              className="flex items-center gap-3 rounded-md border border-border px-3 py-2.5"
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-fg">{e.title}</span>
                <span className="mt-0.5 block truncate text-[13px] text-fg-muted">
                  {eventDateLabel(e)} · {e.startTime} · {e.place}
                </span>
              </span>
              <Badge tone={isEventFree(e) ? "success" : "outline"} className="shrink-0 tabular">{eventPriceLabel(e)}</Badge>
            </motion.li>
          ))}
        </ul>
      )}
    </TourFrame>
  );
}

/** The ranked list a partner confirms staff from. */
export function CandidatesPreview() {
  const shifts = useOpenShifts({});
  const shift = shifts.data?.[0];
  const candidates = useShiftCandidates(shift?.id);
  const top = candidates.data?.slice(0, 3) ?? [];
  const pending = shifts.isPending || (!!shift && candidates.isPending);

  return (
    <TourFrame title={shift ? `Staffing · ${shift.title}` : "Staffing"}>
      {shifts.isError || candidates.isError ? (
        <ErrorState
          compact
          title="Couldn't rank candidates"
          error={shifts.error ?? candidates.error}
          onRetry={() => { void shifts.refetch(); void candidates.refetch(); }}
          retrying={shifts.isRefetching || candidates.isRefetching}
        />
      ) : pending ? (
        <TourRowsSkeleton rows={3} />
      ) : !shift || top.length === 0 ? (
        <EmptyState compact icon={Users} title="Nobody to rank yet" description="Post a role and matching professionals are ranked here by skills, distance and track record." />
      ) : (
        <ul className="flex flex-col gap-2">
          {top.map(({ worker }, i) => (
            <motion.li
              key={worker.id}
              initial={listMotion.initial}
              animate={listMotion.animate}
              transition={listMotion.transition(i)}
              className="flex items-center gap-3 rounded-md border border-border px-3 py-2.5"
            >
              <WorkerAvatar worker={worker} size="sm" />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5">
                  <span className="truncate text-sm font-medium text-fg">{worker.firstName} {worker.lastName}</span>
                  <VerifiedMark verifications={worker.verifications} />
                </span>
                <span className="mt-0.5 flex items-center gap-2 text-[13px] text-fg-muted">
                  <Rating value={worker.rating} count={worker.ratingCount} />
                  <span className="truncate">{worker.district}</span>
                </span>
              </span>
            </motion.li>
          ))}
        </ul>
      )}
    </TourFrame>
  );
}

/** One invoice: what the workers earned, the service fee, the total. */
export function InvoicePreview() {
  const fee = Math.round(PREVIEW_INVOICE_SUBTOTAL * SERVICE_FEE_RATE);
  const rows = [
    { label: "Worker pay · 12 shifts", value: formatRwf(PREVIEW_INVOICE_SUBTOTAL) },
    { label: `Service fee · ${Math.round(SERVICE_FEE_RATE * 100)}%`, value: formatRwf(fee) },
  ];
  return (
    <TourFrame title="Invoice · September, second half">
      <dl className="flex flex-col gap-2.5 px-1 py-0.5">
        {rows.map((r) => (
          <div key={r.label} className="flex items-baseline justify-between gap-4">
            <dt className="text-[13px] text-fg-muted">{r.label}</dt>
            <dd className="text-sm text-fg tabular">{r.value}</dd>
          </div>
        ))}
        <div className="flex items-baseline justify-between gap-4 border-t border-border pt-2.5">
          <dt className="text-sm font-medium text-fg">Total due</dt>
          <dd className="font-display text-base font-semibold text-navy-900 tabular">
            {formatRwf(PREVIEW_INVOICE_SUBTOTAL + fee)}
          </dd>
        </div>
      </dl>
    </TourFrame>
  );
}
