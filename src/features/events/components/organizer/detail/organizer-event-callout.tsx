"use client";

import Link from "next/link";
import { Clock3, EyeOff, MessageSquareWarning, Pencil } from "lucide-react";
import { Button } from "@/components/ui";
import { formatTimeAgo } from "@/lib/utils";
import type { Event } from "@/types";
import { editHref } from "../list/organizer-helpers";

/**
 * One line that says where the event stands and what happens next. Amber when GigSyc
 * needs something from the partner, cyan while it's with us, neutral for a private draft.
 */
export function OrganizerEventCallout({ event }: { event: Event }) {
  if (event.status === "rejected") {
    return (
      <section role="status" aria-labelledby="changes-heading" className="flex flex-col gap-4 rounded-lg border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-md bg-amber-100 text-amber-900">
            <MessageSquareWarning className="size-[18px]" aria-hidden />
          </span>
          <div>
            <h2 id="changes-heading" className="text-base font-semibold text-amber-900">GigSyc asked for changes</h2>
            <p className="mt-1 text-sm leading-6 text-amber-900">{event.reviewNote ?? "Open the event to see what needs updating."}</p>
            {event.reviewedAt ? <p className="mt-1 text-xs text-amber-800/80">Reviewed {formatTimeAgo(event.reviewedAt)}. Editing resubmits it straight away.</p> : null}
          </div>
        </div>
        <Button asChild className="shrink-0"><Link href={editHref(event.id)}><Pencil /> Fix and resubmit</Link></Button>
      </section>
    );
  }

  if (event.status === "pending_review") {
    return (
      <p role="status" className="flex items-start gap-3 rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm text-cyan-900">
        <Clock3 className="mt-0.5 size-4 shrink-0" aria-hidden />
        <span>
          <span className="font-medium">With GigSyc for review</span>
          {event.submittedAt ? <> — submitted {formatTimeAgo(event.submittedAt)}.</> : "."} You&apos;ll hear back within a day. You can still edit it in the meantime.
        </span>
      </p>
    );
  }

  if (event.status === "draft") {
    return (
      <p role="status" className="flex items-start gap-3 rounded-lg border border-border bg-ink-50 px-4 py-3 text-sm text-fg-muted">
        <EyeOff className="mt-0.5 size-4 shrink-0 text-fg-subtle" aria-hidden />
        <span><span className="font-medium text-fg">Only you can see this.</span> Submit it when it&apos;s ready and GigSyc will review it, usually within a day.</span>
      </p>
    );
  }

  return null;
}
