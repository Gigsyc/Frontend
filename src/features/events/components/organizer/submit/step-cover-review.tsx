"use client";

import { Clock3 } from "lucide-react";
import { EventCard, eventDateLabel, eventPriceLabel } from "@/components/common";
import { Card, CardContent, DataList } from "@/components/ui";
import { formatTimeRange } from "@/lib/utils";
import type { Employer } from "@/types";
import { previewEvent } from "./build-event";
import { CoverPicker } from "./cover-picker";
import type { SubmitState } from "./state";
import { runsLabel, type StepErrors } from "./validation";

interface StepCoverReviewProps {
  state: SubmitState;
  errors: StepErrors;
  set: (patch: Partial<SubmitState>) => void;
  employer?: Employer;
  employerId: string;
}

const MODE_LABEL = { free: "Free entry", register: "Free, with registration", tickets: "Ticketed" } as const;

export function StepCoverReview({ state, errors, set, employer, employerId }: StepCoverReviewProps) {
  const event = previewEvent(state, employerId);
  const entry = state.attendanceMode === "tickets" ? `${MODE_LABEL.tickets} · ${eventPriceLabel(event)}` : MODE_LABEL[state.attendanceMode];
  const accessibility = event.accessibility.length ? event.accessibility.join(" · ") : "Not specified";

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      <div className="lg:col-span-3">
        <CoverPicker cover={state.coverImage} gallery={state.gallery} onChange={(patch) => set(patch)} error={errors.coverImage} />
      </div>

      <div className="space-y-4 lg:col-span-2">
        <div>
          <h2 className="text-base font-semibold">How it will look on GigSyc</h2>
          <p className="mt-0.5 text-sm text-fg-muted">This is the card guests see on Events. Tap Back to change anything.</p>
        </div>
        <EventCard event={event} organizerName={employer?.name} className="pointer-events-none" />
        <Card>
          <CardContent>
            <DataList
              items={[
                { label: "When", value: `${eventDateLabel(event)} · ${formatTimeRange(event.startTime, event.endTime)}${event.doorsOpen ? ` · doors ${event.doorsOpen}` : ""}` },
                { label: "Length", value: runsLabel(state) ?? "—" },
                { label: "Where", value: `${event.venue}, ${event.place}` },
                { label: "Entry", value: entry },
                { label: "Capacity", value: `${event.capacity.toLocaleString("en-US")} guests${event.ageRestriction ? ` · ${event.ageRestriction}` : ""}` },
                { label: "Accessibility", value: accessibility },
              ]}
            />
          </CardContent>
        </Card>
        <div className="flex gap-3 rounded-lg border border-navy-100 bg-navy-50 p-4">
          <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-surface text-navy-800">
            <Clock3 className="size-4" aria-hidden />
          </span>
          <div className="text-sm">
            <p className="font-semibold text-navy-900">What happens next</p>
            <p className="mt-0.5 leading-5 text-fg-muted">
              GigSyc reviews every event, usually within a day. You&apos;ll get a notification when it&apos;s live or if anything needs changing. Nothing is public until then.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
