import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn, pluralize } from "@/lib/utils";
import type { SystemService } from "@/types";

/** One line an operator can read at a glance: is anything wrong, and what. */
export function StatusBanner({ services }: { services: SystemService[] }) {
  const off = services.filter((s) => s.status !== "operational");
  const down = off.some((s) => s.status === "down");
  const healthy = off.length === 0;
  const Icon = healthy ? CheckCircle2 : AlertTriangle;

  return (
    <div
      role="status"
      className={cn(
        "flex items-start gap-3 rounded-lg px-4 py-3.5 sm:px-5",
        healthy ? "bg-success-50 text-success-700" : down ? "bg-danger-50 text-danger-700" : "bg-warning-50 text-warning-700",
      )}
    >
      <Icon className="mt-0.5 size-5 shrink-0" aria-hidden />
      <div className="min-w-0">
        <p className="font-display text-[15px] font-semibold">
          {healthy ? "All systems operational" : `${pluralize(off.length, "service")} ${down ? "down" : "degraded"}`}
        </p>
        <p className="mt-0.5 text-[13px] leading-6 text-fg-muted">
          {healthy
            ? `All ${services.length} services responding normally across the last 30 days.`
            : off.map((s) => s.note ?? `${s.name} is ${s.status}.`).join(" ")}
        </p>
      </div>
    </div>
  );
}
