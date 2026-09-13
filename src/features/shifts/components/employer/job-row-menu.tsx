"use client";

import Link from "next/link";
import { Copy, Eye, MoreHorizontal, Pencil, XCircle } from "lucide-react";
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { Shift } from "@/types";
import { CANCELLABLE } from "./shift-helpers";

interface JobRowMenuProps {
  shift: Shift;
  onDuplicate: (shift: Shift) => void;
  onCancel: (shift: Shift) => void;
  /** Sizing for the trigger — the stacked mobile card needs a 44px target, the dense table doesn't. */
  triggerClassName?: string;
}

/** The ⋯ menu on a jobs row. Wrapped so clicks never bubble to the row's navigate handler. */
export function JobRowMenu({ shift, onDuplicate, onCancel, triggerClassName }: JobRowMenuProps) {
  const canCancel = CANCELLABLE.has(shift.status);
  const isDraft = shift.status === "draft";
  return (
    <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()} className="inline-flex">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${shift.title}`} className={cn("text-fg-muted", triggerClassName)}>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/employer/jobs/${shift.id}`}><Eye /> View</Link>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => onDuplicate(shift)}>
            {isDraft ? <><Pencil /> Finish draft</> : <><Copy /> Duplicate</>}
          </DropdownMenuItem>
          {canCancel ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem destructive onSelect={() => onCancel(shift)}>
                <XCircle /> {isDraft ? "Discard draft" : "Cancel shift"}
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
