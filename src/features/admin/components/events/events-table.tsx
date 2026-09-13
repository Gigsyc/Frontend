"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Checkbox, EventStatusBadge, Skeleton } from "@/components/ui";
import { eventDateLabel } from "@/components/common";
import { EVENT_CATEGORIES } from "@/data/events";
import { cn } from "@/lib/utils";
import type { Event } from "@/types";
import { useStaggerOnce } from "@/lib/motion";
import type { EventActionDef } from "./event-actions";
import { EventRowMenu } from "./event-row-menu";
import { EventThumb } from "./event-thumb";
import { FeaturedToggle } from "./event-featured-toggle";

export interface TableSelection {
  selected: ReadonlySet<string>;
  onToggle: (id: string) => void;
  onToggleAll: () => void;
  allSelected: boolean;
  someSelected: boolean;
}

interface Props {
  events: Event[];
  organizerName: (id: string) => string;
  onAction: (event: Event, action: EventActionDef) => void;
  onToggleFeatured: (event: Event) => void;
  pendingId?: string;
  featuredPendingId?: string;
  /** Present only on the review queue, where bulk approval makes sense. */
  selection?: TableSelection;
}

/** Stop a control's click from reaching the row's navigate handler. */
function Cell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <td className={className} onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
      {children}
    </td>
  );
}

export function EventsTable({ events, organizerName, onAction, onToggleFeatured, pendingId, featuredPendingId, selection }: Props) {
  const router = useRouter();
  const stagger = useStaggerOnce(events.length > 0);
  const open = (id: string) => router.push(`/admin/events/${id}`);

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs font-medium text-fg-muted">
              {selection ? (
                <th scope="col" className="w-10 py-3 pl-5">
                  <Checkbox
                    checked={selection.allSelected ? true : selection.someSelected ? "indeterminate" : false}
                    onCheckedChange={selection.onToggleAll}
                    aria-label="Select every event on this tab"
                  />
                </th>
              ) : null}
              <th scope="col" className="px-4 py-3 font-medium">Event</th>
              <th scope="col" className="px-4 py-3 font-medium">Organiser</th>
              <th scope="col" className="hidden px-4 py-3 font-medium lg:table-cell">Category</th>
              <th scope="col" className="px-4 py-3 font-medium">Date</th>
              <th scope="col" className="hidden px-4 py-3 font-medium xl:table-cell">Place</th>
              <th scope="col" className="px-4 py-3 font-medium">Status</th>
              <th scope="col" className="px-2 py-3 font-medium"><span className="sr-only">Featured</span></th>
              <th scope="col" className="px-2 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {events.map((e, i) => (
              <motion.tr
                key={e.id}
                {...stagger(i)}
                onClick={() => open(e.id)}
                className={cn(
                  "group cursor-pointer border-b border-border last:border-0 transition-colors hover:bg-ink-50",
                  pendingId === e.id && "pointer-events-none opacity-50",
                )}
              >
                {selection ? (
                  <Cell className="py-3 pl-5">
                    <Checkbox
                      checked={selection.selected.has(e.id)}
                      onCheckedChange={() => selection.onToggle(e.id)}
                      aria-label={`Select ${e.title}`}
                    />
                  </Cell>
                ) : null}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <EventThumb src={e.coverImage} />
                    <div className="min-w-0">
                      <Link
                        href={`/admin/events/${e.id}`}
                        onClick={(ev) => ev.stopPropagation()}
                        className="line-clamp-1 font-medium text-fg group-hover:text-navy-800"
                      >
                        {e.title}
                      </Link>
                      <p className="truncate text-xs text-fg-muted">{e.venue}</p>
                    </div>
                  </div>
                </td>
                <td className="max-w-40 truncate px-4 py-3 text-fg-muted">{organizerName(e.organizerId)}</td>
                <td className="hidden whitespace-nowrap px-4 py-3 text-fg-muted lg:table-cell">{EVENT_CATEGORIES[e.category].label}</td>
                <td className="whitespace-nowrap px-4 py-3">
                  <p className="text-fg">{eventDateLabel(e)}</p>
                  <p className="text-xs text-fg-muted tabular">{e.startTime}</p>
                </td>
                <td className="hidden whitespace-nowrap px-4 py-3 text-fg-muted xl:table-cell">{e.place}</td>
                <td className="px-4 py-3"><EventStatusBadge status={e.status} /></td>
                <Cell className="px-2 py-3">
                  <FeaturedToggle event={e} onToggle={() => onToggleFeatured(e)} busy={featuredPendingId === e.id} />
                </Cell>
                <td className="px-2 py-3 text-right"><EventRowMenu event={e} onAction={onAction} /></td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-border md:hidden">
        {events.map((e, i) => (
          <motion.li key={e.id} {...stagger(i)} className={cn("relative", pendingId === e.id && "pointer-events-none opacity-50")}>
            <Link href={`/admin/events/${e.id}`} className="flex gap-3 p-4 pr-14 active:bg-ink-50">
              <EventThumb src={e.coverImage} />
              <span className="min-w-0 flex-1">
                <span className="line-clamp-2 text-sm font-medium leading-5 text-fg">{e.title}</span>
                <span className="mt-0.5 block truncate text-xs text-fg-muted">{organizerName(e.organizerId)}</span>
                <span className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-fg-muted">
                  <span className="text-fg">{eventDateLabel(e)}</span>
                  <span className="tabular">{e.startTime}</span>
                  <EventStatusBadge status={e.status} />
                </span>
              </span>
            </Link>
            <div className="absolute right-2 top-3">
              <EventRowMenu event={e} onAction={onAction} triggerClassName="size-11" />
            </div>
          </motion.li>
        ))}
      </ul>
    </>
  );
}

export function EventsTableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div aria-hidden className="divide-y divide-border">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-3.5">
          <Skeleton className="size-10 shrink-0 rounded-md" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3 max-w-72" />
            <Skeleton className="h-3 w-1/3 max-w-40" />
          </div>
          <Skeleton className="hidden h-4 w-28 md:block" />
          <Skeleton className="hidden h-4 w-20 lg:block" />
          <Skeleton className="h-5 w-20 shrink-0 rounded-sm" />
        </div>
      ))}
    </div>
  );
}
