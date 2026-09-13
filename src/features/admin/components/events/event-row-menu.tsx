"use client";

import Link from "next/link";
import { ExternalLink, MoreHorizontal, SquarePen } from "lucide-react";
import {
  Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, Tooltip,
} from "@/components/ui";
import { isPubliclyReachable } from "@/data/events";
import { cn } from "@/lib/utils";
import type { Event } from "@/types";
import { actionsFor, type EventActionDef } from "./event-actions";

/** Why the public link is unavailable — the same sentence for the eye and for a screen reader. */
const NO_PUBLIC_PAGE = "Draft, pending and rejected events have no public page.";

interface Props {
  event: Event;
  onAction: (event: Event, action: EventActionDef) => void;
  /** The stacked mobile row needs a 44px target; the dense table does not. */
  triggerClassName?: string;
}

/** The ⋯ menu on an events row. Clicks never reach the row's navigate handler. */
export function EventRowMenu({ event, onAction, triggerClassName }: Props) {
  const actions = actionsFor(event.status);
  // Cancelled and completed events stay reachable by direct link, and that page is exactly what
  // an operator needs to check ("does a ticket holder see why this was called off?").
  const reachable = isPubliclyReachable(event.status);

  return (
    <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()} className="inline-flex">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${event.title}`} className={cn("text-fg-muted", triggerClassName)}>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {actions.map((a) => (
            <DropdownMenuItem key={a.id} destructive={a.destructive} onSelect={() => onAction(event, a)}>
              <a.icon /> {a.label}
            </DropdownMenuItem>
          ))}
          {actions.length > 0 ? <DropdownMenuSeparator /> : null}
          <DropdownMenuItem asChild>
            <Link href={`/admin/events/${event.id}`}><SquarePen /> Open</Link>
          </DropdownMenuItem>
          {reachable ? (
            <DropdownMenuItem asChild>
              <Link href={`/events/${event.slug}`}><ExternalLink /> View on public site</Link>
            </DropdownMenuItem>
          ) : (
            /* `aria-disabled`, not `disabled`: Radix skips disabled items with the arrow keys, so
               a keyboard user would never reach the item or hear why it does nothing. */
            <Tooltip content={NO_PUBLIC_PAGE} side="left">
              <DropdownMenuItem
                aria-disabled
                onSelect={(e) => e.preventDefault()}
                className="cursor-default opacity-50"
              >
                <ExternalLink /> View on public site
                <span className="sr-only"> — {NO_PUBLIC_PAGE}</span>
              </DropdownMenuItem>
            </Tooltip>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
