"use client";

import Link from "next/link";
import { ExternalLink, MoreHorizontal, SquarePen } from "lucide-react";
import {
  Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, Tooltip,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import type { Event } from "@/types";
import { actionsFor, type EventActionDef } from "./event-actions";

interface Props {
  event: Event;
  onAction: (event: Event, action: EventActionDef) => void;
  /** The stacked mobile row needs a 44px target; the dense table does not. */
  triggerClassName?: string;
}

/** The ⋯ menu on an events row. Clicks never reach the row's navigate handler. */
export function EventRowMenu({ event, onAction, triggerClassName }: Props) {
  const actions = actionsFor(event.status);
  const published = event.status === "published";

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
          {published ? (
            <DropdownMenuItem asChild>
              <Link href={`/events/${event.slug}`}><ExternalLink /> View on public site</Link>
            </DropdownMenuItem>
          ) : (
            <Tooltip content="Only published events have a public page." side="left">
              <div>
                <DropdownMenuItem disabled className="data-[disabled]:pointer-events-auto">
                  <ExternalLink /> View on public site
                </DropdownMenuItem>
              </div>
            </Tooltip>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
