"use client";

import { Check } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { AuthHeading } from "@/components/layout/auth-layout";
import { Button } from "@/components/ui/button";
import { EASE } from "@/lib/motion";
import { useFocusOnMount } from "./use-focus-on-mount";

/** The one success moment in the recovery flow: a check that settles, then the way back in. */
export function PasswordUpdatedPanel() {
  const panel = useFocusOnMount<HTMLDivElement>();
  return (
    <motion.div
      ref={panel}
      tabIndex={-1}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: EASE }}
      className="text-center outline-none"
    >
      <motion.span
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: EASE, delay: 0.05 }}
        className="mx-auto mb-5 inline-flex size-14 items-center justify-center rounded-lg bg-success-50 text-success-600"
      >
        <Check className="size-7" strokeWidth={2.5} aria-hidden />
      </motion.span>

      <AuthHeading
        className="mb-0"
        title="Password updated"
        description="You can now sign in with your new password."
      />

      <Button asChild className="mt-7 h-11 w-full">
        <Link href="/login">Return to sign in</Link>
      </Button>
    </motion.div>
  );
}
