"use client";

import { ArrowRight, Check } from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { OnboardingShell } from "@/components/layout/onboarding-shell";
import { Button } from "@/components/ui/button";
import { EASE } from "@/lib/motion";

/** Long enough to read the line, short enough that nobody reaches for the button. */
const DWELL_MS = 1200;

interface OnboardingCompleteProps {
  /** Plain words for what was saved, e.g. "Events near Kigali, starting with music and food." */
  summary: string;
  /** Keeps the bar reading the same total the last step showed. */
  total: number;
}

export function OnboardingComplete({ summary, total }: OnboardingCompleteProps) {
  const router = useRouter();
  const go = useCallback(() => router.replace("/events"), [router]);
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(go, DWELL_MS);
    return () => window.clearTimeout(timer);
  }, [go]);

  // A live region that already holds its text when it mounts is not announced. Filling it a beat
  // later is what makes this panel — the confirmation that replaces the toast — actually read out.
  useEffect(() => {
    const timer = window.setTimeout(() => setAnnouncement(`You're all set. ${summary}`), 80);
    return () => window.clearTimeout(timer);
  }, [summary]);

  return (
    <OnboardingShell
      step={total - 1}
      total={total}
      primary={<Button size="lg" onClick={go}>Take me there <ArrowRight /></Button>}
    >
      <p role="status" aria-live="polite" className="sr-only">{announcement}</p>

      <div className="flex flex-col items-center py-8 text-center sm:py-12">
        <motion.span
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.35, ease: EASE }}
          className="inline-flex size-16 items-center justify-center rounded-full bg-success-500 text-white"
        >
          <Check className="size-8" strokeWidth={3} aria-hidden />
        </motion.span>
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.3, ease: EASE }}
          className="mt-6 max-w-sm"
        >
          <h1 className="font-display text-[26px] font-semibold leading-tight tracking-tight text-navy-900 sm:text-[30px]">
            You&rsquo;re all set.
          </h1>
          <p className="mt-2 text-[15px] leading-6 text-fg-muted">{summary}</p>
        </motion.div>
      </div>
    </OnboardingShell>
  );
}
