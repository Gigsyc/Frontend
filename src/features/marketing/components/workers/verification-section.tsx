import { BadgeCheck } from "lucide-react";
import { VERIFICATION_LABELS } from "@/components/ui/verified";
import type { VerificationKey } from "@/types";
import { Section, SectionIntro } from "../section";

const CHECKS = Object.keys(VERIFICATION_LABELS) as VerificationKey[];

export function VerificationSection() {
  return (
    <Section tone="canvas" id="verification">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <SectionIntro
          eyebrow="Verification"
          title="Verified once, trusted everywhere"
          lede="Five checks, done once when you join. Employers see a single Verified mark; you never re-send documents for each shift."
        />
        <ol className="grid gap-3 sm:grid-cols-2">
          {CHECKS.map((key, i) => {
            const v = VERIFICATION_LABELS[key];
            return (
              <li key={key} className="flex gap-3 rounded-lg bg-surface p-4 shadow-card">
                <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-cyan-50 font-display text-xs font-semibold text-cyan-800 tabular">{i + 1}</span>
                <div>
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-fg">{v.label} <BadgeCheck className="size-3.5 fill-cyan-100 text-cyan-700" aria-hidden /></p>
                  <p className="mt-0.5 text-[13px] leading-5 text-fg-muted">{v.description}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </Section>
  );
}
