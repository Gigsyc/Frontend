import {
  CalendarCheck,
  ClipboardPen,
  HandCoins,
  Link2,
  QrCode,
  Repeat,
  ShieldCheck,
  Sparkles,
  Star,
  UserRound,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { RoleCategory, Sector } from "@/types";
import type { ImageKey } from "@/data/images";

/**
 * Marketing copy. Content lives here so section components stay small and the
 * words can be edited in one place. Domain data (shifts, workers, pay) always
 * comes from the store via hooks — never from this file.
 */

export interface Step {
  id: string;
  title: string;
  body: string;
  icon: LucideIcon;
}

export const FILL_STEPS: Step[] = [
  { id: "post", title: "Post", body: "Role, venue, date, pay and dress code. Two minutes, no phone tree.", icon: ClipboardPen },
  { id: "match", title: "Match", body: "Verified professionals nearby are notified. You confirm from a list ranked by skills, distance and track record.", icon: Sparkles },
  { id: "work", title: "Work & check in", body: "Workers scan the QR code at the staff entrance. You see who is on site, live.", icon: QrCode },
  { id: "pay", title: "Pay & rate", body: "Approve hours and rate the team. Workers are paid to MoMo within 48 hours; you get one invoice a fortnight.", icon: Wallet },
];

export const WORKER_STEPS: Step[] = [
  { id: "profile", title: "Create your profile", body: "Skills, districts, languages and when you can work. ID and phone verification takes about a day.", icon: UserRound },
  { id: "accept", title: "Accept a shift", body: "Browse open shifts or accept an invitation. Pay, hours, venue and dress code are fixed before you say yes.", icon: CalendarCheck },
  { id: "checkin", title: "Check in with QR", body: "Scan the code at the venue. Your hours are timestamped, so there is nothing to argue about later.", icon: QrCode },
  { id: "paid", title: "Get paid and rated", body: "MTN MoMo or Airtel Money within 48 hours of approval. Every rating adds to a profile employers trust.", icon: Star },
];

export const PROOF_STATS: Array<{ value: string; label: string }> = [
  { value: "97%", label: "fill rate" },
  { value: "< 24h", label: "average time to fill" },
  { value: "2,400+", label: "verified professionals" },
  { value: "RWF 0", label: "upfront" },
];

export const AUDIENCE_BENEFITS = {
  business: [
    "Fill a shift in hours, not weeks — most are confirmed by the next morning",
    "Verified National ID, phone, references and skills on every profile",
    "One invoice a fortnight: worker pay plus an 18% service fee",
  ],
  workers: [
    "Choose shifts that fit around study, family and other work",
    "Paid to MTN MoMo or Airtel Money within 48 hours of approval",
    "Ratings and verified hours that travel with you to the next employer",
  ],
};

export const HIRING_PROBLEMS: Array<{ problem: string; solution: string }> = [
  { problem: "A WhatsApp group and a phone tree the night before the event.", solution: "Post once. Matching professionals are notified within minutes and you confirm from a ranked list." },
  { problem: "No record of who actually turned up, or when.", solution: "QR check-in at the venue. Live attendance on your dashboard, and no-shows recorded on the worker's profile." },
  { problem: "Cash envelopes on the night and a reconciliation the week after.", solution: "You approve hours. We pay every worker to mobile money and send you one invoice a fortnight." },
];

export const PRICING_EXAMPLE: { workers: number; role: RoleCategory; payPerShift: number } = { workers: 18, role: "waiter", payPerShift: 25000 };

export const PRICING_POINTS = [
  "No subscription, no posting fee. You pay only for shifts that were completed.",
  "Transport allowances and meals are shown on the listing and passed through at cost.",
  "One invoice every fortnight, 14-day terms, by bank transfer or MoMo Business.",
];

export const SECTOR_IMAGES: Record<Sector, ImageKey> = {
  hospitality: "restaurant",
  events: "exhibition",
  marketing: "retailStore",
  corporate: "officeWork",
  retail_logistics: "warehouse",
};

export interface FaqItem {
  q: string;
  a: string;
}

export const BUSINESS_FAQ: FaqItem[] = [
  { q: "How fast can a shift be filled?", a: "Most shifts posted before 18:00 are fully confirmed by the next morning. Shifts starting within 48 hours are flagged urgent and pushed to nearby workers first." },
  { q: "Who are the workers?", a: "Verified professionals in Kigali: hospitality students and graduates, experienced servers and bartenders, registration staff, stewards, promoters and enumerators. Every profile has a checked National ID, phone and photo; most also have references and a skills assessment." },
  { q: "What happens if someone doesn't show up?", a: "Mark the no-show in attendance. You aren't charged for that position, the worker's reliability score drops, and we try to backfill from your talent pool and nearby workers." },
  { q: "How do I pay?", a: "You approve hours after the shift. Every fortnight you receive one invoice covering completed shifts: worker pay plus an 18% service fee. Pay by bank transfer or MoMo Business within 14 days." },
  { q: "Can I re-book people I liked?", a: "Yes. Add them to your talent pool. They get first notice of your shifts and are confirmed automatically when they accept, so your regulars stay your regulars." },
];

export const HOW_FAQ: FaqItem[] = [
  { q: "Is GigSyc an agency or an employer?", a: "Neither. GigSyc is a platform: businesses post shifts, verified professionals accept them, and we handle matching, check-in, ratings and payment. Workers choose the shifts they take." },
  { q: "Where does GigSyc operate?", a: "Kigali, across all districts, with shifts in hospitality, events, marketing activations, corporate services and retail & logistics. The prototype uses real venue types and pay ranges from the city." },
  { q: "What does it cost?", a: "Businesses pay worker pay plus an 18% service fee, invoiced fortnightly for completed shifts only. Professionals pay nothing — the pay shown on a shift is what lands in their MoMo account." },
];

export const WORKER_REQUIREMENTS = [
  "Rwandan National ID or a passport with a valid permit",
  "18 years or older",
  "A phone number registered to MTN MoMo or Airtel Money",
  "One reference from a previous employer, teacher or supervisor (recommended, not required)",
];

export interface LoopStep {
  id: string;
  title: string;
  summary: string;
  employer: string;
  worker: string;
  icon: LucideIcon;
  /** Optional anchor id so footer links like /how-it-works#trust land here. */
  anchor?: string;
}

export const LOOP_STEPS: LoopStep[] = [
  {
    id: "connect", title: "Connect", icon: Link2,
    summary: "A shift is posted and the right people hear about it within minutes.",
    employer: "Post a shift with role, venue, date, pay and dress code. Professionals nearby with matching skills are notified, and you confirm from a list ranked by fit and track record.",
    worker: "Set your skills, districts, languages and availability once. You're notified of shifts that fit, and you can apply or accept an invitation in one tap.",
  },
  {
    id: "work", title: "Work", icon: QrCode,
    summary: "Everyone knows where to be, when, and what to wear.",
    employer: "Your supervisor shows the QR code at the staff entrance. Confirmed workers, check-ins and late arrivals appear live on the shift page.",
    worker: "Arrive, scan the QR code, work the shift. Your supervisor's name and number are on the shift, so there's someone to call if something changes.",
  },
  {
    id: "verify", title: "Verify", icon: ShieldCheck, anchor: "trust",
    summary: "Identity before the shift, attendance during it.",
    employer: "Every worker has a checked National ID, phone and photo; most have references and a skills assessment. Attendance is timestamped and no-shows are recorded — you aren't charged for them.",
    worker: "Employers are verified too, with a public rating from the people who've worked for them. You can see how they brief, treat and pay their teams before you accept.",
  },
  {
    id: "pay", title: "Pay", icon: HandCoins,
    summary: "One approval on your side. Mobile money on theirs.",
    employer: "Approve hours the next morning. Every fortnight you receive one invoice: worker pay plus an 18% service fee for completed shifts only.",
    worker: "Pay lands on MTN MoMo or Airtel Money within 48 hours of approval, with a reference number you can check in Earnings.",
  },
  {
    id: "reputation", title: "Build reputation", icon: Star,
    summary: "Both sides rate, both sides are rated.",
    employer: "Rate punctuality, professionalism and competence. Your own rating — briefing, treatment, on-time payment — is visible to workers.",
    worker: "Ratings and verified hours build a profile that gets you invited first. Good employers see you; you see good employers.",
  },
  {
    id: "reconnect", title: "Reconnect", icon: Repeat,
    summary: "Good matches turn into regulars.",
    employer: "Add the people you liked to your talent pool. They get first notice of your shifts and are confirmed automatically when they accept.",
    worker: "Regular employers can invite you directly. Accept or decline from your schedule — the choice stays with you.",
  },
];
