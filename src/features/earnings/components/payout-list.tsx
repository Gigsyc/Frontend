"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Compass, Wallet } from "lucide-react";
import { Button, EmptyState, SectionHeading } from "@/components/ui";
import { formatRwf, pluralize } from "@/lib/utils";
import type { PayoutItem, WorkerEarnings } from "../types";
import { PayoutRow } from "./payout-row";

const EASE = [0.22, 1, 0.36, 1] as const;

interface PayoutListProps {
  earnings: WorkerEarnings;
  onOpen: (item: PayoutItem) => void;
}

/** Payouts grouped by state: money on its way first, then what has landed. */
export function PayoutList({ earnings, onOpen }: PayoutListProps) {
  const { waiting, paid } = earnings;

  if (waiting.length === 0 && paid.length === 0) {
    return (
      <EmptyState
        icon={Wallet}
        title="No payouts yet"
        description="Complete a shift and check out. Once the employer approves your hours, the payout appears here and lands on your MoMo."
        action={<Button asChild variant="secondary"><Link href="/worker"><Compass /> Find a shift</Link></Button>}
      />
    );
  }

  let index = 0;
  const row = (item: PayoutItem) => (
    <motion.div
      key={item.payout.id}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index++, 8) * 0.03, ease: EASE }}
    >
      <PayoutRow item={item} onOpen={onOpen} />
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {waiting.length > 0 ? (
        <section aria-labelledby="payouts-waiting" className="space-y-3">
          <SectionHeading
            title={<span id="payouts-waiting">On its way</span>}
            description={`${formatRwf(earnings.pending)} across ${pluralize(waiting.length, "shift")}. Employers usually approve within 48 hours.`}
          />
          <div className="divide-y divide-border rounded-lg bg-surface shadow-card">{waiting.map(row)}</div>
        </section>
      ) : null}

      <section aria-labelledby="payouts-paid" className="space-y-3">
        <SectionHeading
          title={<span id="payouts-paid">Paid</span>}
          description={paid.length ? `${pluralize(paid.length, "payout")} · newest first` : "Nothing paid out yet."}
        />
        {paid.length ? (
          <div className="divide-y divide-border rounded-lg bg-surface shadow-card">{paid.map(row)}</div>
        ) : (
          <p className="rounded-lg bg-surface px-4 py-6 text-center text-sm text-fg-muted shadow-card">Your first payout will show here once an employer approves a completed shift.</p>
        )}
      </section>
    </div>
  );
}
