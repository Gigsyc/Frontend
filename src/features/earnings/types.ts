import type { Booking, Employer, Payout, PayoutMethod, Shift } from "@/types";

/** A payout joined to the shift it pays for, the employer and the underlying booking. */
export interface PayoutItem {
  payout: Payout;
  shift: Shift;
  employer: Employer | undefined;
  booking: Booking | undefined;
}

export interface MonthPoint {
  /** "Sep" */
  label: string;
  /** "September 2026" */
  hint: string;
  /** yyyy-MM */
  key: string;
  paid: number;
}

export interface WorkerEarnings {
  paidThisMonth: number;
  /** Payouts pending approval or processing — money on its way. */
  pending: number;
  pendingCount: number;
  lifetime: number;
  paidCount: number;
  /** Oldest → newest; the last point is the current month. */
  months: MonthPoint[];
  /** Pending + processing, soonest expected first. */
  waiting: PayoutItem[];
  /** Paid, most recent first. */
  paid: PayoutItem[];
}

export interface PayoutMethodOption {
  method: PayoutMethod;
  /** Masked account the payout goes to, e.g. "078• ••• 214". */
  account: string;
  hint: string;
}
