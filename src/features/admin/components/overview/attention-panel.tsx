"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { CalendarClock, CheckCircle2, ChevronRight, Flag, Handshake, TriangleAlert, UserPlus, type LucideIcon } from "lucide-react";
import { Card, Skeleton } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { AttentionKind, AttentionRow } from "../../hooks/use-admin-overview";
import { useStaggerOnce } from "@/lib/motion";

const LOOK: Record<AttentionKind, { icon: LucideIcon; tint: string }> = {
  moderation: { icon: Flag, tint: "bg-danger-50 text-danger-600" },
  service: { icon: TriangleAlert, tint: "bg-warning-50 text-warning-700" },
  review_queue: { icon: CalendarClock, tint: "bg-navy-50 text-navy-700" },
  partners: { icon: Handshake, tint: "bg-cyan-50 text-cyan-700" },
  users: { icon: UserPlus, tint: "bg-ink-100 text-ink-700" },
};

/**
 * The first thing on the console, deliberately rows and not tiles: a KPI wall tells you how
 * the platform is doing, this tells you what to do next. Rows with nothing in them are hidden.
 */
export function AttentionPanel({ rows }: { rows: AttentionRow[] }) {
  const stagger = useStaggerOnce(rows.length > 0);

  return (
    <Card>
      <h2 className="px-5 pt-5 text-lg font-semibold">Needs attention</h2>
      {rows.length === 0 ? (
        <p className="flex items-center gap-2 px-5 pb-5 pt-2 text-sm text-fg-muted">
          <CheckCircle2 className="size-4 text-success-600" aria-hidden />
          Nothing needs you right now.
        </p>
      ) : (
        <ul className="mt-2 divide-y divide-border">
          {rows.map((row, i) => {
            const { icon: Icon, tint } = LOOK[row.kind];
            return (
              <motion.li key={row.id} {...stagger(i)}>
                <Link
                  href={row.href}
                  className="group flex min-h-11 items-start gap-3 px-5 py-3.5 transition-colors hover:bg-ink-50 focus-visible:outline-none focus-visible:bg-ink-50"
                >
                  <span className={cn("inline-flex size-9 shrink-0 items-center justify-center rounded-md", tint)} aria-hidden>
                    <Icon className="size-[18px]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm leading-5 text-fg">
                      <strong className="font-semibold tabular">{row.lead}</strong> {row.label}
                    </span>
                    <span className="mt-0.5 block text-[13px] leading-5 text-fg-muted">{row.detail}</span>
                  </span>
                  <ChevronRight className="mt-1.5 size-4 shrink-0 text-fg-subtle transition-transform group-hover:translate-x-0.5" aria-hidden />
                </Link>
              </motion.li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

export function AttentionPanelSkeleton() {
  return (
    <Card aria-hidden>
      <Skeleton className="mx-5 mt-5 h-5 w-36" />
      <div className="mt-4 divide-y divide-border">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="flex items-start gap-3 px-5 py-3.5">
            <Skeleton className="size-9 rounded-md" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-64 max-w-full" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
