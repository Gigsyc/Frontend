"use client";

import Link from "next/link";
import { ExternalLink, Eye, MoreHorizontal, Pencil, Send, Trash2, Undo2, XCircle } from "lucide-react";
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { Event } from "@/types";
import { detailHref, editHref, publicHref } from "./organizer-helpers";

interface OrganizerEventMenuProps {
  event: Event;
  onSubmit: (event: Event) => void;
  onCancel: (event: Event) => void;
  /** The stacked mobile card needs a 44px target; the dense table doesn't. */
  triggerClassName?: string;
}

/** The ⋯ menu on an event row. What it offers follows the status — the store enforces the same rules. */
export function OrganizerEventMenu({ event, onSubmit, onCancel, triggerClassName }: OrganizerEventMenuProps) {
  const s = event.status;
  return (
    <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()} className="inline-flex">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${event.title}`} className={cn("text-fg-muted", triggerClassName)}>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild><Link href={detailHref(event.id)}><Eye /> View details</Link></DropdownMenuItem>

          {s === "draft" ? (
            <>
              <DropdownMenuItem asChild><Link href={editHref(event.id)}><Pencil /> Edit</Link></DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onSubmit(event)}><Send /> Submit for review</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem destructive onSelect={() => onCancel(event)}><Trash2 /> Discard draft</DropdownMenuItem>
            </>
          ) : null}

          {s === "pending_review" ? (
            <>
              <DropdownMenuItem asChild><Link href={editHref(event.id)}><Pencil /> Edit</Link></DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem destructive onSelect={() => onCancel(event)}><Undo2 /> Withdraw</DropdownMenuItem>
            </>
          ) : null}

          {s === "rejected" ? (
            <DropdownMenuItem asChild><Link href={editHref(event.id)}><Pencil /> Fix and resubmit</Link></DropdownMenuItem>
          ) : null}

          {s === "published" ? (
            <>
              <DropdownMenuItem asChild>
                <a href={publicHref(event.slug)} target="_blank" rel="noopener noreferrer"><ExternalLink /> View on GigSyc</a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem destructive onSelect={() => onCancel(event)}><XCircle /> Cancel event</DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
