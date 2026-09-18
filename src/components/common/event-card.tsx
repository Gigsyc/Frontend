"use client";

import Link from "next/link";
import { Bookmark, CalendarDays, Clock, MapPin, Star, Users } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Photo } from "@/components/ui/photo";
import { Skeleton } from "@/components/ui/skeleton";
import { EVENT_CATEGORIES } from "@/data/events";
import { cn, formatRelativeDay, formatRwf } from "@/lib/utils";
import type { Event } from "@/types";

/** "From RWF 12,000" / "Free" — the one place event pricing is worded. */
export function eventPriceLabel(event: Pick<Event, "attendanceMode" | "tickets">): string {
  if (event.attendanceMode === "free" || event.tickets.length === 0) return "Free";
  const min = Math.min(...event.tickets.map((t) => t.price));
  if (min === 0) return "Free";
  return event.tickets.length > 1 ? `From ${formatRwf(min)}` : formatRwf(min);
}

export function isEventFree(event: Pick<Event, "attendanceMode" | "tickets">): boolean {
  return eventPriceLabel(event) === "Free";
}

/** "Sat 19 Sep" or "19–22 Sep" for a run of days. */
export function eventDateLabel(event: Pick<Event, "date" | "endDate">): string {
  if (!event.endDate || event.endDate === event.date) return formatRelativeDay(event.date);
  const a = parseISO(event.date);
  const b = parseISO(event.endDate);
  const sameMonth = a.getMonth() === b.getMonth();
  return sameMonth ? `${format(a, "d")}–${format(b, "d MMM")}` : `${format(a, "d MMM")} – ${format(b, "d MMM")}`;
}

/** Day/month tile used on horizontal cards and schedule rows. */
export function DateBlock({ date, className }: { date: string; className?: string }) {
  const d = parseISO(date);
  return (
    <span className={cn("inline-flex w-12 shrink-0 flex-col items-center rounded-md border border-border bg-surface py-1.5 text-center leading-none", className)}>
      <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-700">{format(d, "MMM")}</span>
      <span className="mt-1 font-display text-lg font-semibold tabular text-navy-900">{format(d, "d")}</span>
    </span>
  );
}

interface SaveButtonProps {
  saved: boolean;
  onToggle: () => void;
  title: string;
  className?: string;
  /** "overlay" sits on the photo, "plain" sits on a surface. */
  variant?: "overlay" | "plain";
}

export function SaveEventButton({ saved, onToggle, title, className, variant = "overlay" }: SaveButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? `Remove ${title} from saved` : `Save ${title}`}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggle(); }}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-full transition-colors",
        variant === "overlay"
          ? "bg-navy-950/45 text-white backdrop-blur-sm hover:bg-navy-950/65"
          : "border border-border-strong bg-surface text-fg-muted hover:border-ink-400 hover:text-fg",
        className,
      )}
    >
      <Bookmark className={cn("size-[18px]", saved && "fill-amber-500 text-amber-500")} aria-hidden />
    </button>
  );
}

interface EventCardProps {
  event: Event;
  /** Organiser name, resolved by the caller so the card stays presentational. */
  organizerName?: string;
  saved?: boolean;
  onToggleSave?: () => void;
  layout?: "vertical" | "horizontal";
  /** "hero" is the large editorial treatment used for one featured event. */
  emphasis?: "default" | "hero";
  className?: string;
  priority?: boolean;
  /** Where the card links. Defaults to the public event page; the partner workspace passes its own route. */
  href?: string;
}

/**
 * The single event card used across discovery, the homepage rail and related events.
 * Hierarchy is deliberate: when it happens, what it is, then where — price last.
 */
export function EventCard({
  event, organizerName, saved, onToggleSave, layout = "vertical", emphasis = "default", className, priority, href,
}: EventCardProps) {
  const horizontal = layout === "horizontal";
  const hero = emphasis === "hero";
  const price = eventPriceLabel(event);
  const free = price === "Free";
  const category = EVENT_CATEGORIES[event.category];

  return (
    <article className={cn("group relative", className)}>
      <Link
        href={href ?? `/events/${event.slug}`}
        className={cn(
          "flex h-full overflow-hidden rounded-lg bg-surface shadow-card transition-[box-shadow,transform] duration-200 ease-out-soft hover:shadow-raised hover:-translate-y-px focus-visible:outline-none focus-visible:shadow-focus",
          horizontal ? "flex-row items-stretch" : "flex-col",
        )}
      >
        <div className={cn("relative shrink-0 overflow-hidden", horizontal ? "w-28 sm:w-44" : "")}>
          <Photo
            src={event.coverImage}
            alt=""
            aspect={horizontal ? "auto" : hero ? "wide" : "video"}
            rounded={false}
            priority={priority}
            className={cn("transition-transform duration-500 ease-out-soft group-hover:scale-[1.03]", horizontal && "h-full min-h-28")}
            sizes={hero ? "(max-width: 1024px) 100vw, 720px" : "(max-width: 640px) 100vw, 380px"}
          />
          {!horizontal ? (
            <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
              <Badge tone="solid" className="backdrop-blur-sm">{category.label}</Badge>
              {event.featured ? <Badge tone="solid-amber"><Star className="fill-current" /> Featured</Badge> : null}
            </div>
          ) : null}
        </div>

        <div className={cn("flex min-w-0 flex-1 flex-col gap-2", hero ? "p-5 sm:p-6" : "p-4")}>
          <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[13px] font-semibold text-amber-700">
            <span className="inline-flex items-center gap-1.5"><CalendarDays className="size-3.5" aria-hidden />{eventDateLabel(event)}</span>
            <span className="font-normal text-fg-muted" aria-hidden>·</span>
            <span className="inline-flex items-center gap-1 font-normal text-fg-muted"><Clock className="size-3.5" aria-hidden />{event.startTime}</span>
          </p>

          <h3 className={cn("font-sans font-semibold leading-snug text-fg group-hover:text-navy-800", hero ? "text-xl sm:text-2xl" : "line-clamp-2 text-[15px]")}>
            {event.title}
          </h3>

          {hero ? <p className="line-clamp-2 text-sm text-fg-muted">{event.tagline}</p> : null}

          <p className="flex items-center gap-1.5 text-[13px] text-fg-muted">
            <MapPin className="size-3.5 shrink-0 text-fg-subtle" aria-hidden />
            <span className="truncate">{event.venue}, {event.place}</span>
          </p>

          <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-1 pt-1">
            <span className={cn("text-sm font-semibold tabular", free ? "text-success-700" : "text-navy-900")}>{price}</span>
            <span className="flex items-center gap-3 text-xs text-fg-muted">
              {horizontal ? <span className="truncate">{category.label}</span> : null}
              {event.attending > 40 ? (
                <span className="inline-flex items-center gap-1"><Users className="size-3.5" aria-hidden />{event.attending.toLocaleString("en-US")} going</span>
              ) : organizerName ? (
                <span className="truncate">{organizerName}</span>
              ) : null}
            </span>
          </div>
        </div>
      </Link>

      {onToggleSave ? (
        <SaveEventButton
          saved={!!saved}
          onToggle={onToggleSave}
          title={event.title}
          variant={horizontal ? "plain" : "overlay"}
          className={cn("absolute z-10", horizontal ? "bottom-3 right-3" : "right-3 top-3")}
        />
      ) : null}
    </article>
  );
}

export function EventCardSkeleton({ layout = "vertical", emphasis = "default" }: { layout?: "vertical" | "horizontal"; emphasis?: "default" | "hero" }) {
  const horizontal = layout === "horizontal";
  return (
    <div className={cn("flex overflow-hidden rounded-lg bg-surface shadow-card", horizontal ? "flex-row" : "flex-col")} aria-hidden>
      <Skeleton className={cn("rounded-none", horizontal ? "w-28 sm:w-44" : emphasis === "hero" ? "aspect-[21/9] w-full" : "aspect-video w-full")} />
      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-3 w-3/5" />
        <div className="mt-2 flex justify-between"><Skeleton className="h-4 w-20" /><Skeleton className="h-3 w-16" /></div>
      </div>
    </div>
  );
}
