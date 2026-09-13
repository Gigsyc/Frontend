import type { Metadata } from "next";
import { SignupScreen } from "@/features/auth/components/signup/signup-screen";

export const metadata: Metadata = {
  title: "Create your account",
  description: "Create a GigSyc account to discover events across Rwanda, or to list your own as a partner.",
};

/**
 * `?role=partner` and `?next=` are read here so the heading and the sign-in link are
 * correct in the first render rather than after hydration.
 */
export default async function SignupPage({ searchParams }: PageProps<"/signup">) {
  const { role, next } = await searchParams;
  return (
    <SignupScreen
      partner={role === "partner"}
      next={typeof next === "string" ? next : undefined}
    />
  );
}
