"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Handshake } from "lucide-react";
import { EmployerMark } from "@/components/ui/avatar";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Progress } from "@/components/ui/progress";
import { useStaggerOnce } from "@/lib/motion";
import { formatNumber, pluralize } from "@/lib/utils";
import type { OrganiserRow } from "./use-platform-analytics";

/** Top five partners by published events. The bar is relative to the busiest of them, not a target. */
export function BusiestOrganisers({ rows }: { rows: OrganiserRow[] }) {
  const stagger = useStaggerOnce(rows.length > 0);
  const max = rows[0]?.published ?? 1;

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Busiest organisers</CardTitle>
        <CardDescription>Partners with the most events live on the public site</CardDescription>
      </CardHeader>

      {rows.length === 0 ? (
        <EmptyState
          compact
          icon={Handshake}
          title="No partner has a live event"
          description="Organisers appear here as soon as one of their events is published."
        />
      ) : (
        <ul className="mt-3 divide-y divide-border">
          {rows.map(({ partner, published, attending }, i) => (
            <motion.li key={partner.id} {...stagger(i)} className="flex items-center gap-3 px-5 py-3.5">
              <EmployerMark employer={partner} size="sm" />
              <div className="min-w-0 flex-1">
                <Link href={`/admin/events?q=${encodeURIComponent(partner.name)}`} className="block truncate font-medium text-fg hover:underline">
                  {partner.name}
                </Link>
                <p className="mt-1 text-xs text-fg-muted">
                  <span className="tabular">{formatNumber(attending)}</span> people registered across them
                </p>
                <Progress value={(published / max) * 100} className="mt-2" label={`${partner.name}: ${pluralize(published, "published event")}`} />
              </div>
              <span className="shrink-0 text-right">
                <span className="block font-display text-lg font-semibold leading-none tabular text-navy-900">{published}</span>
                <span className="mt-1 block text-xs text-fg-subtle">{published === 1 ? "event" : "events"}</span>
              </span>
            </motion.li>
          ))}
        </ul>
      )}
    </Card>
  );
}
