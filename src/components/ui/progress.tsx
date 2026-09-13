import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number; // 0–100
  tone?: "navy" | "amber" | "success" | "danger" | "cyan";
  size?: "sm" | "md";
  className?: string;
  label?: string;
}

const TONE = { navy: "bg-navy-900", amber: "bg-amber-500", success: "bg-success-500", danger: "bg-danger-500", cyan: "bg-cyan-500" };

export function Progress({ value, tone = "navy", size = "sm", className, label }: ProgressProps) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(v)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cn("w-full overflow-hidden rounded-full bg-ink-100", size === "sm" ? "h-1.5" : "h-2.5", className)}
    >
      <div className={cn("h-full rounded-full transition-[width] duration-500 ease-out-soft", TONE[tone])} style={{ width: `${v}%` }} />
    </div>
  );
}

/** Staffing fill indicator: "12 of 18 confirmed". */
export function FillMeter({ filled, needed, className, showLabel = true }: { filled: number; needed: number; className?: string; showLabel?: boolean }) {
  const pct = needed ? (filled / needed) * 100 : 0;
  const tone = pct >= 100 ? "success" : pct >= 60 ? "navy" : "amber";
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {showLabel ? (
        <div className="flex items-baseline justify-between text-xs">
          <span className="font-medium text-fg"><span className="tabular">{filled}</span> of <span className="tabular">{needed}</span> confirmed</span>
          <span className="tabular text-fg-muted">{Math.round(pct)}%</span>
        </div>
      ) : null}
      <Progress value={pct} tone={tone} label={`${filled} of ${needed} positions confirmed`} />
    </div>
  );
}
