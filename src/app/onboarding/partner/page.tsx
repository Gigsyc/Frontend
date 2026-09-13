import type { Metadata } from "next";
import { PartnerOnboardingScreen } from "@/features/onboarding/partner";

export const metadata: Metadata = { title: "Set up your organisation" };

export default function PartnerOnboardingPage() {
  return <PartnerOnboardingScreen />;
}
