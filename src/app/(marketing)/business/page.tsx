import type { Metadata } from "next";
import { BusinessFaq } from "@/features/marketing/components/business/business-faq";
import { BusinessHero } from "@/features/marketing/components/business/business-hero";
import { HiringProblems } from "@/features/marketing/components/business/hiring-problems";
import { PricingSection } from "@/features/marketing/components/business/pricing-section";
import { ProductTour } from "@/features/marketing/components/business/product-tour";
import { SectorsSection } from "@/features/marketing/components/business/sectors-section";
import { CtaBand } from "@/features/marketing/components/cta-band";

export const metadata: Metadata = {
  title: "For business",
  description: "Post a shift, confirm verified professionals from a ranked list, check them in by QR and pay one invoice a fortnight. Hospitality, events, activations, corporate and retail in Kigali.",
};

export default function BusinessPage() {
  return (
    <>
      <BusinessHero />
      <HiringProblems />
      <ProductTour />
      <SectorsSection />
      <PricingSection />
      <BusinessFaq />
      <CtaBand
        title="Your next shift could be confirmed by morning."
        body="Log in as Ikaze Hospitality Group to post a shift, rank candidates and run attendance with live prototype data. Nothing is billed or sent to real workers."
        primary={{ label: "Post a shift", href: "/login?as=employer" }}
        secondary={{ label: "See how it works", href: "/how-it-works" }}
      />
    </>
  );
}
