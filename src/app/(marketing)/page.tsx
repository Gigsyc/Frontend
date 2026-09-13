import type { Metadata } from "next";
import { AudienceCards } from "@/features/marketing/components/home/audience-cards";
import { HomeHero } from "@/features/marketing/components/home/hero";
import { HowItFills } from "@/features/marketing/components/home/how-it-fills";
import { ProofStrip } from "@/features/marketing/components/home/proof-strip";
import { SectorRow } from "@/features/marketing/components/home/sector-row";
import { TrustSection } from "@/features/marketing/components/home/trust-section";
import { WhatsHappening } from "@/features/marketing/components/home/whats-happening";
import { CtaBand } from "@/features/marketing/components/cta-band";

export const metadata: Metadata = {
  title: { absolute: "GigSyc — The talent you need. When you need it." },
  description: "Kigali businesses post shifts; verified professionals accept them, check in by QR and are paid to mobile money. Hospitality, events, activations, retail.",
};

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <ProofStrip />
      <HowItFills />
      <WhatsHappening />
      <AudienceCards />
      <SectorRow />
      <TrustSection />
      <CtaBand
        title="Post your first shift today."
        body="Two minutes to post, a ranked list of verified professionals by the morning, one invoice a fortnight. Or explore the worker side and see what a shift looks like from the other end."
        primary={{ label: "Post a shift", href: "/login?as=employer" }}
        secondary={{ label: "I'm looking for work", href: "/login?as=worker" }}
      />
    </>
  );
}
