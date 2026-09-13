import type { Metadata } from "next";
import { ResetPasswordScreen } from "@/features/auth/components/recovery/reset-password-screen";

export const metadata: Metadata = {
  title: "Reset password",
  description: "Choose a new password for your GigSyc account.",
};

/** No `?token=` means the link was mistyped or has expired; the screen says so. */
export default async function ResetPasswordPage({ searchParams }: PageProps<"/reset-password">) {
  const { token } = await searchParams;
  return <ResetPasswordScreen token={typeof token === "string" && token ? token : undefined} />;
}
