import type { Metadata } from "next";
import { VerifyEmailScreen } from "@/features/auth/components/verify/verify-email-screen";

export const metadata: Metadata = {
  title: "Verify your email",
  description: "Confirm your GigSyc account with a six-digit code. Prototype — no email is actually sent.",
};

export default function VerifyEmailPage() {
  return <VerifyEmailScreen />;
}
