import type { Metadata } from "next";
import { LoginScreen } from "@/features/auth/components/login-screen";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to GigSyc to discover events, manage your team or run the platform.",
};

/**
 * `?as=` is read here rather than through `useSearchParams` so the whole split screen —
 * photograph, heading, form — renders on the server instead of behind a blank boundary.
 */
export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { as } = await searchParams;
  return <LoginScreen hint={typeof as === "string" ? as : undefined} />;
}
