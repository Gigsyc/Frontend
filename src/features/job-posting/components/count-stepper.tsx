"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui";
import { controlClass } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface CountStepperProps {
  id: string;
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
}

/** − / + around a number input. 44px targets so it works with a thumb. */
export function CountStepper({ id, value, onChange, min = 1, max = 200, ...aria }: CountStepperProps) {
  const clamp = (n: number) => Math.max(min, Math.min(max, n));
  return (
    <div className="inline-flex items-center gap-2">
      <Button type="button" variant="outline" size="icon" aria-label="Fewer workers" disabled={value <= min} onClick={() => onChange(clamp(value - 1))} className="size-11">
        <Minus />
      </Button>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={Number.isFinite(value) ? value : ""}
        onChange={(e) => onChange(e.target.value === "" ? min : clamp(Number(e.target.value)))}
        className={cn(controlClass, "h-11 w-20 text-center font-display text-lg font-semibold tabular")}
        {...aria}
      />
      <Button type="button" variant="outline" size="icon" aria-label="More workers" disabled={value >= max} onClick={() => onChange(clamp(value + 1))} className="size-11">
        <Plus />
      </Button>
    </div>
  );
}
