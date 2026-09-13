import { BadgeCheck } from "lucide-react";
import { VERIFICATION_LABELS } from "@/components/ui/verified";
import type { VerificationKey } from "@/types";
import { Section, SectionIntro } from "../section";
import { TwoWayReviewCard } from "./two-way-review-card";

const CHECKS = Object.keys(VERIFICATION_LABELS) as VerificationKey[];

export function TrustSection() {
  return (
    <Section id="trust">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-start lg:gap-16">
        <div>
          <SectionIntro
            eyebrow="Trust"
            title="Two-way accountability"
            lede="Employers rate punctuality, professionalism and competence after every shift. Workers rate the employer on briefing, treatment and on-time payment. Both records are visible on the platform, so good behaviour compounds and no-shows don't get a second try elsewhere."
          />
          <h3 className="mt-10 text-base font-semibold">Five checks before a first shift</h3>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {CHECKS.map((key) => {
              const v = VERIFICATION_LABELS[key];
              return (
                <li key={key} className="flex gap-3 rounded-lg border border-border p-4">
                  <BadgeCheck className="mt-0.5 size-4 shrink-0 fill-cyan-100 text-cyan-700" aria-hidden />
                  <div>
                    <p className="text-sm font-semibold text-fg">{v.label}</p>
                    <p className="mt-0.5 text-[13px] leading-5 text-fg-muted">{v.description}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
        <TwoWayReviewCard />
      </div>
    </Section>
  );
}
