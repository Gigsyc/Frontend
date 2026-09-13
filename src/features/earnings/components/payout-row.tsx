"use client";

import { ChevronRight } from "lucide-react";
import { EmployerMark, PayoutStatusBadge } from "@/components/ui";
import { formatDate, formatDayShort, formatRwf } from "@/lib/utils";
import type { PayoutItem } from "../types";

interface PayoutRowProps {
  item: PayoutItem;
  onOpen: (item: PayoutItem) => void;
}

/** One payout. Tapping opens the detail dialog. */
export function PayoutRow({ item, onOpen }: PayoutRowProps) {
  const { payout, shift, employer } = item;
  const paid = payout.status === "paid";
  const when = paid
    ? `Paid ${formatDate(payout.paidAt ?? payout.scheduledFor)}`
    : `Expected ${formatDayShort(payout.scheduledFor)}`;

  return (
    <button
      type="button"
      onClick={() => onOpen(item)}
      className="flex min-h-[64px] w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-ink-50 focus-visible:outline-none focus-visible:shadow-focus"
      aria-label={`${shift.title}, ${formatRwf(payout.amount)}, ${when}`}
    >
      {employer ? <EmployerMark employer={employer} size="sm" /> : <span className="size-8 shrink-0 rounded-md bg-ink-100" aria-hidden />}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-semibold text-fg">{shift.title}</span>
        <span className="block truncate text-[13px] text-fg-muted">
          {employer?.name ?? "Employer"} · {formatDate(shift.date)}
        </span>
        <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
          <PayoutStatusBadge status={payout.status} />
          <span className="text-xs text-fg-muted">{when}</span>
          <span className="font-mono text-[11px] text-fg-subtle tabular">{payout.reference}</span>
        </span>
      </span>
      <span className="shrink-0 text-right">
        <span className="block font-display text-[15px] font-semibold text-navy-900 tabular">{formatRwf(payout.amount)}</span>
      </span>
      <ChevronRight className="size-4 shrink-0 text-fg-subtle" aria-hidden />
    </button>
  );
}
