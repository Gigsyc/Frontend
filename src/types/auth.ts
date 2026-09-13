/**
 * Authentication and onboarding model.
 *
 * `AuthUser` is the session identity. It is intentionally small: signup collects
 * almost nothing, and onboarding fills in location, interests and preference.
 * A partner additionally carries an organisation.
 *
 * Every existing `Persona` is derived from this, so the workforce product keeps
 * working unchanged — see features/auth/model.ts.
 */
import type { RwandaPlace } from "./events";

export type UserRole = "customer" | "partner" | "worker" | "admin";

export type SignInMethod = "email" | "google" | "apple";

export type InterestId =
  | "culture" | "food" | "music" | "nightlife" | "nature" | "adventure"
  | "sports" | "history" | "family" | "art" | "business" | "festivals";

export type DiscoveryPreferenceId =
  | "near_me" | "places" | "weekends" | "trips" | "food_culture" | "everything";

export type OrganizationType =
  | "event_organizer" | "tour_operator" | "hotel" | "restaurant"
  | "experience_provider" | "cultural_organization" | "attraction";

export interface PartnerOrganization {
  name: string;
  type: OrganizationType;
  contactName: string;
  phone: string;
  place: RwandaPlace;
  /** Set once an admin verifies the partner. */
  verified: boolean;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarColor: string;
  emailVerified: boolean;
  onboardingCompleted: boolean;
  signInMethod: SignInMethod;
  createdAt: string;
  /** Filled during customer onboarding. */
  location?: RwandaPlace;
  interests: InterestId[];
  discoveryPreference?: DiscoveryPreferenceId;
  /** Partner accounts only. */
  organization?: PartnerOrganization;
  /** Links into the existing product records so one identity drives every surface. */
  employerId?: string;
  workerId?: string;
  platformUserId?: string;
}

export interface SignUpInput {
  name: string;
  email: string;
  password: string;
  /** Customers sign up by default; the partner path sets this explicitly. */
  role?: Extract<UserRole, "customer" | "partner">;
}

export interface CustomerOnboardingInput {
  location: RwandaPlace;
  interests: InterestId[];
  discoveryPreference?: DiscoveryPreferenceId;
}

export interface PartnerOnboardingInput {
  organizationName: string;
  organizationType: OrganizationType;
  contactName: string;
  phone: string;
  place: RwandaPlace;
}

export class AuthError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "invalid_credentials" | "email_taken" | "not_found"
      | "weak_password" | "unverified" | "network" = "network",
  ) {
    super(message);
    this.name = "AuthError";
  }
}
