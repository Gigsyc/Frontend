"use client";

import { Bookmark, Check, Share2, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { eventDateLabel, eventPriceLabel } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn, formatNumber, formatTimeRange } from "@/lib/utils";
import type { Event } from "@/types";
import { PRIMARY_ACTION_LABEL, fillPercent, spotsLeft } from "./utils";

export interface ActionProps {
  event: Event;
  attended: boolean;
  saved: boolean;
  savePending: boolean;
  onAttend: () => void;
  onToggleSave: () => void;
}

/** Native share sheet where the browser has one, otherwise the clipboard. */
async function shareEvent(title: string) {
  const url = window.location.href;
  try {
    if (typeof navigator.share === "function") {
      await navigator.share({ title, text: `${title} — on GigSyc`, url });
      return;
    }
    await navigator.clipboard.writeText(url);
    toast.success("Link copied", { description: "Send it to whoever you want to go with." });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") return;
    toast.error("We couldn't share this link. Copy it from the address bar instead.");
  }
}

function PriceHeadline({ event }: { event: Event }) {
  const label = eventPriceLabel(event);
  const free = label === "Free";
  return (
    <div>
      <p className={cn("font-display text-2xl font-semibold leading-none tabular", free ? "text-success-700" : "text-navy-900")}>
        {free ? "Free entry" : label}
      </p>
      {!free ? <p className="mt-1 text-[13px] text-fg-muted">per person</p> : null}
    </div>
  );
}

function AttendanceLine({ event }: { event: Event }) {
  const left = spotsLeft(event);
  const pct = fillPercent(event);
  return (
    <div className="space-y-2">
      <p className="text-[13px] text-fg-muted">
        <span className="font-medium text-fg tabular">{formatNumber(event.attending)}</span> going
        <span className="mx-1.5 text-fg-subtle" aria-hidden>·</span>
        <span className="tabular">{formatNumber(left)}</span> {left === 1 ? "spot" : "spots"} left
      </p>
      {pct > 70 ? (
        <div className="space-y-1">
          <Progress value={pct} tone="amber" label={`${Math.round(pct)}% full`} />
          <p className="text-xs font-medium text-amber-700">Filling up</p>
        </div>
      ) : null}
    </div>
  );
}

/** Cancelled and completed events stay reachable by link, so they must explain themselves. */
function StatusNotice({ event }: { event: Event }) {
  if (event.status === "cancelled") {
    return (
      <div className="rounded-md bg-danger-50 p-3 text-[13px] text-danger-700">
        <p className="flex items-center gap-1.5 font-semibold">
          <TriangleAlert className="size-4 shrink-0" aria-hidden /> This event was cancelled
        </p>
        <p className="mt-1 text-danger-700/90">{event.reviewNote ?? "The organiser called it off. Anyone who paid has been refunded."}</p>
      </div>
    );
  }
  return (
    <div className="rounded-md bg-ink-100 p-3 text-[13px] text-fg-muted">
      <p className="font-semibold text-fg">This event has finished</p>
      <p className="mt-1">It ran on {eventDateLabel(event)}. Have a look at what is coming up below.</p>
    </div>
  );
}

function PrimaryAction({ event, attended, onAttend, size = "lg", className }: Pick<ActionProps, "event" | "attended" | "onAttend"> & { size?: "md" | "lg"; className?: string }) {
  const closed = event.status !== "published";
  if (closed) {
    return <Button size={size} className={className} disabled>{PRIMARY_ACTION_LABEL[event.attendanceMode]}</Button>;
  }
  if (attended) {
    return (
      <Button size={size} variant="secondary" className={cn("pointer-events-none", className)} aria-disabled>
        <Check strokeWidth={2.5} aria-hidden /> You&apos;re going
      </Button>
    );
  }
  return <Button size={size} className={className} onClick={onAttend}>{PRIMARY_ACTION_LABEL[event.attendanceMode]}</Button>;
}

export function EventSecondaryActions({ event, saved, savePending, onToggleSave, className }: Pick<ActionProps, "event" | "saved" | "savePending" | "onToggleSave"> & { className?: string }) {
  return (
    <div className={cn("grid grid-cols-2 gap-2", className)}>
      <Button variant="outline" className="h-11" onClick={onToggleSave} loading={savePending} aria-pressed={saved}>
        <Bookmark className={saved ? "fill-amber-500 text-amber-500" : undefined} aria-hidden /> {saved ? "Saved" : "Save"}
      </Button>
      <Button variant="outline" className="h-11" onClick={() => void shareEvent(event.title)}>
        <Share2 aria-hidden /> Share
      </Button>
    </div>
  );
}

/** Desktop rail: price, when, how full, then the one thing to do next. */
export function EventActionCard(props: ActionProps) {
  const { event, attended, onAttend } = props;
  const live = event.status === "published";
  return (
    <Card className="space-y-4 p-5">
      <PriceHeadline event={event} />
      <p className="text-[13px] text-fg">
        <span className="font-semibold text-amber-700">{eventDateLabel(event)}</span>
        <span className="mx-1.5 text-fg-subtle" aria-hidden>·</span>
        <span className="tabular">{formatTimeRange(event.startTime, event.endTime)}</span>
      </p>

      {live ? <AttendanceLine event={event} /> : <StatusNotice event={event} />}

      <div className="space-y-2">
        <PrimaryAction event={event} attended={attended} onAttend={onAttend} className="w-full" />
        {attended && live ? (
          <button type="button" onClick={() => toast("Changing a booking is not part of the prototype")} className="w-full text-center text-[13px] font-medium text-navy-700 hover:underline">
            Change
          </button>
        ) : null}
      </div>

      <EventSecondaryActions {...props} />
    </Card>
  );
}

/**
 * Mobile: the same decision, stuck above the safe area so it is always a thumb away.
 * Sticky rather than fixed, so it comes to rest at the end of the page instead of
 * sitting permanently on top of the footer.
 */
export function EventActionBar({ event, attended, onAttend }: Pick<ActionProps, "event" | "attended" | "onAttend">) {
  const label = eventPriceLabel(event);
  const free = label === "Free";
  return (
    <div className="sticky bottom-0 z-30 -mx-4 mt-2 border-t border-border bg-surface/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur sm:-mx-6 sm:px-6 lg:hidden">
      <div className="mx-auto flex max-w-3xl items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className={cn("font-display text-lg font-semibold leading-none tabular", free ? "text-success-700" : "text-navy-900")}>
            {free ? "Free entry" : label}
          </p>
          <p className={cn("mt-1 truncate text-xs", event.status === "cancelled" ? "text-danger-700" : "text-fg-muted")}>
            {event.status === "cancelled"
              ? "This event was cancelled"
              : event.status === "completed"
                ? "This event has finished"
                : attended
                  ? `You're going · ${eventDateLabel(event)}`
                  : `${eventDateLabel(event)} · ${event.startTime}`}
          </p>
        </div>
        <PrimaryAction event={event} attended={attended} onAttend={onAttend} className="min-h-11 shrink-0" />
      </div>
    </div>
  );
}
