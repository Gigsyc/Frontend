"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { CheckCheck, Flag, History, UserPlus, type LucideIcon } from "lucide-react";
import { EmptyState } from "@/components/ui";
import { cn, formatTimeAgo } from "@/lib/utils";
import type { ActivityItem } from "../../hooks/use-admin-overview";
import { useStaggerOnce } from "@/lib/motion";
import { Panel } from "./panel";

const LOOK: Record<ActivityItem["kind"], { icon: LucideIcon; tint: string }> = {
  review: { icon: CheckCheck, tint: "bg-navy-50 text-navy-700" },
  user: { icon: UserPlus, tint: "bg-ink-100 text-ink-600" },
  report: { icon: Flag, tint: "bg-danger-50 text-danger-600" },
};

/** Decisions, sign-ups and reports on one thread, newest first. */
export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  const stagger = useStaggerOnce(items.length > 0);

  return (
    <Panel title="Recent activity">
      {items.length === 0 ? (
        <EmptyState compact icon={History} title="Nothing has happened yet" description="Reviews, new accounts and reports show up here as they land." />
      ) : (
        <ol className="px-5 pb-5 pt-2">
          {items.map((item, i) => {
            const { icon: Icon, tint } = LOOK[item.kind];
            const last = i === items.length - 1;
            return (
              <motion.li key={item.id} {...stagger(i)} className={cn("relative flex gap-3", last ? "pb-0" : "pb-4")}>
                {last ? null : <span className="absolute bottom-0 left-4 top-8 w-px bg-border" aria-hidden />}
                <span className={cn("relative inline-flex size-8 shrink-0 items-center justify-center rounded-full", tint)} aria-hidden>
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0 flex-1 pt-0.5">
                  <Link href={item.href} className="block text-sm leading-5 text-fg hover:text-navy-800">
                    <strong className="font-medium">{item.lead}</strong> {item.rest}
                  </Link>
                  <span className="mt-0.5 block text-xs text-fg-subtle">{formatTimeAgo(item.at)}</span>
                </span>
              </motion.li>
            );
          })}
        </ol>
      )}
    </Panel>
  );
}
