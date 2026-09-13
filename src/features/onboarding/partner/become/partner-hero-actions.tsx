"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROLE_LABEL } from "@/data/auth";
import { useAuth } from "@/features/auth";

/**
 * /signup and /login both bounce a signed-in visitor to their own home, so offering those two
 * buttons to someone who is already signed in is a dead end they get no explanation for.
 * A partner is offered their workspace instead, and everyone else is told plainly why there
 * is no button here for them — one account is one role in the prototype.
 */
export function PartnerHeroActions() {
  const { user, ready } = useAuth();

  // `ready` is false on the server and on the first client render, which is also the state
  // most visitors to this page are actually in: signed out.
  if (!ready || !user) {
    return (
      <>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button size="lg" asChild>
            <Link href="/signup?role=partner">Become a partner <ArrowRight /></Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/login">Already a partner? Sign in</Link>
          </Button>
        </div>
        <p className="mt-5 text-[13px] text-fg-subtle">
          Free to list. You are charged only for shifts your professionals actually work.
        </p>
      </>
    );
  }

  if (user.role === "partner") {
    return (
      <>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button size="lg" asChild>
            <Link href="/partner">Open my workspace <ArrowRight /></Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/events">Browse what is on</Link>
          </Button>
        </div>
        <p className="mt-5 text-[13px] text-fg-subtle">
          Signed in as {user.organization?.name ?? user.name}.
        </p>
      </>
    );
  }

  return (
    <>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button size="lg" variant="outline" asChild>
          <Link href="/events">Browse what is on <ArrowRight /></Link>
        </Button>
      </div>
      <p className="mt-5 max-w-md text-[13px] leading-5 text-fg-subtle">
        You are signed in with a {ROLE_LABEL[user.role].toLowerCase()} account. Partner accounts are
        separate today — sign out first if you want to run events on GigSyc.
      </p>
    </>
  );
}
