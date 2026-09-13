"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/brand";
import { accountForEmail, accountForHint, FALLBACK_ACCOUNT, type DemoAccount } from "../accounts";
import { useSignIn } from "../use-sign-in";
import { DemoAccountList } from "./demo-account-list";
import { LoginAside } from "./login-aside";
import { LoginForm } from "./login-form";

/** /login — photograph on the left, one form on the right, no site chrome. */
export function LoginScreen() {
  const hinted = accountForHint(useSearchParams().get("as"));
  const [picked, setPicked] = useState<DemoAccount | null>(null);
  const [email, setEmail] = useState("");
  const { enter, pendingId, busy } = useSignIn();

  const selectedId = picked?.id ?? hinted?.id ?? null;

  const choose = (account: DemoAccount) => {
    setPicked(account);
    setEmail(account.email);
    enter(account, account.id);
  };

  /** A typed email that matches a demo account enters as that person; anything else explores. */
  const submit = () => {
    const account = accountForEmail(email) ?? FALLBACK_ACCOUNT;
    if (!account) return;
    setPicked(account);
    enter(account, "form");
  };

  return (
    <div className="flex min-h-dvh bg-canvas">
      <LoginAside />

      <main id="main" className="flex min-h-dvh w-full flex-col px-5 pb-8 pt-6 sm:px-8 lg:w-[48%] lg:px-12 lg:pb-10">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" aria-label="GigSyc home" className="rounded-sm lg:hidden">
            <Logo size="md" />
          </Link>
          <Link
            href="/"
            className="ml-auto inline-flex h-11 items-center gap-1.5 text-[13px] font-medium text-fg-muted transition-colors hover:text-fg"
          >
            <ArrowLeft className="size-4" aria-hidden /> Back to the website
          </Link>
        </div>

        <div className="flex flex-1 flex-col justify-center py-8">
          <div className="mx-auto w-full max-w-[400px]">
            <h1 className="text-[28px] font-semibold leading-9 sm:text-[30px] sm:leading-10">Welcome back</h1>
            <p className="mt-2 text-sm leading-6 text-fg-muted">
              Sign in to discover events, manage your team or run the platform.
            </p>

            <LoginForm
              className="mt-8"
              email={email}
              onEmail={setEmail}
              onSubmit={submit}
              pending={pendingId === "form"}
              disabled={busy && pendingId !== "form"}
            />

            <div className="mt-8 flex items-center gap-3">
              <span className="h-px flex-1 bg-border" aria-hidden />
              <span className="text-xs text-fg-subtle">Or continue as</span>
              <span className="h-px flex-1 bg-border" aria-hidden />
            </div>

            <DemoAccountList
              className="mt-5"
              selectedId={selectedId}
              pendingId={pendingId}
              busy={busy}
              onChoose={choose}
            />

            <p className="mt-8 text-center text-sm text-fg-muted">
              New to GigSyc?{" "}
              <Link href="/events" className="font-medium text-navy-700 underline-offset-4 hover:underline">
                Browse events
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-fg-subtle">Prototype — no real accounts, payments or messages.</p>
      </main>
    </div>
  );
}
