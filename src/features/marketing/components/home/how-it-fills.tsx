import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FILL_STEPS } from "../../content";
import { Section, SectionIntro } from "../section";
import { StepTimeline } from "../step-timeline";

export function HowItFills() {
  return (
    <Section>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <SectionIntro
          eyebrow="How a shift gets filled"
          title="From posting to payment in four steps"
          lede="One flow for a six-person brunch or a 40-steward arena night. The same QR check-in, the same fortnightly invoice."
        />
        <Link href="/how-it-works" className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-700 hover:underline underline-offset-4 [&_svg]:size-4">
          The full loop, both sides <ArrowRight aria-hidden />
        </Link>
      </div>
      <StepTimeline steps={FILL_STEPS} className="mt-12" />
    </Section>
  );
}
