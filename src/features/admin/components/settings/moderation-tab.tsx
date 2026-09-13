"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { SwitchField } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useSimulatedSave } from "./use-simulated-save";

interface Rules {
  reviewBeforePublish: boolean;
  autoPublishVerified: boolean;
  freeWithoutAddress: boolean;
}

const SWITCHES: Array<{ key: keyof Rules; label: string; description: string }> = [
  {
    key: "reviewBeforePublish",
    label: "Require review before an event is published",
    description: "Submissions land in the review queue instead of going straight to the public site.",
  },
  {
    key: "autoPublishVerified",
    label: "Auto-publish from verified partners",
    description: "Skips the queue for partners whose documents you have already checked.",
  },
  {
    key: "freeWithoutAddress",
    label: "Allow free events without a venue address",
    description: "Useful for meeting points that move, but customers see only the place name.",
  },
];

const MAX_DAYS = 90;

export function ModerationTab() {
  const { saving, save } = useSimulatedSave("Review rules and the auto-archive window updated.");
  const [rules, setRules] = useState<Rules>({ reviewBeforePublish: true, autoPublishVerified: false, freeWithoutAddress: false });
  const [days, setDays] = useState("7");
  const [error, setError] = useState<string | undefined>();
  const [submitted, setSubmitted] = useState(false);

  const validate = (value: string) => {
    const n = Number(value);
    if (!value.trim() || !Number.isInteger(n) || n < 1 || n > MAX_DAYS) return `Pick a whole number of days between 1 and ${MAX_DAYS}.`;
    return undefined;
  };

  const submit = (ev: FormEvent) => {
    ev.preventDefault();
    setSubmitted(true);
    const problem = validate(days);
    setError(problem);
    if (problem) return;
    save();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Moderation</CardTitle>
        <CardDescription>What happens to an event between an organiser submitting it and a customer seeing it.</CardDescription>
      </CardHeader>
      <form onSubmit={submit} noValidate>
        <CardContent className="flex flex-col gap-5 pt-4">
          {SWITCHES.map((s) => (
            <SwitchField
              key={s.key}
              label={s.label}
              description={s.description}
              checked={rules[s.key]}
              onCheckedChange={(v) => setRules((r) => ({ ...r, [s.key]: v }))}
              className="min-h-11"
            />
          ))}
          <div className="border-t border-border pt-5">
            <Field
              label="Days before an event auto-archives after it ends"
              required
              error={error}
              hint="Archived events drop off the public site but keep their page for anyone with the link."
              className="max-w-xs"
            >
              {(p) => (
                <Input
                  {...p}
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={MAX_DAYS}
                  value={days}
                  onChange={(e) => { setDays(e.target.value); if (submitted) setError(validate(e.target.value)); }}
                  onBlur={() => { if (submitted) setError(validate(days)); }}
                  className="tabular"
                />
              )}
            </Field>
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit" loading={saving}>Save moderation rules</Button>
        </CardFooter>
      </form>
    </Card>
  );
}
