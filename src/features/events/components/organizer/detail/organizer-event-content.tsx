"use client";

import { Accessibility, Check, Info, Ticket } from "lucide-react";
import { motion } from "motion/react";
import { Card } from "@/components/ui";
import { useStaggerOnce } from "@/lib/motion";
import { formatRwf } from "@/lib/utils";
import type { Event } from "@/types";
import { StaffedShiftsCard } from "./staffed-shifts-card";

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={`${id}-heading`} className="space-y-3">
      <h2 id={`${id}-heading`} className="text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}

/** Tiers as the partner entered them — name, price, note. No "lowest price" nudge; that's for guests. */
function TicketsTable({ event }: { event: Event }) {
  return (
    <Card className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs font-medium text-fg-muted">
            <th scope="col" className="px-5 py-3 font-medium">Tier</th>
            <th scope="col" className="px-5 py-3 text-right font-medium">Price</th>
            <th scope="col" className="hidden px-5 py-3 font-medium sm:table-cell">Description</th>
          </tr>
        </thead>
        <tbody>
          {event.tickets.map((t) => (
            <tr key={t.id} className="border-b border-border last:border-0">
              <td className="px-5 py-3">
                <span className="inline-flex items-center gap-2 font-medium text-fg"><Ticket className="size-4 text-navy-700" aria-hidden />{t.name}</span>
                {t.description ? <p className="mt-0.5 text-xs text-fg-muted sm:hidden">{t.description}</p> : null}
              </td>
              <td className="whitespace-nowrap px-5 py-3 text-right font-display font-semibold text-navy-900 tabular">{t.price === 0 ? "Free" : formatRwf(t.price)}</td>
              <td className="hidden px-5 py-3 text-fg-muted sm:table-cell">{t.description ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

/** Left column: what guests will read, as the partner wrote it. */
export function OrganizerEventContent({ event }: { event: Event }) {
  const stagger = useStaggerOnce(true);
  const hasGoodToKnow = event.goodToKnow.length > 0 || !!event.ageRestriction;

  return (
    <div className="space-y-8">
      <Section id="about" title="About">
        <p className="max-w-2xl text-[15px] leading-relaxed text-fg-muted">{event.description}</p>
      </Section>

      {event.highlights.length > 0 ? (
        <Section id="expect" title="What to expect">
          <ul className="grid gap-2.5 sm:grid-cols-2">
            {event.highlights.map((h, i) => (
              <motion.li key={h} {...stagger(i)} className="flex items-start gap-2.5 text-sm text-fg">
                <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-success-50 text-success-600">
                  <Check className="size-3.5" strokeWidth={3} aria-hidden />
                </span>
                {h}
              </motion.li>
            ))}
          </ul>
        </Section>
      ) : null}

      {event.attendanceMode === "tickets" && event.tickets.length > 0 ? (
        <Section id="tickets" title="Tickets"><TicketsTable event={event} /></Section>
      ) : null}

      {hasGoodToKnow ? (
        <Section id="good-to-know" title="Good to know">
          <Card className="p-4 sm:p-5">
            <ul className="space-y-2.5">
              {event.ageRestriction ? (
                <li className="flex items-start gap-2.5 text-sm">
                  <Info className="mt-0.5 size-4 shrink-0 text-amber-600" aria-hidden />
                  <span><span className="font-medium">{event.ageRestriction}</span> — guests are told to bring photo ID.</span>
                </li>
              ) : null}
              {event.goodToKnow.map((note) => (
                <li key={note} className="flex items-start gap-2.5 text-sm text-fg-muted">
                  <Info className="mt-0.5 size-4 shrink-0 text-fg-subtle" aria-hidden />{note}
                </li>
              ))}
            </ul>
          </Card>
        </Section>
      ) : null}

      {event.accessibility.length > 0 ? (
        <Section id="access" title="Accessibility">
          <Card className="p-4 sm:p-5">
            <ul className="space-y-2">
              {event.accessibility.map((a) => (
                <li key={a} className="flex items-start gap-2.5 text-sm text-fg-muted">
                  <Accessibility className="mt-0.5 size-4 shrink-0 text-navy-700" aria-hidden />{a}
                </li>
              ))}
            </ul>
          </Card>
        </Section>
      ) : null}

      {event.staffedShiftIds.length > 0 ? <StaffedShiftsCard shiftIds={event.staffedShiftIds} /> : null}
    </div>
  );
}
