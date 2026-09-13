import type {
  AppNotification, Booking, Destination, Event, Invoice, Payout, PlatformUser, Report, SavedEvent,
  Shift, SystemService, TalentPoolEntry, Worker, WorkHistoryItem,
} from "@/types";
import { SERVICE_FEE_RATE } from "../roles";
import { dayOffset, isoOffset } from "./dates";
import { EMPLOYERS } from "./employers";
import { SHIFTS } from "./shifts";
import { ALINE_HISTORY, WORKERS } from "./workers";
import { EVENTS } from "./events";
import { DESTINATIONS, PLATFORM_USERS, REPORTS, SYSTEM_SERVICES, DEMO_CUSTOMER_ID } from "./platform";

export interface SeedState {
  employers: typeof EMPLOYERS;
  workers: Worker[];
  shifts: Shift[];
  bookings: Booking[];
  payouts: Payout[];
  invoices: Invoice[];
  notifications: AppNotification[];
  talentPool: TalentPoolEntry[];
  events: Event[];
  destinations: Destination[];
  platformUsers: PlatformUser[];
  reports: Report[];
  systemServices: SystemService[];
  savedEvents: SavedEvent[];
}

export const DEMO_WORKER_ID = "wk_aline";
export { DEMO_CUSTOMER_ID } from "./platform";
export { DEMO_ADMIN_ID } from "./platform";
export const DEMO_EMPLOYER_ID = "emp_ikaze";
export const DEMO_EMPLOYER_USER_ID = "eu_diane";

/** Deterministic pseudo-random so the seed is stable between reloads. */
const hash = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0) / 4294967295;
};

let bookingSeq = 1;
const bk = (shiftId: string, workerId: string, status: Booking["status"], extra: Partial<Booking> = {}): Booking => ({
  id: `bk_${String(bookingSeq++).padStart(3, "0")}`,
  shiftId,
  workerId,
  status,
  createdAt: extra.createdAt ?? isoOffset(-2, 10),
  ...extra,
});

function buildBookings(): Booking[] {
  const out: Booking[] = [];
  const shiftsById = new Map(SHIFTS.map((s) => [s.id, s]));

  // Demo worker: a deliberate spread of states to exercise every UI path.
  out.push(
    bk("sh_ikaze_brunch", DEMO_WORKER_ID, "confirmed", { createdAt: isoOffset(-5, 14) }),
    bk("sh_ikaze_hosts", DEMO_WORKER_ID, "confirmed", { createdAt: isoOffset(-7, 9) }),
    bk("sh_ikaze_gala", DEMO_WORKER_ID, "applied", { createdAt: isoOffset(-1, 19) }),
    bk("sh_imbuto_launch", DEMO_WORKER_ID, "invited", { createdAt: isoOffset(0, 7) }),
    bk("sh_ikaze_wedding_past", DEMO_WORKER_ID, "completed", {
      createdAt: isoOffset(-15, 10), checkInAt: isoOffset(-9, 14, 52), checkOutAt: isoOffset(-9, 22, 10), approvedAt: isoOffset(-8, 9),
      employerRating: { score: 5, punctuality: 5, professionalism: 5, competence: 5, note: "Aline anchored the VIP table. Zero issues." },
      workerRating: { score: 5, note: "Well organised, clear briefing, paid on time." },
    }),
    bk("sh_akagera_past", DEMO_WORKER_ID, "completed", {
      createdAt: isoOffset(-22, 10), checkInAt: isoOffset(-16, 7, 48), checkOutAt: isoOffset(-16, 17, 5), approvedAt: isoOffset(-15, 11),
      employerRating: { score: 5, punctuality: 5, professionalism: 5, competence: 4, note: "Handled the 8am rush calmly." },
      workerRating: { score: 4 },
    }),
    bk("sh_imbuto_past", DEMO_WORKER_ID, "completed", {
      createdAt: isoOffset(-28, 10), checkInAt: isoOffset(-23, 16, 40), checkOutAt: isoOffset(-23, 22, 15), approvedAt: isoOffset(-22, 10),
      employerRating: { score: 4.5, punctuality: 5, professionalism: 4, competence: 5 },
    }),
    bk("sh_intego_past", DEMO_WORKER_ID, "completed", {
      createdAt: isoOffset(-48, 10), checkInAt: isoOffset(-44, 15, 50), checkOutAt: isoOffset(-44, 22, 35), approvedAt: isoOffset(-43, 9),
      employerRating: { score: 4.5, punctuality: 4, professionalism: 5, competence: 4 },
    }),
  );

  // Every other shift: fill according to status with skill-matched workers.
  for (const shift of SHIFTS) {
    const already = new Set(out.filter((b) => b.shiftId === shift.id).map((b) => b.workerId));
    const candidates = WORKERS.filter((w) => w.id !== DEMO_WORKER_ID && w.skills.includes(shift.role) && !already.has(w.id))
      .sort((a, b) => hash(shift.id + a.id) - hash(shift.id + b.id));

    const need = shift.workersNeeded - already.size;
    let confirmedTarget = 0;
    let appliedTarget = 0;
    switch (shift.status) {
      case "draft": break;
      case "open":
        confirmedTarget = Math.min(candidates.length, Math.floor(need * (shift.urgent ? 0.35 : 0.6)));
        appliedTarget = Math.min(candidates.length - confirmedTarget, Math.max(2, Math.floor(need * 0.25)));
        break;
      case "filled":
      case "in_progress":
      case "completed":
        confirmedTarget = Math.min(candidates.length, need);
        break;
      case "cancelled": break;
    }

    candidates.slice(0, confirmedTarget).forEach((w, i) => {
      if (shift.status === "completed") {
        const score = Math.min(5, Math.max(3, Math.round((w.rating + (hash(w.id + shift.id) - 0.5)) * 2) / 2));
        const noShow = hash("ns" + w.id + shift.id) > 0.96;
        out.push(
          bk(shift.id, w.id, noShow ? "no_show" : "completed", {
            createdAt: isoOffset(-20, 10),
            checkInAt: noShow ? undefined : `${shift.date}T${shift.startTime}:00`,
            checkOutAt: noShow ? undefined : `${shift.date}T${shift.endTime}:00`,
            approvedAt: noShow ? undefined : isoOffset(-1, 9),
            employerRating: noShow ? undefined : { score, punctuality: score, professionalism: Math.min(5, score + 0.5), competence: score },
          }),
        );
      } else if (shift.status === "in_progress") {
        out.push(bk(shift.id, w.id, i < 3 ? "checked_in" : "confirmed", { checkInAt: i < 3 ? isoOffset(0, 8, 40 + i * 4) : undefined }));
      } else {
        out.push(bk(shift.id, w.id, "confirmed", { createdAt: isoOffset(-3 - i, 10) }));
      }
    });
    candidates.slice(confirmedTarget, confirmedTarget + appliedTarget).forEach((w, i) => {
      out.push(bk(shift.id, w.id, "applied", { createdAt: isoOffset(-1, 8 + i * 2) }));
    });
    void shiftsById;
  }
  return out;
}

function buildPayouts(bookings: Booking[]): Payout[] {
  const shiftsById = new Map(SHIFTS.map((s) => [s.id, s]));
  const out: Payout[] = [];
  let seq = 1;
  for (const b of bookings) {
    if (b.workerId !== DEMO_WORKER_ID) continue;
    const shift = shiftsById.get(b.shiftId);
    if (!shift) continue;
    if (b.status === "completed") {
      out.push({
        id: `po_${String(seq++).padStart(3, "0")}`,
        workerId: b.workerId, bookingId: b.id, shiftId: shift.id,
        amount: shift.payPerShift + (shift.transportAllowance ?? 0),
        status: "paid", method: "MTN MoMo",
        reference: `MP${(hash(b.id) * 1e9).toFixed(0).padStart(9, "0")}`,
        scheduledFor: b.approvedAt ?? shift.date, paidAt: b.approvedAt,
      });
    }
  }
  return out;
}

function buildInvoices(bookings: Booking[]): Invoice[] {
  const shifts = SHIFTS.filter((s) => s.employerId === DEMO_EMPLOYER_ID && s.status === "completed");
  const lines = shifts.map((s) => {
    const workers = bookings.filter((b) => b.shiftId === s.id && b.status === "completed").length;
    return { shiftId: s.id, description: s.title, workers, amount: workers * s.payPerShift };
  });
  const mk = (id: string, number: string, periodLabel: string, issuedOffset: number, status: Invoice["status"], ls: Invoice["lines"]): Invoice => {
    const subtotal = ls.reduce((a, l) => a + l.amount, 0);
    const serviceFee = Math.round(subtotal * SERVICE_FEE_RATE);
    return {
      id, employerId: DEMO_EMPLOYER_ID, number, periodLabel,
      issuedAt: dayOffset(issuedOffset), dueAt: dayOffset(issuedOffset + 14), status,
      lines: ls, subtotal, serviceFee, total: subtotal + serviceFee,
      paidAt: status === "paid" ? dayOffset(issuedOffset + 6) : undefined,
    };
  };
  return [
    mk("inv_003", "GS-2026-0187", "This fortnight", -6, "due", lines.slice(0, 1)),
    mk("inv_002", "GS-2026-0171", "Previous fortnight", -20, "paid", lines.slice(1)),
    mk("inv_001", "GS-2026-0158", "Two fortnights ago", -34, "paid", [
      { shiftId: "sh_ikaze_conf_past", description: "Conference ushers · Insurance Leaders Summit", workers: 8, amount: 8 * 22000 },
      { shiftId: "sh_ikaze_wedding_past", description: "Corporate lunch servers", workers: 6, amount: 6 * 18000 },
    ]),
  ];
}

function buildNotifications(): AppNotification[] {
  return [
    { id: "nt_w1", recipientId: DEMO_WORKER_ID, kind: "shift_match", title: "New shift matches your skills", body: "Registration desk · East Africa Health Forum (Day 1) — RWF 28,000, Tuesday 06:30.", createdAt: isoOffset(0, 7, 12), read: false, href: "/worker/shifts/sh_ikaze_reg" },
    { id: "nt_w2", recipientId: DEMO_WORKER_ID, kind: "application", title: "Imbuto Events invited you", body: "Hosts & promoters · Bank Kigali app launch. Respond before Friday.", createdAt: isoOffset(0, 7, 5), read: false, href: "/worker/shifts/sh_imbuto_launch" },
    { id: "nt_w3", recipientId: DEMO_WORKER_ID, kind: "reminder", title: "Shift today at 09:00", body: "Sunday brunch service at Ikaze Kimihurura. Check in with the QR code at the staff entrance.", createdAt: isoOffset(0, 6, 30), read: false, href: "/worker/schedule" },
    { id: "nt_w4", recipientId: DEMO_WORKER_ID, kind: "payment", title: "RWF 25,000 paid to MTN MoMo", body: "Wedding banquet servers · Ikaze Hospitality Group.", createdAt: isoOffset(-8, 9, 15), read: true, href: "/worker/earnings" },
    { id: "nt_w5", recipientId: DEMO_WORKER_ID, kind: "rating", title: "Ikaze rated you 5.0", body: "“Aline anchored the VIP table. Zero issues.”", createdAt: isoOffset(-8, 9, 10), read: true, href: "/worker/profile" },
    { id: "nt_w6", recipientId: DEMO_WORKER_ID, kind: "booking_confirmed", title: "You're confirmed for Awards Night", body: "Hosts · Chamber of Commerce Awards Night, next week 17:00.", createdAt: isoOffset(-6, 11), read: true, href: "/worker/schedule" },
    { id: "nt_e1", recipientId: DEMO_EMPLOYER_ID, kind: "application", title: "4 new applicants for the Gala Dinner", body: "Banquet servers · Rwanda Bankers' Gala Dinner now has 14 of 18 positions covered.", createdAt: isoOffset(0, 8, 2), read: false, href: "/employer/jobs/sh_ikaze_gala" },
    { id: "nt_e2", recipientId: DEMO_EMPLOYER_ID, kind: "attendance", title: "3 of 6 checked in for Sunday brunch", body: "Shift started at 09:00. 3 workers not yet checked in.", createdAt: isoOffset(0, 9, 5), read: false, href: "/employer/jobs/sh_ikaze_brunch" },
    { id: "nt_e3", recipientId: DEMO_EMPLOYER_ID, kind: "system", title: "Registration shift is urgent", body: "Health Forum Day 1 is in 2 days with 2 of 6 confirmed. Consider inviting from your talent pool.", createdAt: isoOffset(-1, 18), read: false, href: "/employer/jobs/sh_ikaze_reg" },
    { id: "nt_e4", recipientId: DEMO_EMPLOYER_ID, kind: "payment", title: "Invoice GS-2026-0187 is due", body: "RWF 413,000 due in 8 days.", createdAt: isoOffset(-6, 9), read: true, href: "/employer/payments" },
    { id: "nt_e5", recipientId: DEMO_EMPLOYER_ID, kind: "rating", title: "Please review 14 workers", body: "Wedding banquet servers completed. Ratings help us match you better next time.", createdAt: isoOffset(-8, 8), read: true, href: "/employer/jobs/sh_ikaze_wedding_past" },
  ];
}

const HISTORY_TEMPLATES: Record<string, string[]> = {
  waiter: ["Banquet service", "Corporate lunch service", "Wedding dinner service"],
  registration: ["Conference registration", "Summit badge desk", "Workshop check-in"],
  host: ["Launch event hosting", "Gala hosting", "Reception protocol"],
  usher: ["Conference ushering", "Concert ushering", "Graduation ushering"],
  bartender: ["Gala bar service", "Pool bar cover", "Launch cocktail bar"],
  barista: ["Brunch bar cover", "Café weekend shift", "Conference coffee station"],
  promoter: ["Mall sampling activation", "Campus roadshow", "Product launch promo"],
  data_collector: ["Household survey", "Market survey", "Exit interviews"],
  receptionist: ["Front desk cover", "Visitor desk", "Reception relief"],
  setup_crew: ["Expo stand build", "Stage load-in", "Event teardown"],
  warehouse: ["Stock count", "Receiving shift", "Order picking"],
  retail: ["Promotion weekend floor", "Stock room support", "Till cover"],
  steward: ["Arena stewarding", "Concert stewarding", "Marathon stewarding"],
  av_support: ["Breakout room AV", "Hybrid meeting support", "Conference sound check"],
};

function buildHistory(w: Worker): WorkHistoryItem[] {
  if (w.id === DEMO_WORKER_ID) return ALINE_HISTORY;
  const count = Math.min(5, Math.max(0, Math.round(w.completedShifts / 12)));
  const relevant = EMPLOYERS.filter((e) => e.id !== "emp_kivu");
  return Array.from({ length: count }, (_, i) => {
    const role = w.skills[i % w.skills.length];
    const employer = relevant[Math.floor(hash(w.id + i) * relevant.length)];
    const titles = HISTORY_TEMPLATES[role];
    const rating = Math.min(5, Math.max(3.5, Math.round((w.rating + (hash(w.id + "r" + i) - 0.5) * 0.6) * 2) / 2));
    return {
      id: `wh_${w.id}_${i}`,
      employerId: employer.id,
      role,
      title: titles[i % titles.length],
      date: dayOffset(-(7 + i * 11 + Math.floor(hash(w.id + "d" + i) * 6))),
      hours: 6 + Math.floor(hash(w.id + "h" + i) * 4),
      rating,
    };
  });
}

export function buildSeed(): SeedState {
  bookingSeq = 1;
  const bookings = buildBookings();
  const workers = WORKERS.map((w) => ({ ...w, history: buildHistory(w) }));
  return {
    employers: EMPLOYERS,
    workers,
    shifts: SHIFTS,
    bookings,
    payouts: buildPayouts(bookings),
    invoices: buildInvoices(bookings),
    notifications: buildNotifications(),
    events: EVENTS,
    destinations: DESTINATIONS,
    platformUsers: PLATFORM_USERS,
    reports: REPORTS,
    systemServices: SYSTEM_SERVICES,
    savedEvents: [
      { userId: DEMO_CUSTOMER_ID, eventId: "ev_ubumuntu", savedAt: isoOffset(-4) },
      { userId: DEMO_CUSTOMER_ID, eventId: "ev_marathon", savedAt: isoOffset(-2) },
      { userId: DEMO_CUSTOMER_ID, eventId: "ev_coffeefest", savedAt: isoOffset(-1) },
    ],
    talentPool: [
      { employerId: DEMO_EMPLOYER_ID, workerId: "wk_aline", addedAt: isoOffset(-30), note: "Requested by name for VIP tables." },
      { employerId: DEMO_EMPLOYER_ID, workerId: "wk_divine", addedAt: isoOffset(-60), note: "Best registration lead we've had." },
      { employerId: DEMO_EMPLOYER_ID, workerId: "wk_jeanpaul", addedAt: isoOffset(-90) },
      { employerId: DEMO_EMPLOYER_ID, workerId: "wk_sandrine", addedAt: isoOffset(-45), note: "Protocol for ministerial guests." },
      { employerId: DEMO_EMPLOYER_ID, workerId: "wk_kevin", addedAt: isoOffset(-120) },
    ],
  };
}
