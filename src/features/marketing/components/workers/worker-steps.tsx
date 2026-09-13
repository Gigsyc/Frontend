import { WORKER_STEPS } from "../../content";
import { Section, SectionIntro } from "../section";
import { StepTimeline } from "../step-timeline";

export function WorkerSteps() {
  return (
    <Section>
      <SectionIntro
        eyebrow="How it works for you"
        title="Four steps from sign-up to your first payout"
        lede="You choose the shifts. Nothing is assigned to you, and declining an invitation never counts against you."
      />
      <StepTimeline steps={WORKER_STEPS} className="mt-12" />
    </Section>
  );
}
