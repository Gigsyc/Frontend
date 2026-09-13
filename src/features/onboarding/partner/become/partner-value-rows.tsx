import type { ReactNode } from "react";
import { Section, SectionIntro } from "@/features/marketing/components/section";
import { cn } from "@/lib/utils";
import { PARTNER_VALUE } from "./content";
import { CandidatesPreview, EventsBoardPreview, InvoicePreview } from "./partner-previews";

/** One row: words on one side, a piece of the real product on the other. */
function ValueRow({ title, body, media, flip }: { title: string; body: string; media: ReactNode; flip?: boolean }) {
  return (
    <div className="grid items-center gap-6 lg:grid-cols-2 lg:gap-14">
      <div className={cn("max-w-lg", flip && "lg:order-2 lg:justify-self-end")}>
        <h3 className="text-[22px] font-semibold leading-snug sm:text-[26px]">{title}</h3>
        <p className="mt-3 text-base leading-7 text-fg-muted">{body}</p>
      </div>
      <div className={cn(flip && "lg:order-1")}>{media}</div>
    </div>
  );
}

export function PartnerValueRows() {
  return (
    <Section tone="canvas" size="md">
      <SectionIntro
        eyebrow="What you get"
        title="Three things a partner account does for you."
        lede="Listing, staffing and settlement in one place, so the event and the people running it are not managed in two systems."
      />
      <div className="mt-12 flex flex-col gap-14 lg:gap-20">
        <ValueRow {...PARTNER_VALUE.reach} media={<EventsBoardPreview />} />
        <ValueRow {...PARTNER_VALUE.staff} media={<CandidatesPreview />} flip />
        <ValueRow {...PARTNER_VALUE.invoice} media={<InvoicePreview />} />
      </div>
    </Section>
  );
}
