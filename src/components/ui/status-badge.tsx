import type { BookingStatus, EventStatus, InvoiceStatus, PayoutStatus, PlatformUserStatus, ReportSeverity, ReportStatus, ServiceStatus, ShiftStatus } from "@/types";
import { Badge, type BadgeProps } from "./badge";

type Tone = NonNullable<BadgeProps["tone"]>;

export const SHIFT_STATUS: Record<ShiftStatus, { label: string; tone: Tone }> = {
  draft: { label: "Draft", tone: "outline" },
  open: { label: "Open", tone: "cyan" },
  filled: { label: "Filled", tone: "success" },
  in_progress: { label: "In progress", tone: "amber" },
  completed: { label: "Completed", tone: "neutral" },
  cancelled: { label: "Cancelled", tone: "danger" },
};

export const BOOKING_STATUS: Record<BookingStatus, { label: string; tone: Tone }> = {
  invited: { label: "Invited", tone: "navy" },
  applied: { label: "Applied", tone: "cyan" },
  confirmed: { label: "Confirmed", tone: "success" },
  checked_in: { label: "Checked in", tone: "amber" },
  completed: { label: "Completed", tone: "neutral" },
  no_show: { label: "No-show", tone: "danger" },
  cancelled: { label: "Cancelled", tone: "outline" },
  declined: { label: "Declined", tone: "outline" },
};

export const PAYOUT_STATUS: Record<PayoutStatus, { label: string; tone: Tone }> = {
  pending: { label: "Pending approval", tone: "warning" },
  processing: { label: "Processing", tone: "cyan" },
  paid: { label: "Paid", tone: "success" },
};

export const INVOICE_STATUS: Record<InvoiceStatus, { label: string; tone: Tone }> = {
  draft: { label: "Draft", tone: "outline" },
  due: { label: "Due", tone: "warning" },
  paid: { label: "Paid", tone: "success" },
  overdue: { label: "Overdue", tone: "danger" },
};

export function ShiftStatusBadge({ status, className }: { status: ShiftStatus; className?: string }) {
  const s = SHIFT_STATUS[status];
  return <Badge tone={s.tone} dot={status === "in_progress"} className={className}>{s.label}</Badge>;
}
export function BookingStatusBadge({ status, className }: { status: BookingStatus; className?: string }) {
  const s = BOOKING_STATUS[status];
  return <Badge tone={s.tone} dot={status === "checked_in"} className={className}>{s.label}</Badge>;
}
export function PayoutStatusBadge({ status, className }: { status: PayoutStatus; className?: string }) {
  const s = PAYOUT_STATUS[status];
  return <Badge tone={s.tone} className={className}>{s.label}</Badge>;
}
export function InvoiceStatusBadge({ status, className }: { status: InvoiceStatus; className?: string }) {
  const s = INVOICE_STATUS[status];
  return <Badge tone={s.tone} className={className}>{s.label}</Badge>;
}

export const EVENT_STATUS: Record<EventStatus, { label: string; tone: Tone }> = {
  draft: { label: "Draft", tone: "outline" },
  pending_review: { label: "Pending review", tone: "warning" },
  published: { label: "Published", tone: "success" },
  rejected: { label: "Rejected", tone: "danger" },
  cancelled: { label: "Cancelled", tone: "danger" },
  completed: { label: "Completed", tone: "neutral" },
};

export const USER_STATUS: Record<PlatformUserStatus, { label: string; tone: Tone }> = {
  active: { label: "Active", tone: "success" },
  pending: { label: "Pending", tone: "warning" },
  suspended: { label: "Suspended", tone: "danger" },
};

export const REPORT_STATUS: Record<ReportStatus, { label: string; tone: Tone }> = {
  open: { label: "Open", tone: "warning" },
  resolved: { label: "Resolved", tone: "success" },
  dismissed: { label: "Dismissed", tone: "outline" },
};

export const REPORT_SEVERITY: Record<ReportSeverity, { label: string; tone: Tone }> = {
  low: { label: "Low", tone: "neutral" },
  medium: { label: "Medium", tone: "warning" },
  high: { label: "High", tone: "danger" },
};

export const SERVICE_STATUS: Record<ServiceStatus, { label: string; tone: Tone }> = {
  operational: { label: "Operational", tone: "success" },
  degraded: { label: "Degraded", tone: "warning" },
  down: { label: "Down", tone: "danger" },
  maintenance: { label: "Maintenance", tone: "cyan" },
};

export function EventStatusBadge({ status, className }: { status: EventStatus; className?: string }) {
  const s = EVENT_STATUS[status];
  return <Badge tone={s.tone} dot={status === "pending_review"} className={className}>{s.label}</Badge>;
}
export function UserStatusBadge({ status, className }: { status: PlatformUserStatus; className?: string }) {
  const s = USER_STATUS[status];
  return <Badge tone={s.tone} className={className}>{s.label}</Badge>;
}
export function ReportStatusBadge({ status, className }: { status: ReportStatus; className?: string }) {
  const s = REPORT_STATUS[status];
  return <Badge tone={s.tone} className={className}>{s.label}</Badge>;
}
export function SeverityBadge({ severity, className }: { severity: ReportSeverity; className?: string }) {
  const s = REPORT_SEVERITY[severity];
  return <Badge tone={s.tone} dot className={className}>{s.label}</Badge>;
}
export function ServiceStatusBadge({ status, className }: { status: ServiceStatus; className?: string }) {
  const s = SERVICE_STATUS[status];
  return <Badge tone={s.tone} dot={status !== "operational"} className={className}>{s.label}</Badge>;
}
