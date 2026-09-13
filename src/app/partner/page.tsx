import type { Metadata } from "next";
import { PartnerWorkspaceGate } from "@/features/onboarding/partner";

export const metadata: Metadata = { title: "Partner workspace" };

export default function PartnerPage() {
  return <PartnerWorkspaceGate />;
}
