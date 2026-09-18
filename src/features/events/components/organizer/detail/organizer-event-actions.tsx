"use client";

import Link from "next/link";
import { ExternalLink, Pencil, Send, Trash2, Undo2, XCircle } from "lucide-react";
import { Button } from "@/components/ui";
import type { Event } from "@/types";
import { editHref, publicHref } from "../list/organizer-helpers";

interface OrganizerEventActionsProps {
  event: Event;
  onSubmit: () => void;
  onCancel: () => void;
}

/** Header buttons — the same moves the ⋯ menu offers on the list, laid out as buttons. */
export function OrganizerEventActions({ event, onSubmit, onCancel }: OrganizerEventActionsProps) {
  switch (event.status) {
    case "draft":
      return (
        <>
          <Button variant="ghost" className="text-danger-600 hover:bg-danger-50" onClick={onCancel}><Trash2 /> Discard draft</Button>
          <Button variant="outline" asChild><Link href={editHref(event.id)}><Pencil /> Edit</Link></Button>
          <Button onClick={onSubmit}><Send /> Submit for review</Button>
        </>
      );
    case "pending_review":
      return (
        <>
          <Button variant="outline" onClick={onCancel}><Undo2 /> Withdraw</Button>
          <Button variant="outline" asChild><Link href={editHref(event.id)}><Pencil /> Edit</Link></Button>
        </>
      );
    case "rejected":
      return <Button asChild><Link href={editHref(event.id)}><Pencil /> Fix and resubmit</Link></Button>;
    case "published":
      return (
        <>
          <Button variant="danger-soft" onClick={onCancel}><XCircle /> Cancel event</Button>
          <Button variant="outline" asChild>
            <a href={publicHref(event.slug)} target="_blank" rel="noopener noreferrer"><ExternalLink /> View on GigSyc</a>
          </Button>
        </>
      );
    default:
      return null;
  }
}
