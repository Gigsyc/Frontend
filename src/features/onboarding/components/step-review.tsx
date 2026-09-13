"use client";

import Link from "next/link";
import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckboxField } from "@/components/ui/checkbox";
import { DataList } from "@/components/ui/data-list";
import { ROLES } from "@/data/roles";
import { formatRwf } from "@/lib/utils";
import { normaliseRwMobile } from "@/lib/utils";
import type { Action, OnboardingState } from "../lib/state";
import { EXPERIENCE_OPTIONS, RADIUS_OPTIONS, STEPS, type StepErrors } from "../lib/steps";

function Section({ title, step, onEdit, children }: { title: string; step: number; onEdit: (i: number) => void; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-border p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-fg">{title}</h3>
        <Button variant="ghost" size="sm" onClick={() => onEdit(step)} aria-label={`Edit ${title.toLowerCase()}`}><Pencil /> Edit</Button>
      </div>
      {children}
    </section>
  );
}

const WINDOW_LABELS: Record<keyof OnboardingState["availability"]["windows"], string> = { weekdays: "Weekdays", weekends: "Weekends", evenings: "Evenings", overnight: "Overnight" };

export function StepReview({ state, errors, dispatch }: { state: OnboardingState; errors: StepErrors; dispatch: (a: Action) => void }) {
  const { about, skills, availability, verify } = state;
  const goto = (i: number) => dispatch({ type: "goto", step: i });
  const idx = (id: (typeof STEPS)[number]["id"]) => STEPS.findIndex((s) => s.id === id);
  const phone = normaliseRwMobile(about.phone);
  const windows = (Object.keys(availability.windows) as Array<keyof typeof availability.windows>).filter((k) => availability.windows[k]).map((k) => WINDOW_LABELS[k]);
  const radius = RADIUS_OPTIONS.find((o) => o.value === availability.radius);
  const dash = <span className="text-fg-subtle">Not set</span>;

  return (
    <div className="flex flex-col gap-4">
      <Section title="About you" step={idx("about")} onEdit={goto}>
        <DataList
          columns={2}
          items={[
            { label: "Name", value: about.firstName || about.lastName ? `${about.firstName} ${about.lastName}`.trim() : dash },
            { label: "Mobile", value: phone ? <span className="tabular">+250 {phone.slice(0, 3)} {phone.slice(3, 6)} {phone.slice(6)}</span> : dash },
            { label: "District", value: about.district || dash },
            { label: "Languages", value: about.languages.length ? about.languages.join(", ") : dash },
          ]}
        />
      </Section>

      <Section title="Skills & experience" step={idx("skills")} onEdit={goto}>
        <DataList
          items={[
            {
              label: "Roles",
              value: skills.roles.length ? (
                <span className="flex flex-wrap gap-1.5 pt-0.5">
                  {skills.roles.map((r) => <Badge key={r} tone={r === skills.primary ? "solid-amber" : "navy"}>{ROLES[r].short}{r === skills.primary ? " · primary" : ""}</Badge>)}
                </span>
              ) : dash,
            },
            { label: "Experience", value: skills.experience ? EXPERIENCE_OPTIONS.find((o) => o.value === skills.experience)!.label : dash },
            { label: "Headline", value: skills.headline.trim() || dash },
          ]}
        />
      </Section>

      <Section title="Availability & pay" step={idx("availability")} onEdit={goto}>
        <DataList
          columns={2}
          items={[
            { label: "Available", value: windows.length ? windows.join(", ") : dash },
            { label: "Minimum per shift", value: availability.minPay ? <span className="tabular">{formatRwf(Number(availability.minPay))}</span> : dash },
            { label: "Travel", value: radius ? (radius.value === "home" && about.district ? `${about.district} only` : radius.label) : dash },
          ]}
        />
      </Section>

      <Section title="Identity" step={idx("verify")} onEdit={goto}>
        <DataList
          columns={2}
          items={[
            { label: "National ID", value: verify.idFront ? <Badge tone="success">Uploaded</Badge> : <Badge tone="warning">Missing</Badge> },
            { label: "Selfie", value: verify.selfie ? <Badge tone="success">Uploaded</Badge> : <Badge tone="warning">Missing</Badge> },
          ]}
        />
      </Section>

      <div className="rounded-lg bg-canvas p-4">
        <CheckboxField
          checked={state.agreed}
          onCheckedChange={(v) => dispatch({ type: "setAgreed", on: v === true })}
          label={<>I agree to the GigSyc <Link href="/how-it-works#trust" className="text-navy-700 underline underline-offset-4" target="_blank" rel="noopener">Community standards</Link></>}
          description="Show up when you've confirmed, be on time, and treat guests and colleagues with respect. Two no-shows without notice pause your account."
          className="min-h-11"
        />
        {errors.agreed ? <p role="alert" className="mt-2 text-[13px] text-danger-600">{errors.agreed}</p> : null}
      </div>
    </div>
  );
}
