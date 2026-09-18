import { MessageSquareWarning } from "lucide-react";
import { cn } from "@/lib/utils";

/** GigSyc's note on a rejected event — small enough for a table row, loud enough to be read. */
export function ReviewNote({ note, className }: { note: string; className?: string }) {
  return (
    <p className={cn("flex items-start gap-1.5 rounded-sm bg-amber-100 px-2 py-1.5 text-xs leading-4 text-amber-900", className)}>
      <MessageSquareWarning className="mt-px size-3.5 shrink-0" aria-hidden />
      <span><span className="font-medium">GigSyc asked:</span> {note}</span>
    </p>
  );
}
