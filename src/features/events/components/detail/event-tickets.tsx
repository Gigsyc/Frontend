"use client";

import { Ticket } from "lucide-react";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn, formatRwf, pluralize } from "@/lib/utils";
import type { Event } from "@/types";
import { cheapestTier, stagger } from "./utils";

/**
 * Ticket tiers as rows, cheapest first and visually primary — the entry price is the
 * number people compare, so it should never be the one buried at the bottom.
 */
export function EventTickets({ event }: { event: Event }) {
  if (event.attendanceMode !== "tickets" || event.tickets.length === 0) return null;
  const best = cheapestTier(event.tickets);
  const tiers = [...event.tickets].sort((a, b) => a.price - b.price);
  const closed = event.status === "cancelled" || event.status === "completed";

  return (
    <section aria-labelledby="tickets-heading" className="space-y-4">
      <h2 id="tickets-heading" className="text-lg font-semibold">Tickets</h2>
      <ul className="space-y-2.5">
        {tiers.map((tier, i) => {
          const primary = !closed && tier.id === best?.id;
          const soldOut = tier.soldOut === true || tier.remaining === 0;
          return (
            <motion.li key={tier.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={stagger(i)}>
              <Card
                className={cn(
                  "flex flex-wrap items-center justify-between gap-x-4 gap-y-2 p-4",
                  primary && "ring-1 ring-navy-900",
                  soldOut && "opacity-70",
                )}
              >
                <div className="flex min-w-0 items-start gap-3">
                  <span className={cn("mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-md", primary ? "bg-navy-900 text-white" : "bg-navy-50 text-navy-800")}>
                    <Ticket className="size-4" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 text-[15px] font-semibold">
                      {tier.name}
                      {primary ? <Badge tone="navy">Best value</Badge> : null}
                      {soldOut ? <Badge tone="danger">Sold out</Badge> : null}
                    </p>
                    {tier.description ? <p className="mt-0.5 text-[13px] text-fg-muted">{tier.description}</p> : null}
                  </div>
                </div>
                <div className="ml-11 text-right sm:ml-0">
                  <p className={cn("font-display text-lg font-semibold tabular", tier.price === 0 ? "text-success-700" : "text-navy-900")}>
                    {tier.price === 0 ? "Free" : formatRwf(tier.price)}
                  </p>
                  {!soldOut && tier.remaining !== undefined ? (
                    <p className="mt-0.5 text-xs text-amber-700">{pluralize(tier.remaining, "left", "left")}</p>
                  ) : null}
                </div>
              </Card>
            </motion.li>
          );
        })}
      </ul>
      <p className="text-[13px] text-fg-subtle">Tickets are held at the door under your name. Payment is on arrival in this prototype.</p>
    </section>
  );
}
