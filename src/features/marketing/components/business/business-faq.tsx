import { BUSINESS_FAQ } from "../../content";
import { Faq } from "../faq";
import { Section, SectionIntro } from "../section";

export function BusinessFaq() {
  return (
    <Section>
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <SectionIntro eyebrow="Questions" title="What venue and agency managers ask first" />
        <Faq items={BUSINESS_FAQ} />
      </div>
    </Section>
  );
}
