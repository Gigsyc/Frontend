"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ShiftCard, ShiftCardSkeleton } from "@/components/common/shift-card";
import { SectionHeading } from "@/components/ui/page-header";
import { ROLES } from "@/data/roles";
import { useEmployers } from "@/features/employers/queries";
import type { Shift } from "@/types";
import { useOpenShifts } from "../../queries";

/** Two more open shifts in the same role. Quietly disappears if there are none. */
export function SimilarShifts({ shift }: { shift: Shift }) {
  const similar = useOpenShifts({ roles: [shift.role], sort: "soonest" });
  const employers = useEmployers();
  const byId = useMemo(() => new Map((employers.data ?? []).map((e) => [e.id, e])), [employers.data]);
  const items = useMemo(() => (similar.data ?? []).filter((s) => s.id !== shift.id).slice(0, 2), [similar.data, shift.id]);

  if (similar.isError || (!similar.isPending && items.length === 0)) return null;

  return (
    <section className="space-y-3" aria-label="Similar shifts">
      <SectionHeading
        title="Similar shifts"
        description={`More ${ROLES[shift.role].label.toLowerCase()} work coming up`}
        action={<Link href={`/worker?roles=${shift.role}`} className="text-sm font-medium text-navy-700 underline-offset-4 hover:underline">See all</Link>}
      />
      {similar.isPending ? (
        <div className="space-y-3">{[0, 1].map((i) => <ShiftCardSkeleton key={i} layout="horizontal" />)}</div>
      ) : (
        <ul className="space-y-3">
          {items.map((s) => (
            <li key={s.id}><ShiftCard shift={s} employer={byId.get(s.employerId)} href={`/worker/shifts/${s.id}`} layout="horizontal" /></li>
          ))}
        </ul>
      )}
    </section>
  );
}
