"use client";

import { Check } from "lucide-react";
import { motion } from "motion/react";
import { EASE } from "@/lib/motion";

/**
 * The moment between the last digit and the next screen. The whole block arrives at
 * once — it is only on screen for about a second, so nothing here waits its turn.
 */
export function VerifySuccess() {
  return (
    <motion.div
      role="status"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: EASE }}
      className="flex flex-col items-center py-8 text-center"
    >
      <motion.span
        initial={{ scale: 0.7 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.32, ease: EASE }}
        className="grid size-16 place-items-center rounded-full bg-success-100 text-success-700"
      >
        <Check className="size-8" strokeWidth={2.5} aria-hidden />
      </motion.span>
      <p className="mt-5 font-display text-xl font-semibold text-navy-900">Email verified</p>
      <p className="mt-1 text-sm text-fg-muted">Taking you to the next step.</p>
    </motion.div>
  );
}
