import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/** Compact benefit list. Check marks are success-green on light, amber on navy. */
export function CheckList({ items, onDark, className }: { items: readonly string[]; onDark?: boolean; className?: string }) {
  return (
    <ul className={cn("flex flex-col gap-3 text-sm leading-6", className)}>
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span className={cn("mt-1 inline-flex size-4 shrink-0 items-center justify-center rounded-full", onDark ? "bg-amber-400/20 text-amber-400" : "bg-success-50 text-success-600")}>
            <Check className="size-3" strokeWidth={3} aria-hidden />
          </span>
          <span className={onDark ? "text-white/85" : "text-fg"}>{item}</span>
        </li>
      ))}
    </ul>
  );
}
