"use client";

import { motion } from "motion/react";
import { Briefcase, Quote } from "lucide-react";
import { useMemo } from "react";
import { RoleIcon } from "@/components/common/role-icon";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Rating } from "@/components/ui/rating";
import { Skeleton } from "@/components/ui/skeleton";
import { ROLES } from "@/data/roles";
import { useEmployers } from "@/features/employers";
import { cn, formatDate } from "@/lib/utils";
import type { Worker } from "@/types";
import { staggerItem, useEntranceOnce } from "./motion";

interface Props { worker: Worker; employerId: string }

export function WorkerHistoryTab({ worker, employerId }: Props) {
  const employers = useEmployers();
  const names = useMemo(() => new Map(employers.data?.map((e) => [e.id, e.name]) ?? []), [employers.data]);
  const items = useMemo(() => [...worker.history].sort((a, b) => b.date.localeCompare(a.date)), [worker.history]);
  const animate = useEntranceOnce(true);

  if (items.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={Briefcase}
          title={`${worker.firstName} hasn't completed a shift yet`}
          description="New professionals build their history one shift at a time. Their verification status is the best signal for now."
        />
      </Card>
    );
  }

  return (
    <Card>
      <ol className="divide-y divide-border">
        {items.map((h, i) => {
          const withYou = h.employerId === employerId;
          return (
            <motion.li key={h.id} {...staggerItem(i, animate)} className={cn("flex gap-3 p-4 sm:gap-4 sm:p-5", withYou && "bg-amber-50/40")}>
              <RoleIcon role={h.role} size="sm" className="mt-0.5" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-fg">
                      {h.title}
                      {withYou ? <Badge tone="amber">With you</Badge> : null}
                    </p>
                    <p className="mt-0.5 text-[13px] text-fg-muted">
                      {employers.isPending ? <Skeleton className="inline-block h-3 w-28 align-middle" /> : names.get(h.employerId) ?? "GigSyc employer"}
                      {" · "}{ROLES[h.role].label}
                    </p>
                  </div>
                  <div className="shrink-0 text-right text-[13px] text-fg-muted">
                    <p className="text-fg">{formatDate(h.date)}</p>
                    <p className="tabular">{h.hours}h</p>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                  {typeof h.rating === "number" ? <Rating value={h.rating} /> : <span className="text-xs text-fg-subtle">Not rated</span>}
                </div>
                {h.feedback ? (
                  <blockquote className="mt-2 flex gap-2 text-[13px] leading-5 text-fg">
                    <Quote className="mt-0.5 size-3.5 shrink-0 text-fg-subtle" aria-hidden />
                    <span>“{h.feedback}”</span>
                  </blockquote>
                ) : null}
              </div>
            </motion.li>
          );
        })}
      </ol>
    </Card>
  );
}
