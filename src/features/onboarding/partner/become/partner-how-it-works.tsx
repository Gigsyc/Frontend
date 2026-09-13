import { Section, SectionIntro } from "@/features/marketing/components/section";
import { StepTimeline } from "@/features/marketing/components/step-timeline";
import { PARTNER_STEPS } from "./content";

export function PartnerHowItWorks() {
  return (
    <Section size="md">
      <SectionIntro
        eyebrow="How it works"
        title="Four steps from signing up to being staffed."
        lede="Shifts you post for your own team are not reviewed and go out immediately. Your organisation is verified before your events can reach the public board, usually within a day."
      />
      <StepTimeline steps={PARTNER_STEPS} className="mt-12" />
    </Section>
  );
}
