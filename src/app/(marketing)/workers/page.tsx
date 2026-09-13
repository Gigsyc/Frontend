import type { Metadata } from "next";
import { CtaBand } from "@/features/marketing/components/cta-band";
import { PayTable } from "@/features/marketing/components/workers/pay-table";
import { PaymentsSection } from "@/features/marketing/components/workers/payments-section";
import { ReputationSection } from "@/features/marketing/components/workers/reputation-section";
import { VerificationSection } from "@/features/marketing/components/workers/verification-section";
import { WorkerSteps } from "@/features/marketing/components/workers/worker-steps";
import { WorkersHero } from "@/features/marketing/components/workers/workers-hero";

export const metadata: Metadata = {
  title: "For professionals",
  description: "Banquet, conference, activation and retail shifts across Kigali. Fixed pay per shift, QR check-in, paid to MTN MoMo or Airtel Money within 48 hours, and a reputation that travels with you.",
};

export default function WorkersPage() {
  return (
    <>
      <WorkersHero />
      <PayTable />
      <WorkerSteps />
      <ReputationSection />
      <VerificationSection />
      <PaymentsSection />
      <CtaBand
        title="See what a shift looks like from your side."
        body="Log in as Aline Uwase, a hospitality student with 42 completed shifts, to browse open shifts, accept an invitation and check your earnings."
        primary={{ label: "Find shifts", href: "/login?as=worker" }}
        secondary={{ label: "How it works", href: "/how-it-works" }}
      />
    </>
  );
}
