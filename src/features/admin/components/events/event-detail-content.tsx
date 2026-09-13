"use client";

import type { ReactNode } from "react";
import { Accessibility, Check, Info, Ticket } from "lucide-react";
import { Card, Photo } from "@/components/ui";
import { formatNumber, formatRwf } from "@/lib/utils";
import type { Event } from "@/types";

function Section({ title, icon, children }: { title: string; icon?: ReactNode; children: ReactNode }) {
  return (
    <section className="space-y-2.5">
      <h3 className="flex items-center gap-2 text-base font-semibold [&_svg]:size-4 [&_svg]:text-fg-subtle">{icon}{title}</h3>
      {children}
    </section>
  );
}

function Bullets({ items, marker = "check" }: { items: string[]; marker?: "check" | "dot" }) {
  return (
    <ul className="space-y-1.5 text-sm text-fg-muted">
      {items.map((item) => (
        <li key={item} className="flex gap-2.5">
          {marker === "check"
            ? <Check className="mt-0.5 size-4 shrink-0 text-success-600" aria-hidden />
            : <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-ink-300" aria-hidden />}
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** The organiser's submission, laid out for one pass of reading rather than for selling. */
export function EventDetailContent({ event }: { event: Event }) {
  const ticketed = event.tickets.length > 0;

  return (
    <Card className="space-y-6 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <Photo src={event.coverImage} alt={`Cover image submitted for ${event.title}`} aspect="video" sizes="360px" className="w-full shrink-0 sm:max-w-[360px]" />
        <p className="text-[15px] leading-6 text-fg">{event.tagline}</p>
      </div>

      <Section title="Description">
        <p className="whitespace-pre-line text-sm leading-6 text-fg-muted">{event.description}</p>
      </Section>

      {event.highlights.length > 0 ? (
        <Section title="What the organiser promises">
          <Bullets items={event.highlights} />
        </Section>
      ) : null}

      <Section title="Entry" icon={<Ticket aria-hidden />}>
        {ticketed ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs font-medium text-fg-muted">
                  <th scope="col" className="py-2 pr-4 font-medium">Tier</th>
                  <th scope="col" className="py-2 pr-4 font-medium">Included</th>
                  <th scope="col" className="py-2 pl-4 text-right font-medium">Price</th>
                </tr>
              </thead>
              <tbody>
                {event.tickets.map((t) => (
                  <tr key={t.id} className="border-b border-border last:border-0">
                    <td className="py-2.5 pr-4 font-medium text-fg">
                      {t.name}
                      {t.soldOut ? <span className="ml-2 text-xs font-normal text-danger-600">Sold out</span> : null}
                    </td>
                    <td className="py-2.5 pr-4 text-fg-muted">{t.description ?? "—"}</td>
                    <td className="py-2.5 pl-4 text-right font-medium tabular text-navy-900">{t.price === 0 ? "Free" : formatRwf(t.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-fg-muted">
            {event.attendanceMode === "register" ? "Free, but guests register in advance." : "Free entry, no registration."}
          </p>
        )}
        <p className="text-sm text-fg-muted">
          Capacity <span className="font-medium tabular text-fg">{formatNumber(event.capacity)}</span>
          {event.attending > 0 ? <> · <span className="tabular">{formatNumber(event.attending)}</span> going so far</> : null}
          {event.ageRestriction ? <> · <span className="font-medium text-fg">{event.ageRestriction}</span></> : <> · no age restriction declared</>}
        </p>
      </Section>

      {event.accessibility.length > 0 ? (
        <Section title="Accessibility" icon={<Accessibility aria-hidden />}>
          <Bullets items={event.accessibility} marker="dot" />
        </Section>
      ) : null}

      {event.goodToKnow.length > 0 ? (
        <Section title="Good to know" icon={<Info aria-hidden />}>
          <Bullets items={event.goodToKnow} marker="dot" />
        </Section>
      ) : null}
    </Card>
  );
}
