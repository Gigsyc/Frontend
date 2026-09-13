import { store } from "@/lib/mock/store";
import type { AuthUser, CustomerOnboardingInput, PartnerOnboardingInput, SignUpInput } from "@/types";

export interface SocialAccount {
  name: string;
  email: string;
  avatarColor: string;
}

/** @deprecated Use SocialAccount. */
export type GoogleAccount = SocialAccount;

/**
 * The single seam between the app and "the identity provider".
 *
 * Everything is mocked against the in-memory store. To go live, replace these
 * bodies with real calls — `signInWithGoogle` becomes an OAuth code exchange,
 * `signIn` a credential POST — and nothing above this file changes.
 */
export const authService = {
  signIn: (email: string, password: string) => store.signIn(email, password),
  signUp: (input: SignUpInput) => store.signUp(input),
  /** Takes an already-chosen provider identity; no credentials ever reach this app. */
  signInWithGoogle: (account: SocialAccount, role?: AuthUser["role"]) =>
    store.signInWithProvider({ provider: "google", name: account.name, email: account.email, role }),
  signInWithApple: (account: SocialAccount, role?: AuthUser["role"]) =>
    store.signInWithProvider({ provider: "apple", name: account.name, email: account.email, role }),
  getAccount: (id: string) => store.getAccount(id),
  updateAccount: (id: string, patch: Partial<AuthUser>) => store.updateAccount(id, patch),
  verifyEmail: (id: string, code: string) => store.verifyEmail(id, code),
  resendVerification: (email: string) => store.resendVerification(email),
  requestPasswordReset: (email: string) => store.requestPasswordReset(email),
  resetPassword: (password: string) => store.resetPassword(password),
  completeCustomerOnboarding: (id: string, input: CustomerOnboardingInput) => store.completeCustomerOnboarding(id, input),
  completePartnerOnboarding: (id: string, input: PartnerOnboardingInput) => store.completePartnerOnboarding(id, input),
};
