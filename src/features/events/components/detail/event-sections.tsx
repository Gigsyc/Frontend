"use client";

import { Accessibility, Check, ExternalLink, Info, MapPin } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataList } from "@/components/ui/data-list";
import { formatTimeRange } from "@/lib/utils";
import type { Event } from "@/types";
import { eventHours, formatHours, fullDateLabel, isMultiDay, mapsUrl, stagger } from "./utils";

/** "About this event" + the what-to-expect checklist. */
export function EventAbout({ event }: { event: Event }) {
  return (
    <section aria-labelledby="about-heading" className="space-y-4">
      <h2 id="about-heading" className="text-lg font-semibold">About this event</h2>
      <p className="max-w-2xl text-[15px] leading-relaxed text-fg-muted">{event.description}</p>

      {event.highlights.length > 0 ? (
        <div className="pt-1">
          <h3 className="text-base font-semibold">What to expect</h3>
          <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
            {event.highlights.map((h, i) => (
              <motion.li
                key={h}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={stagger(i)}
                className="flex items-start gap-2.5 text-sm text-fg"
              >
                <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-success-50 text-success-600">
                  <Check className="size-3.5" strokeWidth={3} aria-hidden />
                </span>
                {h}
              </motion.li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

/** Every practical fact about when and where, and a hand-off to real directions. */
export function EventWhenWhere({ event }: { event: Event }) {
  const multiDay = isMultiDay(event);
  const hours = formatHours(eventHours(event));

  return (
    <section aria-labelledby="when-where-heading" className="space-y-4">
      <h2 id="when-where-heading" className="text-lg font-semibold">When &amp; where</h2>
      <Card className="p-4 sm:p-5">
        <DataList
          columns={2}
          items={[
            { label: multiDay ? "Dates" : "Date", value: fullDateLabel(event) },
            { label: "Doors open", value: event.doorsOpen ? event.doorsOpen : "At the start time" },
            {
              label: multiDay ? "Each day" : "Time",
              value: <span className="tabular">{formatTimeRange(event.startTime, event.endTime)} · {hours}</span>,
            },
            { label: "Venue", value: event.venue },
          ]}
        />

        <div className="mt-5 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-start gap-2.5 text-sm text-fg-muted">
            <MapPin className="mt-0.5 size-4 shrink-0 text-navy-700" aria-hidden />
            <span>{event.address}, {event.place}</span>
          </p>
          <Button variant="outline" size="sm" className="h-11 shrink-0 sm:h-8" asChild>
            <a href={mapsUrl(event)} target="_blank" rel="noopener noreferrer">
              Get directions <ExternalLink aria-hidden />
            </a>
          </Button>
        </div>
      </Card>
    </section>
  );
}

/** Practical notes, age limit and access — the questions support gets asked most. */
export function EventGoodToKnow({ event }: { event: Event }) {
  const hasAccess = event.accessibility.length > 0;
  if (event.goodToKnow.length === 0 && !event.ageRestriction && !hasAccess) return null;

  return (
    <section aria-labelledby="good-to-know-heading" className="space-y-4">
      <h2 id="good-to-know-heading" className="text-lg font-semibold">Good to know</h2>
      <Card className="space-y-4 p-4 sm:p-5">
        <ul className="space-y-2.5">
          {event.ageRestriction ? (
            <li className="flex items-start gap-2.5 text-sm">
              <Info className="mt-0.5 size-4 shrink-0 text-amber-600" aria-hidden />
              <span><span className="font-medium">{event.ageRestriction}</span> — bring photo ID, it is checked at the gate.</span>
            </li>
          ) : null}
          {event.goodToKnow.map((note) => (
            <li key={note} className="flex items-start gap-2.5 text-sm text-fg-muted">
              <Info className="mt-0.5 size-4 shrink-0 text-fg-subtle" aria-hidden />
              {note}
            </li>
          ))}
        </ul>

        {hasAccess ? (
          <div className="border-t border-border pt-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Accessibility className="size-4 text-navy-700" aria-hidden /> Accessibility
            </h3>
            <ul className="mt-2.5 space-y-2">
              {event.accessibility.map((a) => (
                <li key={a} className="flex items-start gap-2.5 text-sm text-fg-muted">
                  <Check className="mt-0.5 size-4 shrink-0 text-success-600" strokeWidth={2.5} aria-hidden />
                  {a}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </Card>
    </section>
  );
}
