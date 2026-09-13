import type { PayoutMethod } from "@/types";

export const PAYOUT_METHODS: Array<{ value: PayoutMethod; label: string; hint: string; numberLabel: string; placeholder: string }> = [
  { value: "MTN MoMo", label: "MTN Mobile Money", hint: "Paid within an hour of approval", numberLabel: "MoMo number", placeholder: "078 or 079" },
  { value: "Airtel Money", label: "Airtel Money", hint: "Paid within an hour of approval", numberLabel: "Airtel Money number", placeholder: "072 or 073" },
  { value: "Bank transfer", label: "Bank transfer", hint: "Next business day", numberLabel: "Account number", placeholder: "Account number" },
];

export const BANKS = ["Bank of Kigali", "Equity Bank", "I&M Bank", "BPR Bank", "Cogebanque", "Ecobank"] as const;

export const APP_LANGUAGES = [
  { value: "en", label: "English" },
  { value: "rw", label: "Kinyarwanda" },
  { value: "fr", label: "Français" },
] as const;

export interface NotificationPrefs {
  matches: boolean;
  reminders: boolean;
  payments: boolean;
  marketing: boolean;
}

export const NOTIFICATION_PREFS: Array<{ key: keyof NotificationPrefs; label: string; description: string }> = [
  { key: "matches", label: "New shift matches", description: "When a shift fits your skills and district." },
  { key: "reminders", label: "Reminders 24 hours before", description: "A nudge the day before each confirmed shift." },
  { key: "payments", label: "Payments", description: "When a payout is approved and when it lands." },
  { key: "marketing", label: "Tips and news from GigSyc", description: "Occasional emails. Never more than twice a month." },
];

export const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = { matches: true, reminders: true, payments: true, marketing: false };

