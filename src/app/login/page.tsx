import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginScreen } from "@/features/auth/components/login-screen";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to GigSyc to discover events, manage your team or run the platform.",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-canvas" aria-busy />}>
      <LoginScreen />
    </Suspense>
  );
}
