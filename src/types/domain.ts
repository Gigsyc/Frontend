/**
 * GigSyc domain model.
 * These types are the contract between the (future) API and the UI.
 * Keep them serialisable — dates are ISO strings, times are "HH:mm".
 */

export type Sector =
  | "hospitality"
  | "events"
  | "marketing"
  | "corporate"
  | "retail_logistics";

export type RoleCategory =
  | "usher"
  | "registration"
  | "waiter"
  | "bartender"
  | "host"
  | "barista"
  | "promoter"
  | "data_collector"
  | "receptionist"
  | "setup_crew"
  | "warehouse"
  | "retail"
  | "steward"
  | "av_support";

export type KigaliDistrict =
  | "Kimihurura"
  | "Nyarutarama"
  | "Kacyiru"
  | "Remera"
  | "Gikondo"
  | "Kiyovu"
  | "Nyarugenge"
  | "Gisozi"
  | "Kimironko"
  | "Kanombe"
  | "Rusororo"
  | "Kibagabaga"
  | "Gacuriro";

export type Language = "Kinyarwanda" | "English" | "French" | "Swahili";

export interface Employer {
  id: string;
  name: string;
  slug: string;
  sector: Sector;
  tagline: string;
  about: string;
  district: KigaliDistrict;
  verified: boolean;
  memberSince: string; // ISO date
  /** Two-letter mark colour for the initials avatar */
  markColor: string;
  contact: { name: string; role: string; email: string; phone: string };
  stats: { shiftsPosted: number; workersEngaged: number; avgRatingGiven: number; fillRate: number };
}

export type VerificationKey = "identity" | "phone" | "photo" | "references" | "skills";

export interface WorkHistoryItem {
  id: string;
  employerId: string;
  role: RoleCategory;
  title: string;
  date: string;
  hours: number;
  rating?: number;
  feedback?: string;
}

export interface Worker {
  id: string;
  firstName: string;
  lastName: string;
  headline: string;
  bio: string;
  district: KigaliDistrict;
  skills: RoleCategory[];
  languages: Language[];
  rating: number; // 0–5
  ratingCount: number;
  reliability: number; // 0–100
  completedShifts: number;
  noShows: number;
  verifications: Record<VerificationKey, boolean>;
  joinedAt: string;
  avatarColor: string;
  availability: { weekdays: boolean; weekends: boolean; evenings: boolean; overnight: boolean };
  education?: string;
  certifications: string[];
  history: WorkHistoryItem[];
  /** Worker-declared minimum per shift, RWF */
  minShiftPay?: number;
}

export type ShiftStatus =
  | "draft"
  | "open"
  | "filled"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface Shift {
  id: string;
  employerId: string;
  title: string;
  role: RoleCategory;
  sector: Sector;
  description: string;
  responsibilities: string[];
  requirements: string[];
  dressCode?: string;
  venue: string;
  district: KigaliDistrict;
  address: string;
  date: string; // ISO date (yyyy-MM-dd)
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  breakMinutes: number;
  workersNeeded: number;
  /** RWF per shift (flat) */
  payPerShift: number;
  mealProvided: boolean;
  transportAllowance?: number;
  status: ShiftStatus;
  urgent: boolean;
  coverImage: string;
  createdAt: string;
  supervisor: { name: string; phone: string };
  checkInMethod: "qr" | "supervisor" | "gps";
}

export type BookingStatus =
  | "invited"
  | "applied"
  | "confirmed"
  | "checked_in"
  | "completed"
  | "no_show"
  | "cancelled"
  | "declined";

export interface Booking {
  id: string;
  shiftId: string;
  workerId: string;
  status: BookingStatus;
  createdAt: string;
  checkInAt?: string;
  checkOutAt?: string;
  /** Employer → worker */
  employerRating?: { score: number; punctuality: number; professionalism: number; competence: number; note?: string };
  /** Worker → employer */
  workerRating?: { score: number; note?: string };
  approvedAt?: string;
}

export type PayoutStatus = "pending" | "processing" | "paid";
export type PayoutMethod = "MTN MoMo" | "Airtel Money" | "Bank transfer";

export interface Payout {
  id: string;
  workerId: string;
  bookingId: string;
  shiftId: string;
  amount: number;
  status: PayoutStatus;
  method: PayoutMethod;
  reference: string;
  scheduledFor: string;
  paidAt?: string;
}

export type InvoiceStatus = "draft" | "due" | "paid" | "overdue";

export interface InvoiceLine {
  shiftId: string;
  description: string;
  workers: number;
  amount: number;
}

export interface Invoice {
  id: string;
  employerId: string;
  number: string;
  periodLabel: string;
  issuedAt: string;
  dueAt: string;
  status: InvoiceStatus;
  lines: InvoiceLine[];
  subtotal: number;
  serviceFee: number;
  total: number;
  paidAt?: string;
}

export type NotificationKind =
  | "shift_match"
  | "booking_confirmed"
  | "reminder"
  | "payment"
  | "rating"
  | "system"
  | "application"
  | "attendance";

export interface AppNotification {
  id: string;
  recipientId: string; // worker or employer id
  kind: NotificationKind;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  href?: string;
}

export interface TalentPoolEntry {
  employerId: string;
  workerId: string;
  addedAt: string;
  note?: string;
}

export interface EmployerUser {
  id: string;
  employerId: string;
  name: string;
  role: string;
  email: string;
}

/** Filters for discovery. All optional; undefined = no filter. */
export interface ShiftFilters {
  query?: string;
  roles?: RoleCategory[];
  districts?: KigaliDistrict[];
  dateRange?: "today" | "tomorrow" | "week" | "weekend" | "all";
  minPay?: number;
  urgentOnly?: boolean;
  sort?: "soonest" | "pay_desc" | "newest";
}

export interface WorkerFilters {
  query?: string;
  roles?: RoleCategory[];
  districts?: KigaliDistrict[];
  minRating?: number;
  minReliability?: number;
  verifiedOnly?: boolean;
  availableOn?: string;
  sort?: "best_match" | "rating" | "reliability" | "experience";
}

export type Persona =
  | { role: "employer"; userId: string; employerId: string }
  | { role: "worker"; userId: string }
  | { role: "customer"; userId: string }
  | { role: "admin"; userId: string };
