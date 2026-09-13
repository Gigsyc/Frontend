import Link from "next/link";
import { ArrowRight, UserRoundPen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

/** Quiet nudge under the feed: more skills on the profile means more matches. */
export function LookingForCard() {
  return (
    <Card className="flex flex-col gap-3 bg-navy-50 p-4 shadow-none sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div className="flex items-start gap-3">
        <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-md bg-surface text-navy-800">
          <UserRoundPen className="size-4" aria-hidden />
        </span>
        <div>
          <h2 className="text-[15px] font-semibold">Looking for something specific?</h2>
          <p className="mt-0.5 text-[13px] text-fg-muted">Add skills like bartending or AV support to your profile and we&apos;ll match you to those shifts too.</p>
        </div>
      </div>
      <Button variant="outline" size="sm" className="shrink-0 self-start sm:self-auto" asChild>
        <Link href="/worker/profile">Update skills <ArrowRight /></Link>
      </Button>
    </Card>
  );
}
