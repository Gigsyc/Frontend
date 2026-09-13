import { Section, SectionIntro } from "../section";
import { CheckList } from "../check-list";
import { ProfilePreview } from "./profile-preview";

const POINTS = [
  "Every completed shift adds verified hours to your record",
  "Employers rate punctuality, professionalism and competence — good scores get you invited first",
  "Feedback is written by the supervisor who worked with you, not a form",
];

export function ReputationSection() {
  return (
    <Section>
      <div className="grid gap-12 lg:grid-cols-2 lg:items-start lg:gap-16">
        <div>
          <SectionIntro
            eyebrow="Reputation"
            title="Your reputation travels with you"
            lede="A good shift at one hotel should count at the next one. On GigSyc it does: your ratings, reliability score and verified hours are one profile every employer sees."
          />
          <CheckList items={POINTS} className="mt-8" />
        </div>
        <ProfilePreview />
      </div>
    </Section>
  );
}
