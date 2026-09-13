"use client";

import { motion } from "motion/react";
import { CheckCheck, X, XCircle } from "lucide-react";
import { Button } from "@/components/ui";
import { pluralize } from "@/lib/utils";
import { EASE } from "@/lib/motion";

interface Props {
  count: number;
  onApprove: () => void;
  onReject: () => void;
  onClear: () => void;
  busy: boolean;
}

/**
 * Appears only once something is ticked, and only on the review queue where approving a
 * batch is a real morning job. Hidden under md, where the table is a stack of cards.
 */
export function BulkActionBar({ count, onApprove, onReject, onClear, busy }: Props) {
  if (count === 0) return null;
  return (
    <motion.div
      role="region"
      aria-label="Bulk review actions"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: EASE }}
      className="sticky bottom-4 z-30 mx-auto hidden w-fit max-w-full items-center gap-2 rounded-lg bg-navy-900 py-2 pl-4 pr-2 text-sm text-white shadow-pop md:flex"
    >
      <span className="mr-1 tabular">{pluralize(count, "event")} selected</span>
      <Button size="sm" variant="accent" onClick={onApprove} disabled={busy}><CheckCheck /> Approve &amp; publish</Button>
      <Button size="sm" variant="on-dark" onClick={onReject} disabled={busy}><XCircle /> Reject</Button>
      <Button size="icon-sm" variant="ghost" aria-label="Clear selection" onClick={onClear} className="text-white hover:bg-white/10"><X /></Button>
    </motion.div>
  );
}
