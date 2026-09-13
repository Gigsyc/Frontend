"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/features/auth";
import { InterestPicker } from "@/features/onboarding/customer";
import { errorMessage, pluralize } from "@/lib/utils";
import type { AuthUser, InterestId } from "@/types";

const sameSet = (a: InterestId[], b: InterestId[]) =>
  a.length === b.length && a.every((x) => b.includes(x));

interface InterestsTabProps {
  user: AuthUser;
  /**
   * The unsaved selection, held by `<AccountScreen>`: the tab panel is unmounted the moment
   * the customer looks at another tab, and a picked-but-unsaved set must survive that.
   * `null` means "nothing edited yet", so the saved interests are what's shown.
   */
  draft: InterestId[] | null;
  onDraftChange: (next: InterestId[] | null) => void;
}

export function InterestsTab({ user, draft, onDraftChange }: InterestsTabProps) {
  const { updateUser } = useAuth();
  const [saving, setSaving] = useState(false);

  const selected = draft ?? user.interests;
  const changed = !sameSet(selected, user.interests);

  const save = async () => {
    setSaving(true);
    try {
      await updateUser({ interests: selected });
      onDraftChange(null);
      toast.success("Interests saved", {
        description: selected.length
          ? "Your event rows will follow these from now on."
          : "We'll show you everything that's on until you pick some again.",
      });
    } catch (err) {
      toast.error(errorMessage(err, "We couldn't save your interests. Try again."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-5">
        <h2 className="text-base font-semibold">What you&apos;re interested in</h2>
        <p className="mt-1 text-sm text-fg-muted">
          Pick as many as you like. {pluralize(selected.length, "interest")} selected.
        </p>

        <InterestPicker
          value={selected}
          onChange={onDraftChange}
          label="What you're interested in"
          disabled={saving}
          className="mt-5"
        />

        <p className="mt-5 text-[13px] leading-5 text-fg-subtle">
          Interests decide the &ldquo;Because you like&hellip;&rdquo; row on the events page and nothing else.
          We match them to event categories — there is no recommendation engine behind it.
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button className="h-11" onClick={save} loading={saving} disabled={!changed}>Save interests</Button>
          {changed ? (
            <Button variant="ghost" className="h-11" onClick={() => onDraftChange(null)} disabled={saving}>
              Undo changes
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
