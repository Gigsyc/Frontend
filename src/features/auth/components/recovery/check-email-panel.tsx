"use client";

import { Mail } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AuthHeading } from "@/components/layout/auth-layout";
import { EASE } from "@/lib/motion";
import { errorMessage } from "@/lib/utils";
import { useFocusOnMount } from "./use-focus-on-mount";

const RESEND_SECONDS = 30;

interface CheckEmailPanelProps {
  email: string;
  /** Asks the service again. Rejects with the service's own message. */
  onResend: () => Promise<void>;
  onUseDifferent: () => void;
}

/**
 * Shown after "Send reset instructions". It never says whether the address is registered —
 * the service always reports success, and so does this panel.
 */
export function CheckEmailPanel({ email, onResend, onUseDifferent }: CheckEmailPanelProps) {
  const panel = useFocusOnMount<HTMLDivElement>();
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [pending, setPending] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = window.setTimeout(() => setSecondsLeft((v) => v - 1), 1000);
    return () => window.clearTimeout(id);
  }, [secondsLeft]);

  const resend = async () => {
    setPending(true);
    setFailure(null);
    try {
      await onResend();
      setSecondsLeft(RESEND_SECONDS);
      toast.success("Instructions sent again", { description: "Nothing is really sent in the prototype — open the reset link below." });
    } catch (err) {
      setFailure(errorMessage(err, "We couldn't send that again. Try once more."));
    } finally {
      setPending(false);
    }
  };

  return (
    <motion.div
      ref={panel}
      tabIndex={-1}
      className="outline-none"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: EASE }}
    >
      <span className="mb-5 inline-flex size-12 items-center justify-center rounded-lg bg-navy-50 text-navy-700">
        <Mail className="size-6" aria-hidden />
      </span>

      <AuthHeading
        title="Check your email"
        description={
          <>
            We&rsquo;ve sent password reset instructions to
            <br />
            <span className="font-medium text-fg">{email}</span>
          </>
        }
      />

      {failure ? (
        <p role="alert" className="mb-4 rounded-md bg-danger-50 px-3 py-2.5 text-[13px] leading-5 text-danger-700">{failure}</p>
      ) : null}

      {/*
        The countdown itself is hidden from the live region — announcing a new number every
        second would talk over everything else. What is announced is the one thing that
        changes: whether the control can be used yet.
      */}
      <p aria-live="polite" className="text-sm text-fg-muted">
        Didn&rsquo;t get it?{" "}
        {secondsLeft > 0 ? (
          <>
            <span className="tabular text-fg-subtle" aria-hidden>Resend in {secondsLeft}s</span>
            <span className="sr-only">You can send them again in a moment.</span>
          </>
        ) : (
          <span className="sr-only">You can send them again now.</span>
        )}
      </p>

      <div className="mt-1 flex flex-col items-start">
        {secondsLeft > 0 ? null : (
          <button
            type="button"
            onClick={() => { void resend(); }}
            disabled={pending}
            className="inline-flex min-h-11 items-center text-sm font-medium text-navy-700 underline-offset-4 hover:underline disabled:opacity-60"
          >
            {pending ? "Sending…" : "Resend"}
          </button>
        )}
        <button
          type="button"
          onClick={onUseDifferent}
          className="inline-flex min-h-11 items-center text-sm font-medium text-navy-700 underline-offset-4 hover:underline"
        >
          Use a different email
        </button>
      </div>

      <p className="mt-8 border-t border-border pt-5 text-xs leading-5 text-fg-subtle">
        Prototype — no email is sent.{" "}
        <Link href="/reset-password?token=demo" className="font-medium text-fg-muted underline underline-offset-4 hover:text-fg">
          Open the reset link
        </Link>
        .
      </p>
    </motion.div>
  );
}
