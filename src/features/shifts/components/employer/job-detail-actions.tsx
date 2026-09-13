"use client";

import { useRouter } from "next/navigation";
import { Copy, MoreHorizontal, Pencil, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui";
import type { Shift } from "@/types";
import { CANCELLABLE } from "./shift-helpers";

interface JobDetailActionsProps {
  shift: Shift;
  onCancel: () => void;
}

/**
 * Edit / Duplicate / Cancel. Buttons on desktop, a ⋯ menu on small screens.
 * A draft offers "Finish draft" only — both actions would open the same wizard, and finishing
 * the draft edits it in place rather than leaving a second copy behind.
 */
export function JobDetailActions({ shift, onCancel }: JobDetailActionsProps) {
  const router = useRouter();
  const canCancel = CANCELLABLE.has(shift.status);
  const isDraft = shift.status === "draft";

  const edit = () => {
    if (isDraft) router.push(`/employer/jobs/new?from=${shift.id}`);
    else toast("Editing a posted shift isn't in the prototype", { description: "Duplicate it to post a corrected version, then cancel this one." });
  };
  const duplicate = () => router.push(`/employer/jobs/new?from=${shift.id}`);

  return (
    <>
      <div className="hidden items-center gap-2 sm:flex">
        <Button variant="outline" onClick={edit}><Pencil /> {isDraft ? "Finish draft" : "Edit"}</Button>
        {isDraft ? null : <Button variant="outline" onClick={duplicate}><Copy /> Duplicate</Button>}
        {canCancel ? <Button variant="danger-soft" onClick={onCancel}><XCircle /> {isDraft ? "Discard draft" : "Cancel shift"}</Button> : null}
      </div>
      <div className="sm:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="outline" size="icon" aria-label="Shift actions" className="size-11"><MoreHorizontal /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={edit}><Pencil /> {isDraft ? "Finish draft" : "Edit"}</DropdownMenuItem>
            {isDraft ? null : <DropdownMenuItem onSelect={duplicate}><Copy /> Duplicate</DropdownMenuItem>}
            {canCancel ? (<><DropdownMenuSeparator /><DropdownMenuItem destructive onSelect={onCancel}><XCircle /> {isDraft ? "Discard draft" : "Cancel shift"}</DropdownMenuItem></>) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}
