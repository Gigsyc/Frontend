import type { Metadata } from "next";
import { CustomerOnboardingScreen } from "@/features/onboarding/customer/customer-onboarding-screen";

export const metadata: Metadata = {
  title: "Get started",
  description: "Tell GigSyc where you are and what you like, and we'll put the right events first.",
};

export default function OnboardingPage() {
  return <CustomerOnboardingScreen />;
}
