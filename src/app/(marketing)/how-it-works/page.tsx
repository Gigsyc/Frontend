import type { Metadata } from "next";
import { CtaBand } from "@/features/marketing/components/cta-band";
import { HowFaq } from "@/features/marketing/components/how/how-faq";
import { HowHero } from "@/features/marketing/components/how/how-hero";
import { LoopNarrative } from "@/features/marketing/components/how/loop-narrative";

export const metadata: Metadata = {
  title: "How it works",
  description: "Connect, work, verify, pay, build reputation, reconnect. The GigSyc loop explained from both the employer's and the professional's side.",
};

export default function HowItWorksPage() {
  return (
    <>
      <HowHero />
      <LoopNarrative />
      <HowFaq />
      <CtaBand
        title="Try the loop from either side."
        body="Two demo accounts, live prototype data. Post a shift as Ikaze Hospitality Group or accept one as Aline Uwase."
        primary={{ label: "Post a shift", href: "/login?as=employer" }}
        secondary={{ label: "Find shifts", href: "/login?as=worker" }}
      />
    </>
  );
}
