"use client";

import { AnimatePresence, motion } from "motion/react";
import { Check, type LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const UPLOAD_MS = 1200;
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface UploadTileProps {
  icon: LucideIcon;
  title: string;
  hint: string;
  done: boolean;
  error?: string;
  /** Front camera for the selfie, rear for the ID. */
  capture?: "user" | "environment";
  onDone: () => void;
}

/**
 * Simulates an upload: click → progress over ~1.2s → check. The hidden file input is there for realism
 * (and so a real camera sheet opens on phones if someone taps it), but the file is never read.
 */
export function UploadTile({ icon: Icon, title, hint, done, error, capture, onDone }: UploadTileProps) {
  const [progress, setProgress] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timer = useRef<number | null>(null);
  const uploading = progress !== null && !done;

  useEffect(() => () => { if (timer.current) window.clearInterval(timer.current); }, []);

  const start = () => {
    if (done || uploading) return;
    const began = performance.now();
    setProgress(0);
    timer.current = window.setInterval(() => {
      const pct = Math.min(100, ((performance.now() - began) / UPLOAD_MS) * 100);
      setProgress(pct);
      if (pct >= 100 && timer.current) {
        window.clearInterval(timer.current);
        timer.current = null;
        onDone();
      }
    }, 40);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <button
        type="button"
        onClick={start}
        disabled={done || uploading}
        aria-describedby={error ? `${title}-error` : undefined}
        className={cn(
          "relative flex min-h-36 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-4 text-center transition-colors focus-visible:outline-none focus-visible:shadow-focus",
          done ? "border-success-500 bg-success-50" : error ? "border-danger-500 bg-danger-50/40 hover:bg-danger-50" : "border-border-strong bg-canvas hover:border-navy-900 hover:bg-navy-50/40",
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          {done ? (
            <motion.span key="done" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.3, ease: EASE }} className="inline-flex size-11 items-center justify-center rounded-full bg-success-500 text-white">
              <Check className="size-6" strokeWidth={3} aria-hidden />
            </motion.span>
          ) : (
            <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className={cn("inline-flex size-11 items-center justify-center rounded-lg", uploading ? "bg-navy-100 text-navy-900" : "bg-navy-50 text-navy-800")}>
              <Icon className="size-5" aria-hidden />
            </motion.span>
          )}
        </AnimatePresence>
        <span className="text-sm font-medium text-fg">{title}</span>
        <span className="text-xs text-fg-muted">{done ? "Uploaded" : uploading ? `Uploading… ${Math.round(progress)}%` : hint}</span>
        {uploading ? <Progress value={progress} tone="navy" className="mt-1 max-w-48" label={`${title} upload progress`} /> : null}
      </button>
      <input ref={inputRef} type="file" accept="image/*" capture={capture} tabIndex={-1} aria-hidden className="sr-only" onChange={start} />
      {error ? <p id={`${title}-error`} role="alert" className="text-[13px] text-danger-600">{error}</p> : null}
    </div>
  );
}
