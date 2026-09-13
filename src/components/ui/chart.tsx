"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/utils";

interface BarDatum { label: string; value: number; hint?: string }

interface BarChartProps {
  data: BarDatum[];
  /** Format for axis + tooltip values */
  format?: (v: number) => string;
  height?: number;
  className?: string;
  tone?: "navy" | "amber" | "cyan";
  /** Index to highlight (e.g. current period) */
  highlight?: number;
  ariaLabel: string;
}

const TONE = { navy: "fill-navy-900", amber: "fill-amber-500", cyan: "fill-cyan-500" };
const TONE_MUTED = { navy: "fill-navy-200", amber: "fill-amber-200", cyan: "fill-cyan-200" };

/**
 * Minimal, dependency-free bar chart. Good for 4–12 bars. Hover/focus shows the value.
 * Uses a table for screen readers so the data is genuinely accessible.
 */
export function BarChart({ data, format = (v) => String(v), height = 160, className, tone = "navy", highlight, ariaLabel }: BarChartProps) {
  const id = useId();
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.value));
  const w = 100; // viewBox width units
  const gap = 1.6;
  const barW = (w - gap * (data.length - 1)) / data.length;
  const chartH = 100;

  return (
    <figure className={cn("w-full", className)} aria-labelledby={`${id}-cap`}>
      <div className="relative">
        {active !== null ? (
          <div className="pointer-events-none absolute -top-1 left-0 z-10 -translate-y-full rounded-md bg-navy-900 px-2 py-1 text-xs text-white shadow-pop" style={{ left: `${(active * (barW + gap) + barW / 2)}%`, transform: "translate(-50%, -100%)" }}>
            <span className="font-semibold tabular">{format(data[active].value)}</span>
            <span className="text-white/70"> · {data[active].hint ?? data[active].label}</span>
          </div>
        ) : null}
        <svg viewBox={`0 0 ${w} ${chartH}`} preserveAspectRatio="none" style={{ height }} className="w-full overflow-visible" aria-hidden onMouseLeave={() => setActive(null)}>
          {[0.25, 0.5, 0.75].map((t) => <line key={t} x1={0} x2={w} y1={chartH * (1 - t)} y2={chartH * (1 - t)} className="stroke-ink-200" strokeWidth={0.4} vectorEffect="non-scaling-stroke" />)}
          {data.map((d, i) => {
            const h = Math.max(1.5, (d.value / max) * chartH);
            const dim = active !== null && active !== i;
            const isHi = highlight === i;
            return (
              <g key={d.label} onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)} onBlur={() => setActive(null)} tabIndex={0} className="outline-none">
                <rect x={i * (barW + gap)} y={0} width={barW} height={chartH} className="fill-transparent" />
                <rect
                  x={i * (barW + gap)} y={chartH - h} width={barW} height={h} rx={1}
                  className={cn("transition-opacity duration-150", isHi || active === i ? TONE[tone] : TONE_MUTED[tone], dim && "opacity-60")}
                />
              </g>
            );
          })}
        </svg>
        <div className="mt-2 flex justify-between text-[11px] text-fg-muted">
          {data.map((d, i) => <span key={d.label} className={cn("flex-1 text-center tabular", (highlight === i || active === i) && "font-medium text-fg")}>{d.label}</span>)}
        </div>
      </div>
      <figcaption id={`${id}-cap`} className="sr-only">{ariaLabel}</figcaption>
      <table className="sr-only">
        <thead><tr><th>Period</th><th>Value</th></tr></thead>
        <tbody>{data.map((d) => <tr key={d.label}><td>{d.hint ?? d.label}</td><td>{format(d.value)}</td></tr>)}</tbody>
      </table>
    </figure>
  );
}

/** Tiny trend line for stat tiles. */
export function Sparkline({ values, className, tone = "navy", height = 28 }: { values: number[]; className?: string; tone?: "navy" | "amber" | "cyan" | "success"; height?: number }) {
  if (values.length < 2) return null;
  const max = Math.max(...values), min = Math.min(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * 100},${100 - ((v - min) / range) * 100}`).join(" ");
  const stroke = { navy: "stroke-navy-700", amber: "stroke-amber-600", cyan: "stroke-cyan-600", success: "stroke-success-600" }[tone];
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ height }} className={cn("w-full", className)} aria-hidden>
      <polyline points={pts} fill="none" className={stroke} strokeWidth={2} vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

/** Horizontal distribution (e.g. role mix). */
export function DistributionBar({ segments, className, format = (v) => String(v) }: { segments: Array<{ label: string; value: number; className: string }>; className?: string; format?: (v: number) => string }) {
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;
  return (
    <div className={className}>
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-ink-100" role="img" aria-label={segments.map((s) => `${s.label} ${format(s.value)}`).join(", ")}>
        {segments.map((s) => <div key={s.label} className={cn("h-full", s.className)} style={{ width: `${(s.value / total) * 100}%` }} />)}
      </div>
      <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs sm:grid-cols-3">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center gap-2 text-fg-muted">
            <span className={cn("size-2 rounded-full", s.className)} aria-hidden />
            <span className="truncate">{s.label}</span>
            <span className="ml-auto font-medium tabular text-fg">{format(s.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
