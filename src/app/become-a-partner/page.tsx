import type { Metadata } from "next";
import { CtaBand } from "@/features/marketing/components/cta-band";
import { PartnerHero, PartnerHowItWorks, PartnerValueRows } from "@/features/onboarding/partner/become";

export const metadata: Metadata = {
  title: "Become a partner",
  description:
    "Bring your concerts, tours, dinners and race days to GigSyc, hire verified professionals to run them, and settle on one invoice. Organisations are verified before their events reach the public board, usually within a day.",
};

export default function BecomeAPartnerPage() {
  return (
    <>
      <PartnerHero />
      <PartnerValueRows />
      <PartnerHowItWorks />
      <CtaBand
        title="Put your next event in front of Rwanda."
        body="Create a partner account, tell us about your organisation, and post the shifts your next event needs. Nothing is charged until someone works one."
        primary={{ label: "Become a partner", href: "/signup?role=partner" }}
        secondary={{ label: "Browse what is on", href: "/events" }}
      />
    </>
  );
}
