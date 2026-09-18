"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { AlertTriangle, CheckCircle2, ChevronRight, ClipboardCheck, CreditCard, FilePenLine, Hourglass, Star, UserPlus, type LucideIcon } from "lucide-react";
import { SectionHeading } from "@/components/ui/page-header";
import { useStaggerOnce } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { AttentionItem, AttentionKind } from "../use-dashboard";

const ICON: Record<AttentionKind, LucideIcon> = {
  event_changes: FilePenLine,
  event_review: Hourglass,
  applications: UserPlus,
  attendance: ClipboardCheck,
  staffing: AlertTriangle,
  review: Star,
  invoice: CreditCard,
};

/** Both sides of the business, events first. Cards, not a queue — this is a desk, not an inbox. */
export function NeedsAttention({ items }: { items: AttentionItem[] }) {
  const stagger = useStaggerOnce(items.length > 0);

  return (
    <section aria-labelledby="needs-attention">
      <SectionHeading
        title={<span id="needs-attention">Needs attention</span>}
        description={items.length ? `${items.length} ${items.length === 1 ? "thing" : "things"} waiting on you` : undefined}
        className="mb-3"
      />
      {items.length === 0 ? (
        <p className="flex items-center gap-2.5 rounded-lg bg-surface px-5 py-4 text-sm text-fg-muted shadow-card">
          <CheckCircle2 className="size-4 text-success-600" aria-hidden />
          Nothing needs you right now — enjoy it.
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item, i) => {
            const Icon = ICON[item.kind];
            return (
              <motion.li key={item.id} {...stagger(i)}>
                <Link
                  href={item.href}
                  className="group flex h-full items-start gap-3 rounded-lg bg-surface p-4 shadow-card transition-[box-shadow,transform] duration-200 hover:-translate-y-px hover:shadow-raised focus-visible:outline-none focus-visible:shadow-focus"
                >
                  <span className={cn("mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-md", item.urgent ? "bg-amber-100 text-amber-900" : "bg-navy-50 text-navy-800")}>
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold leading-5 text-fg group-hover:text-navy-800">{item.title}</span>
                    <span className="mt-0.5 block text-[13px] leading-5 text-fg-muted">{item.description}</span>
                  </span>
                  <ChevronRight className="mt-1 size-4 shrink-0 text-fg-subtle transition-transform group-hover:translate-x-0.5" aria-hidden />
                </Link>
              </motion.li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
