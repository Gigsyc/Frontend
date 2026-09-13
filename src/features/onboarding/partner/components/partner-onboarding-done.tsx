"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Check } from "lucide-react";
import { OnboardingShell } from "@/components/layout/onboarding-shell";
import { Button } from "@/components/ui/button";
import { EASE } from "@/lib/motion";
import { TOTAL_STEPS } from "../lib/state";

const AUTO_ROUTE_MS = 1500;

/**
 * Shown after `completePartnerOnboarding` has landed, inside the same shell as the three
 * questions so the bar, the header and the footer action do not move at the finish. It sits
 * outside `RequireOnboarding` on purpose: the account is finished by now, so the guard would
 * bounce it away before anyone could read it.
 */
export function PartnerOnboardingDone({ organizationName }: { organizationName: string }) {
  const router = useRouter();
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => router.replace("/partner"), AUTO_ROUTE_MS);
    return () => window.clearTimeout(timer);
  }, [router]);

  // This panel replaces the wizard in place — no navigation, no focus move — so a live region
  // is the only thing that tells a screen-reader user it worked. One that already holds its
  // text when it mounts is not announced, which is why it is filled a beat later.
  useEffect(() => {
    const timer = window.setTimeout(
      () => setAnnouncement(`Your partner workspace is ready. ${organizationName} is pending verification. Taking you to your workspace.`),
      80,
    );
    return () => window.clearTimeout(timer);
  }, [organizationName]);

  return (
    <OnboardingShell
      step={TOTAL_STEPS - 1}
      total={TOTAL_STEPS}
      primary={
        <Button size="lg" className="h-12" asChild>
          <Link href="/partner">Open my workspace <ArrowRight /></Link>
        </Button>
      }
      secondary={<p className="text-[13px] text-fg-muted">Taking you there in a moment.</p>}
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
            Your partner workspace is ready.
          </h1>
          <p className="mt-2 text-[15px] leading-6 text-fg-muted">
            {organizationName} is pending verification. You can post shifts and hire now; submitting
            events to the public board opens once an admin approves you.
          </p>
        </motion.div>
      </div>
    </OnboardingShell>
  );
}
