"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function OnboardingSuccess({ firstName, onStartOver }: { firstName: string; onStartOver: () => void }) {
  const name = firstName.trim() || "there";
  return (
    <Card className="flex flex-col items-center px-5 py-10 text-center sm:px-10 sm:py-14">
      <motion.span
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.35, ease: EASE }}
        className="inline-flex size-16 items-center justify-center rounded-full bg-success-500 text-white"
      >
        <motion.span initial={{ pathLength: 0, opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15, duration: 0.2 }}>
          <Check className="size-8" strokeWidth={3} aria-hidden />
        </motion.span>
      </motion.span>
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.3, ease: EASE }} className="mt-6 max-w-md">
        <h2 className="text-2xl font-semibold leading-tight sm:text-[28px]">You&rsquo;re on GigSyc, {name}.</h2>
        <p className="mt-3 text-sm leading-6 text-fg-muted sm:text-[15px]">We verify IDs within 24 hours and will text you when it clears. You can already browse shifts — most this week are in Kimihurura and Kacyiru.</p>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.3, ease: EASE }} className="mt-8 flex w-full max-w-xs flex-col gap-2">
        <Button size="lg" asChild><Link href="/worker">Browse shifts <ArrowRight /></Link></Button>
        <Button variant="ghost" size="sm" onClick={onStartOver}>Start the wizard again</Button>
      </motion.div>
      <p className="mt-8 max-w-sm text-xs leading-5 text-fg-subtle">Prototype note: this walkthrough doesn&rsquo;t create a new account. The demo stays signed in as Aline Uwase so the rest of the app has real history to show.</p>
    </Card>
  );
}
