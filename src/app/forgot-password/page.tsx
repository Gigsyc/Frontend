import type { Metadata } from "next";
import { ForgotPasswordScreen } from "@/features/auth/components/recovery/forgot-password-screen";

export const metadata: Metadata = {
  title: "Forgot password",
  description: "Send yourself instructions to reset your GigSyc password.",
};

/** `?email=` carries over whatever was typed on the sign-in form, so it is not asked twice. */
export default async function ForgotPasswordPage({ searchParams }: PageProps<"/forgot-password">) {
  const { email } = await searchParams;
  return <ForgotPasswordScreen email={typeof email === "string" ? email : undefined} />;
}
