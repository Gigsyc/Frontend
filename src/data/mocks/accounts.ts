import type { AuthUser } from "@/types";
import { dayOffset } from "./dates";
import { DEMO_ADMIN_ID, DEMO_CUSTOMER_ID } from "./platform";

/**
 * Seeded sign-in accounts. These four are the demo personas shown on the login page.
 * All have completed onboarding, so signing in as one goes straight to the product —
 * only a freshly created account sees the onboarding flow.
 */
export const ACCOUNTS: AuthUser[] = [
  {
    id: "ac_chantal",
    name: "Chantal Iradukunda",
    email: "chantal.i@example.rw",
    role: "customer",
    avatarColor: "#001b56",
    emailVerified: true,
    onboardingCompleted: true,
    signInMethod: "email",
    createdAt: dayOffset(-140),
    location: "Kigali",
    interests: ["music", "food", "culture", "nightlife"],
    discoveryPreference: "near_me",
    platformUserId: DEMO_CUSTOMER_ID,
  },
  {
    id: "ac_diane",
    name: "Diane Mukamana",
    email: "diane@ikaze.rw",
    role: "partner",
    avatarColor: "#001b56",
    emailVerified: true,
    onboardingCompleted: true,
    signInMethod: "email",
    createdAt: dayOffset(-210),
    location: "Kigali",
    interests: ["business", "food"],
    employerId: "emp_ikaze",
    platformUserId: "pu_diane",
    organization: {
      name: "Ikaze Hospitality Group",
      type: "hotel",
      contactName: "Diane Mukamana",
      phone: "+250 788 300 214",
      place: "Kigali",
      verified: true,
    },
  },
  {
    id: "ac_aline",
    name: "Aline Uwase",
    email: "aline.uwase@example.rw",
    role: "worker",
    avatarColor: "#001b56",
    emailVerified: true,
    onboardingCompleted: true,
    signInMethod: "email",
    createdAt: dayOffset(-190),
    location: "Kigali",
    interests: ["music", "festivals"],
    workerId: "wk_aline",
    platformUserId: "pu_aline",
  },
  {
    id: "ac_patrick",
    name: "Patrick Nsengimana",
    email: "patrick@gigsyc.rw",
    role: "admin",
    avatarColor: "#001b56",
    emailVerified: true,
    onboardingCompleted: true,
    signInMethod: "email",
    createdAt: dayOffset(-365),
    interests: [],
    platformUserId: DEMO_ADMIN_ID,
  },
];

/**
 * Accounts the simulated Google chooser offers. One is an existing GigSyc user
 * (so "Continue with Google" signs straight in), one is new (so it creates an
 * account and runs onboarding).
 */
export const GOOGLE_ACCOUNTS = [
  { name: "Chantal Iradukunda", email: "chantal.i@example.rw", avatarColor: "#001b56" },
  { name: "Yvette Mukandori", email: "yvette.mukandori@gmail.com", avatarColor: "#b83527" },
] as const;

/**
 * Apple IDs the simulated chooser offers. The second uses Apple's private relay
 * address, which is what "Hide My Email" actually produces — worth showing because
 * it changes what an organiser sees about a customer.
 */
export const APPLE_ACCOUNTS = [
  { name: "Chantal Iradukunda", email: "chantal.i@example.rw", avatarColor: "#001b56", hideMyEmail: false },
  { name: "Olivier Rwema", email: "olivier.rwema@icloud.com", avatarColor: "#4d5567", hideMyEmail: true },
] as const;

/** What Apple substitutes when someone chooses to hide their address. */
export const APPLE_RELAY_DOMAIN = "privaterelay.appleid.com";

export const DEMO_ACCOUNT_IDS = {
  customer: "ac_chantal",
  partner: "ac_diane",
  worker: "ac_aline",
  admin: "ac_patrick",
} as const;
