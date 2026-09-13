import { Photo } from "@/components/ui/photo";
import { IMAGES } from "@/data/images";
import { Eyebrow, Section } from "@/features/marketing/components/section";
import { PartnerHeroActions } from "./partner-hero-actions";

export function PartnerHero() {
  return (
    <Section size="lg">
      <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <div className="max-w-xl">
          <Eyebrow>GigSyc for Partners</Eyebrow>
          <h1 className="mt-5 text-[38px] font-semibold leading-[1.06] sm:text-[46px] lg:text-[50px]">
            List your events on GigSyc
          </h1>
          <p className="mt-6 max-w-lg text-[17px] leading-7 text-fg-muted">
            Concerts, tours, dinners, workshops and race days — put them in front of the people already
            browsing what is on in Rwanda this week, and hire the staff to run them from the same account.
          </p>
          <PartnerHeroActions />
        </div>
        <Photo
          src={IMAGES.festivalStage}
          alt="Crew setting the stage before a festival crowd arrives in Kigali"
          aspect="auto"
          priority
          className="aspect-[4/3] lg:aspect-[5/4]"
          sizes="(max-width: 1024px) 100vw, 45vw"
        />
      </div>
    </Section>
  );
}
