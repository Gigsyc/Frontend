"use client";

import { Dialog, DialogBody, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import type { ScheduleItem } from "../types";
import { RateEmployerForm } from "./rate-employer-form";

interface RateEmployerDialogProps {
  item: ScheduleItem | null;
  onOpenChange: (open: boolean) => void;
}

export function RateEmployerDialog({ item, onOpenChange }: RateEmployerDialogProps) {
  return (
    <Dialog open={item !== null} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        {item ? (
          <>
            <DialogHeader>
              <DialogTitle>Rate {item.employer?.name ?? "this employer"}</DialogTitle>
              <DialogDescription>{item.shift.title} · {formatDate(item.shift.date)}</DialogDescription>
            </DialogHeader>
            <DialogBody>
              <RateEmployerForm item={item} onDone={() => onOpenChange(false)} />
            </DialogBody>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
