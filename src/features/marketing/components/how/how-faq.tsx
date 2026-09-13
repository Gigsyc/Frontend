import { HOW_FAQ } from "../../content";
import { Faq } from "../faq";
import { Section, SectionIntro } from "../section";

export function HowFaq() {
  return (
    <Section tone="canvas">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <SectionIntro eyebrow="Questions" title="Three things people ask about GigSyc" />
        <Faq items={HOW_FAQ} />
      </div>
    </Section>
  );
}
