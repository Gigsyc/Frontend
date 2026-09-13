/**
 * In-memory mock backend.
 *
 * Every method is async and returns copies, so the UI layer behaves exactly as it
 * would against a real API. Mutations change the store and callers invalidate
 * TanStack Query keys. Replace the service layer (features/x/api.ts) with real
 * HTTP calls later — nothing in components should import from here.
 */
import { formatISO, isAfter, isBefore, isSameDay, parseISO, startOfWeek, endOfWeek, addDays } from "date-fns";
import type {
  AdminEventFilters, AppNotification, AuthUser, Booking, BookingStatus, CustomerOnboardingInput, Destination,
  Employer, Event, EventFilters, EventStatus, Invoice, Payout, PartnerOnboardingInput, PlatformUser, Report,
  Shift, ShiftFilters, SignUpInput, SystemService, TalentPoolEntry, Worker, WorkerFilters,
} from "@/types";
import { AuthError } from "@/types";
import { MIN_PASSWORD_LENGTH } from "@/data/auth";
import { buildSeed, type SeedState, DEMO_EMPLOYER_ID, DEMO_WORKER_ID } from "@/data/mocks/seed";
import { eventMatchesWhen, isPubliclyReachable } from "@/data/events";
import { ROLES } from "@/data/roles";

const STORAGE_KEY = "gigsyc.prototype.state.v7";
const SEED_DAY_KEY = "gigsyc.prototype.seedDay";

export class MockApiError extends Error {
  constructor(message: string, public readonly code: "not_found" | "conflict" | "network" | "validation" = "network") {
    super(message);
    this.name = "MockApiError";
  }
}

const clone = <T>(v: T): T => (typeof structuredClone === "function" ? structuredClone(v) : JSON.parse(JSON.stringify(v)));
const nowIso = () => formatISO(new Date());
const today = () => new Date().toISOString().slice(0, 10);

/**
 * Ids must not collide with records already persisted by an earlier session.
 *
 * A plain counter restarts at the same number on every page load, so the first record
 * created after a reload reuses the id of the first record created before it — and a
 * lookup then returns the wrong row entirely. Mixing in a per-session token keeps ids
 * unique across reloads without needing a persisted counter.
 */
const ID_SESSION = Math.random().toString(36).slice(2, 6);
let idSeq = 0;
const nextId = (prefix: string) => `${prefix}_${ID_SESSION}${(idSeq++).toString(36)}`;

class MockStore {
  private state: SeedState;
  private hydrated = false;
  /** When true, roughly one in four requests fails. Toggled from Settings → "Simulate unreliable network". */
  chaos = false;
  private callCount = 0;
  /** Base latency in ms; 0 in tests. */
  latency = 320;

  constructor() {
    this.state = buildSeed();
  }

  // ————————————————————————————————————————————————————————— infra

  private hydrate() {
    if (this.hydrated || typeof window === "undefined") return;
    this.hydrated = true;
    try {
      const seedDay = window.localStorage.getItem(SEED_DAY_KEY);
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw && seedDay === today()) {
        this.state = JSON.parse(raw) as SeedState;
      } else {
        this.persist();
      }
    } catch {
      /* private mode etc. — stay in memory */
    }
  }

  private persist() {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      window.localStorage.setItem(SEED_DAY_KEY, today());
    } catch {
      /* ignore */
    }
  }

  private async simulate(): Promise<void> {
    this.hydrate();
    this.callCount++;
    const jitter = ((this.callCount * 7919) % 300) - 100;
    await new Promise((r) => setTimeout(r, Math.max(0, this.latency + jitter)));
    if (this.chaos && this.callCount % 4 === 0) {
      throw new MockApiError("We couldn't reach GigSyc. Check your connection and try again.");
    }
  }

  reset() {
    this.state = buildSeed();
    this.persist();
  }

  // ————————————————————————————————————————————————————————— employers

  async getEmployer(id: string): Promise<Employer> {
    await this.simulate();
    const e = this.state.employers.find((x) => x.id === id);
    if (!e) throw new MockApiError("Employer not found", "not_found");
    return clone(e);
  }

  async listEmployers(): Promise<Employer[]> {
    await this.simulate();
    return clone(this.state.employers);
  }

  // ————————————————————————————————————————————————————————— shifts

  async listShifts(filters: ShiftFilters = {}, opts: { includeDrafts?: boolean; employerId?: string } = {}): Promise<Shift[]> {
    await this.simulate();
    let list = this.state.shifts.filter((s) => (opts.includeDrafts ? true : s.status !== "draft"));
    if (opts.employerId) list = list.filter((s) => s.employerId === opts.employerId);
    return clone(applyShiftFilters(list, filters, this.state.employers));
  }

  /** Public marketplace listing: open shifts in the future. */
  async listOpenShifts(filters: ShiftFilters = {}): Promise<Shift[]> {
    await this.simulate();
    const t = new Date();
    const list = this.state.shifts.filter((s) => s.status === "open" && !isBefore(parseISO(`${s.date}T${s.endTime}`), t));
    return clone(applyShiftFilters(list, filters, this.state.employers));
  }

  async getShift(id: string): Promise<Shift> {
    await this.simulate();
    const s = this.state.shifts.find((x) => x.id === id);
    if (!s) throw new MockApiError("This shift no longer exists.", "not_found");
    return clone(s);
  }

  async createShift(input: Omit<Shift, "id" | "createdAt" | "status"> & { status?: Shift["status"] }): Promise<Shift> {
    await this.simulate();
    const shift: Shift = { ...input, id: nextId("sh"), createdAt: nowIso(), status: input.status ?? "open" };
    this.state.shifts.unshift(shift);
    if (shift.status === "open") this.notifyMatchingWorkers(shift);
    this.persist();
    return clone(shift);
  }

  async updateShift(id: string, patch: Partial<Shift>): Promise<Shift> {
    await this.simulate();
    const s = this.state.shifts.find((x) => x.id === id);
    if (!s) throw new MockApiError("Shift not found", "not_found");
    const wasDraft = s.status === "draft";
    Object.assign(s, patch);
    // Posting a draft is the shift's first appearance to workers, same as creating it open.
    if (wasDraft && s.status === "open") this.notifyMatchingWorkers(s);
    this.persist();
    return clone(s);
  }

  async cancelShift(id: string): Promise<Shift> {
    const s = await this.updateShift(id, { status: "cancelled" });
    this.state.bookings.filter((b) => b.shiftId === id && ["confirmed", "applied", "invited"].includes(b.status)).forEach((b) => (b.status = "cancelled"));
    this.persist();
    return s;
  }

  /** Hard delete — used when an employer discards a draft, which was never visible to anyone. */
  async deleteShift(id: string): Promise<void> {
    await this.simulate();
    const i = this.state.shifts.findIndex((x) => x.id === id);
    if (i === -1) throw new MockApiError("This shift no longer exists.", "not_found");
    this.state.shifts.splice(i, 1);
    for (let b = this.state.bookings.length - 1; b >= 0; b--) {
      if (this.state.bookings[b].shiftId === id) this.state.bookings.splice(b, 1);
    }
    this.persist();
  }

  // ————————————————————————————————————————————————————————— bookings

  async listBookingsForShift(shiftId: string): Promise<Booking[]> {
    await this.simulate();
    return clone(this.state.bookings.filter((b) => b.shiftId === shiftId));
  }

  async listBookingsForWorker(workerId: string): Promise<Booking[]> {
    await this.simulate();
    return clone(this.state.bookings.filter((b) => b.workerId === workerId));
  }

  async listBookingsForEmployer(employerId: string): Promise<Booking[]> {
    await this.simulate();
    const ids = new Set(this.state.shifts.filter((s) => s.employerId === employerId).map((s) => s.id));
    return clone(this.state.bookings.filter((b) => ids.has(b.shiftId)));
  }

  async applyToShift(shiftId: string, workerId: string): Promise<Booking> {
    await this.simulate();
    const shift = this.state.shifts.find((s) => s.id === shiftId);
    if (!shift) throw new MockApiError("Shift not found", "not_found");
    const existing = this.state.bookings.find((b) => b.shiftId === shiftId && b.workerId === workerId && !["cancelled", "declined"].includes(b.status));
    if (existing) throw new MockApiError("You've already applied to this shift.", "conflict");
    const confirmedCount = this.state.bookings.filter((b) => b.shiftId === shiftId && b.status === "confirmed").length;
    // Employers with the worker in their talent pool get auto-confirmation; others go to review.
    const inPool = this.state.talentPool.some((t) => t.employerId === shift.employerId && t.workerId === workerId);
    const status: BookingStatus = inPool && confirmedCount < shift.workersNeeded ? "confirmed" : "applied";
    const booking: Booking = { id: nextId("bk"), shiftId, workerId, status, createdAt: nowIso() };
    this.state.bookings.push(booking);
    this.state.notifications.unshift({
      id: nextId("nt"), recipientId: shift.employerId, kind: "application",
      title: `${this.workerName(workerId)} ${status === "confirmed" ? "joined" : "applied to"} ${shift.title}`,
      body: status === "confirmed" ? "Auto-confirmed from your talent pool." : "Review the application to confirm.",
      createdAt: nowIso(), read: false, href: `/employer/jobs/${shiftId}`,
    });
    this.refreshShiftStatus(shift);
    this.persist();
    return clone(booking);
  }

  async respondToInvite(bookingId: string, accept: boolean): Promise<Booking> {
    await this.simulate();
    const b = this.mustBooking(bookingId);
    if (b.status !== "invited") throw new MockApiError("This invitation is no longer open.", "conflict");
    b.status = accept ? "confirmed" : "declined";
    const shift = this.state.shifts.find((s) => s.id === b.shiftId);
    if (shift) this.refreshShiftStatus(shift);
    this.persist();
    return clone(b);
  }

  async withdrawBooking(bookingId: string): Promise<Booking> {
    await this.simulate();
    const b = this.mustBooking(bookingId);
    if (!["applied", "confirmed", "invited"].includes(b.status)) throw new MockApiError("This booking can't be withdrawn.", "conflict");
    b.status = "cancelled";
    const shift = this.state.shifts.find((s) => s.id === b.shiftId);
    if (shift) this.refreshShiftStatus(shift);
    this.persist();
    return clone(b);
  }

  /** Employer confirms an applicant. */
  async confirmBooking(bookingId: string): Promise<Booking> {
    await this.simulate();
    const b = this.mustBooking(bookingId);
    if (b.status !== "applied") throw new MockApiError("Only applications can be confirmed.", "conflict");
    const shift = this.state.shifts.find((s) => s.id === b.shiftId);
    if (!shift) throw new MockApiError("Shift not found", "not_found");
    const confirmed = this.state.bookings.filter((x) => x.shiftId === shift.id && x.status === "confirmed").length;
    if (confirmed >= shift.workersNeeded) throw new MockApiError("All positions are already filled. Increase the headcount to confirm more workers.", "conflict");
    b.status = "confirmed";
    this.state.notifications.unshift({
      id: nextId("nt"), recipientId: b.workerId, kind: "booking_confirmed",
      title: `You're confirmed for ${shift.title}`, body: `${shift.venue}, ${shift.date} at ${shift.startTime}.`,
      createdAt: nowIso(), read: false, href: "/worker/schedule",
    });
    this.refreshShiftStatus(shift);
    this.persist();
    return clone(b);
  }

  async declineBooking(bookingId: string): Promise<Booking> {
    await this.simulate();
    const b = this.mustBooking(bookingId);
    const heldASeat = b.status === "confirmed";
    b.status = "declined";
    // Removing a confirmed worker frees a seat, so a "filled" shift has to fall back to "open".
    if (heldASeat) {
      const shift = this.state.shifts.find((s) => s.id === b.shiftId);
      if (shift) this.refreshShiftStatus(shift);
    }
    this.persist();
    return clone(b);
  }

  async inviteWorker(shiftId: string, workerId: string): Promise<Booking> {
    await this.simulate();
    const shift = this.state.shifts.find((s) => s.id === shiftId);
    if (!shift) throw new MockApiError("Shift not found", "not_found");
    const existing = this.state.bookings.find((b) => b.shiftId === shiftId && b.workerId === workerId && !["cancelled", "declined"].includes(b.status));
    if (existing) throw new MockApiError(`${this.workerName(workerId)} is already on this shift.`, "conflict");
    const booking: Booking = { id: nextId("bk"), shiftId, workerId, status: "invited", createdAt: nowIso() };
    this.state.bookings.push(booking);
    this.state.notifications.unshift({
      id: nextId("nt"), recipientId: workerId, kind: "application",
      title: `${this.employerName(shift.employerId)} invited you`, body: `${shift.title} — respond to secure your place.`,
      createdAt: nowIso(), read: false, href: `/worker/shifts/${shiftId}`,
    });
    this.persist();
    return clone(booking);
  }

  async checkIn(bookingId: string): Promise<Booking> {
    await this.simulate();
    const b = this.mustBooking(bookingId);
    if (b.status !== "confirmed") throw new MockApiError("You can only check in to a confirmed shift.", "conflict");
    b.status = "checked_in";
    b.checkInAt = nowIso();
    const shift = this.state.shifts.find((s) => s.id === b.shiftId);
    if (shift && shift.status === "filled") shift.status = "in_progress";
    this.persist();
    return clone(b);
  }

  async checkOut(bookingId: string): Promise<Booking> {
    await this.simulate();
    const b = this.mustBooking(bookingId);
    if (b.status !== "checked_in") throw new MockApiError("You're not checked in.", "conflict");
    b.status = "completed";
    b.checkOutAt = nowIso();
    const shift = this.state.shifts.find((s) => s.id === b.shiftId);
    if (shift) {
      this.state.payouts.unshift({
        id: nextId("po"), workerId: b.workerId, bookingId: b.id, shiftId: shift.id,
        amount: shift.payPerShift + (shift.transportAllowance ?? 0), status: "pending", method: "MTN MoMo",
        reference: `MP${Date.now().toString().slice(-9)}`, scheduledFor: addDays(new Date(), 1).toISOString().slice(0, 10),
      });
      this.state.notifications.unshift({
        id: nextId("nt"), recipientId: shift.employerId, kind: "attendance",
        title: `${this.workerName(b.workerId)} checked out`, body: `${shift.title}. Approve the shift to release payment.`,
        createdAt: nowIso(), read: false, href: `/employer/jobs/${shift.id}`,
      });
    }
    this.persist();
    return clone(b);
  }

  async markNoShow(bookingId: string): Promise<Booking> {
    await this.simulate();
    const b = this.mustBooking(bookingId);
    b.status = "no_show";
    const w = this.state.workers.find((x) => x.id === b.workerId);
    if (w) { w.noShows += 1; w.reliability = Math.max(0, w.reliability - 6); }
    this.persist();
    return clone(b);
  }

  /** Employer approves a completed booking and rates the worker; releases the payout. */
  async approveBooking(bookingId: string, rating: NonNullable<Booking["employerRating"]>): Promise<Booking> {
    await this.simulate();
    const b = this.mustBooking(bookingId);
    if (!["completed", "checked_in"].includes(b.status)) throw new MockApiError("Only completed shifts can be approved.", "conflict");
    b.status = "completed";
    b.approvedAt = nowIso();
    b.employerRating = rating;
    const w = this.state.workers.find((x) => x.id === b.workerId);
    if (w) {
      w.rating = Math.round(((w.rating * w.ratingCount + rating.score) / (w.ratingCount + 1)) * 10) / 10;
      w.ratingCount += 1;
      w.completedShifts += 1;
    }
    const po = this.state.payouts.find((p) => p.bookingId === bookingId);
    if (po) { po.status = "processing"; }
    const shift = this.state.shifts.find((s) => s.id === b.shiftId);
    if (shift) {
      this.state.notifications.unshift({
        id: nextId("nt"), recipientId: b.workerId, kind: "rating",
        title: `${this.employerName(shift.employerId)} rated you ${rating.score.toFixed(1)}`,
        body: rating.note ? `“${rating.note}”` : `${shift.title}. Payment is on its way.`,
        createdAt: nowIso(), read: false, href: "/worker/profile",
      });
    }
    this.persist();
    return clone(b);
  }

  async rateEmployer(bookingId: string, rating: NonNullable<Booking["workerRating"]>): Promise<Booking> {
    await this.simulate();
    const b = this.mustBooking(bookingId);
    b.workerRating = rating;
    this.persist();
    return clone(b);
  }

  // ————————————————————————————————————————————————————————— workers

  async listWorkers(filters: WorkerFilters = {}): Promise<Worker[]> {
    await this.simulate();
    return clone(applyWorkerFilters(this.state.workers, filters));
  }

  async getWorker(id: string): Promise<Worker> {
    await this.simulate();
    const w = this.state.workers.find((x) => x.id === id);
    if (!w) throw new MockApiError("Worker not found", "not_found");
    return clone(w);
  }

  async updateWorker(id: string, patch: Partial<Worker>): Promise<Worker> {
    await this.simulate();
    const w = this.state.workers.find((x) => x.id === id);
    if (!w) throw new MockApiError("Worker not found", "not_found");
    Object.assign(w, patch);
    this.persist();
    return clone(w);
  }

  /** Ranked candidates for a shift: skills, proximity, reliability, rating, prior work with this employer. */
  async rankWorkersForShift(shiftId: string): Promise<Array<{ worker: Worker; score: number; reasons: string[] }>> {
    await this.simulate();
    const shift = this.state.shifts.find((s) => s.id === shiftId);
    if (!shift) throw new MockApiError("Shift not found", "not_found");
    const booked = new Set(this.state.bookings.filter((b) => b.shiftId === shiftId && !["cancelled", "declined"].includes(b.status)).map((b) => b.workerId));
    const pool = new Set(this.state.talentPool.filter((t) => t.employerId === shift.employerId).map((t) => t.workerId));
    return this.state.workers
      .filter((w) => !booked.has(w.id) && w.skills.includes(shift.role))
      .map((w) => {
        const reasons: string[] = [];
        let score = 40;
        if (w.skills[0] === shift.role) { score += 15; reasons.push(`${ROLES[shift.role].short} is their primary skill`); }
        if (w.district === shift.district) { score += 10; reasons.push(`Based in ${shift.district}`); }
        score += Math.round(w.reliability * 0.2);
        if (w.reliability >= 95) reasons.push(`${w.reliability}% reliability`);
        score += Math.round(w.rating * 3);
        if (w.rating >= 4.8) reasons.push(`Rated ${w.rating.toFixed(1)}`);
        const priorWithEmployer = w.history.filter((h) => h.employerId === shift.employerId).length;
        if (priorWithEmployer) { score += 10; reasons.push(`Worked with you ${priorWithEmployer}× before`); }
        if (pool.has(w.id)) { score += 8; reasons.push("In your talent pool"); }
        if (w.completedShifts === 0) { score -= 10; reasons.push("New to GigSyc"); }
        return { worker: clone(w), score: Math.min(100, score), reasons };
      })
      .sort((a, b) => b.score - a.score);
  }

  // ————————————————————————————————————————————————————————— talent pool

  async listTalentPool(employerId: string): Promise<TalentPoolEntry[]> {
    await this.simulate();
    return clone(this.state.talentPool.filter((t) => t.employerId === employerId));
  }

  async toggleTalentPool(employerId: string, workerId: string, note?: string): Promise<{ inPool: boolean }> {
    await this.simulate();
    const idx = this.state.talentPool.findIndex((t) => t.employerId === employerId && t.workerId === workerId);
    if (idx >= 0) {
      this.state.talentPool.splice(idx, 1);
      this.persist();
      return { inPool: false };
    }
    this.state.talentPool.push({ employerId, workerId, addedAt: nowIso(), note });
    this.persist();
    return { inPool: true };
  }

  /** Edit the private team note on an existing pool entry. An empty note clears it. */
  async updateTalentPoolNote(employerId: string, workerId: string, note: string): Promise<TalentPoolEntry> {
    await this.simulate();
    const entry = this.state.talentPool.find((t) => t.employerId === employerId && t.workerId === workerId);
    if (!entry) throw new MockApiError("This worker is no longer in your talent pool.", "not_found");
    const trimmed = note.trim();
    if (trimmed) entry.note = trimmed;
    else delete entry.note;
    this.persist();
    return clone(entry);
  }

  // ————————————————————————————————————————————————————————— payments

  async listPayoutsForWorker(workerId: string): Promise<Payout[]> {
    await this.simulate();
    return clone(this.state.payouts.filter((p) => p.workerId === workerId).sort((a, b) => b.scheduledFor.localeCompare(a.scheduledFor)));
  }

  async listInvoicesForEmployer(employerId: string): Promise<Invoice[]> {
    await this.simulate();
    return clone(this.state.invoices.filter((i) => i.employerId === employerId));
  }

  async getInvoice(id: string): Promise<Invoice> {
    await this.simulate();
    const i = this.state.invoices.find((x) => x.id === id);
    if (!i) throw new MockApiError("Invoice not found", "not_found");
    return clone(i);
  }

  async payInvoice(id: string): Promise<Invoice> {
    await this.simulate();
    const i = this.state.invoices.find((x) => x.id === id);
    if (!i) throw new MockApiError("Invoice not found", "not_found");
    i.status = "paid";
    i.paidAt = today();
    this.persist();
    return clone(i);
  }

  // ————————————————————————————————————————————————————————— notifications

  async listNotifications(recipientId: string): Promise<AppNotification[]> {
    await this.simulate();
    return clone(this.state.notifications.filter((n) => n.recipientId === recipientId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  }

  async markNotificationRead(id: string): Promise<void> {
    await this.simulate();
    const n = this.state.notifications.find((x) => x.id === id);
    if (n) n.read = true;
    this.persist();
  }

  async markAllNotificationsRead(recipientId: string): Promise<void> {
    await this.simulate();
    this.state.notifications.filter((n) => n.recipientId === recipientId).forEach((n) => (n.read = true));
    this.persist();
  }


  // ————————————————————————————————————————————————————————— events (public)

  /**
   * Customer-facing listing. Only `published` events are ever returned, which is what
   * makes an admin publish/unpublish genuinely change the public site.
   */
  async listPublicEvents(filters: EventFilters = {}): Promise<Event[]> {
    await this.simulate();
    const live = this.state.events.filter((e) => e.status === "published" && !isEventOver(e));
    return clone(applyEventFilters(live, filters, this.state.employers));
  }

  /** Published events that have already finished — used for "past events" context. */
  async listPastEvents(limit = 6): Promise<Event[]> {
    await this.simulate();
    const past = this.state.events
      .filter((e) => e.status === "published" || e.status === "completed")
      .filter((e) => isEventOver(e))
      .sort((a, b) => (b.endDate ?? b.date).localeCompare(a.endDate ?? a.date));
    return clone(past.slice(0, limit));
  }

  async getPublicEventBySlug(slug: string): Promise<Event> {
    await this.simulate();
    const e = this.state.events.find((x) => x.slug === slug);
    if (!e || !isPubliclyReachable(e.status)) {
      throw new MockApiError("We couldn't find that event. It may have been taken down.", "not_found");
    }
    return clone(e);
  }

  /** Same-city or same-category published events, excluding the one being viewed. */
  async listRelatedEvents(eventId: string, limit = 3): Promise<Event[]> {
    await this.simulate();
    const base = this.state.events.find((e) => e.id === eventId);
    if (!base) return [];
    const pool = this.state.events.filter((e) => e.id !== eventId && e.status === "published" && !isEventOver(e));
    const scored = pool
      .map((e) => ({ e, score: (e.place === base.place ? 2 : 0) + (e.category === base.category ? 3 : 0) + (e.featured ? 1 : 0) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score || a.e.date.localeCompare(b.e.date));
    return clone(scored.slice(0, limit).map((x) => x.e));
  }

  async listDestinations(opts: { publishedOnly?: boolean } = {}): Promise<Destination[]> {
    await this.simulate();
    const list = opts.publishedOnly ? this.state.destinations.filter((d) => d.published) : this.state.destinations;
    return clone(list);
  }

  async getDestination(slug: string): Promise<Destination> {
    await this.simulate();
    const d = this.state.destinations.find((x) => x.slug === slug);
    if (!d) throw new MockApiError("Destination not found", "not_found");
    return clone(d);
  }

  // ————————————————————————————————————————————————————————— saved events

  async listSavedEventIds(userId: string): Promise<string[]> {
    await this.simulate();
    return this.state.savedEvents.filter((s) => s.userId === userId).map((s) => s.eventId);
  }

  async toggleSavedEvent(userId: string, eventId: string): Promise<{ saved: boolean }> {
    await this.simulate();
    const i = this.state.savedEvents.findIndex((s) => s.userId === userId && s.eventId === eventId);
    if (i >= 0) {
      this.state.savedEvents.splice(i, 1);
      this.persist();
      return { saved: false };
    }
    this.state.savedEvents.push({ userId, eventId, savedAt: nowIso() });
    this.persist();
    return { saved: true };
  }

  /** Registering or buying a ticket in the prototype just increments the attendance count. */
  async attendEvent(eventId: string): Promise<Event> {
    await this.simulate();
    const e = this.state.events.find((x) => x.id === eventId);
    if (!e) throw new MockApiError("Event not found", "not_found");
    if (e.status !== "published") throw new MockApiError("This event is no longer taking sign-ups.", "conflict");
    if (e.attending >= e.capacity) throw new MockApiError("This event is at capacity.", "conflict");
    e.attending += 1;
    this.persist();
    return clone(e);
  }

  // ————————————————————————————————————————————————————————— events (admin)

  async listAdminEvents(filters: AdminEventFilters = {}): Promise<Event[]> {
    await this.simulate();
    let list = [...this.state.events];
    if (filters.query) {
      const q = filters.query.toLowerCase();
      const names = new Map(this.state.employers.map((e) => [e.id, e.name.toLowerCase()]));
      list = list.filter((e) =>
        e.title.toLowerCase().includes(q) || e.venue.toLowerCase().includes(q) ||
        e.place.toLowerCase().includes(q) || (names.get(e.organizerId) ?? "").includes(q));
    }
    if (filters.statuses?.length) list = list.filter((e) => filters.statuses!.includes(e.status));
    if (filters.categories?.length) list = list.filter((e) => filters.categories!.includes(e.category));
    if (filters.places?.length) list = list.filter((e) => filters.places!.includes(e.place));
    switch (filters.sort) {
      case "title": list.sort((a, b) => a.title.localeCompare(b.title)); break;
      case "submitted": list.sort((a, b) => (b.submittedAt ?? b.createdAt).localeCompare(a.submittedAt ?? a.createdAt)); break;
      default: list.sort((a, b) => a.date.localeCompare(b.date));
    }
    return clone(list);
  }

  async getAdminEvent(id: string): Promise<Event> {
    await this.simulate();
    const e = this.state.events.find((x) => x.id === id);
    if (!e) throw new MockApiError("Event not found", "not_found");
    return clone(e);
  }

  /**
   * The one write that connects the two sides of the product: moving an event to
   * `published` makes it appear on /events, anything else removes it.
   */
  async setEventStatus(id: string, status: EventStatus, note?: string): Promise<Event> {
    await this.simulate();
    const e = this.state.events.find((x) => x.id === id);
    if (!e) throw new MockApiError("Event not found", "not_found");
    e.status = status;
    e.reviewedAt = nowIso();
    e.reviewNote = note ?? (status === "published" ? undefined : e.reviewNote);
    if (status === "published") {
      this.state.notifications.unshift({
        id: nextId("nt"), recipientId: e.organizerId, kind: "system",
        title: `${e.title} is live`, body: "Your event is now visible on GigSyc.",
        createdAt: nowIso(), read: false, href: `/events/${e.slug}`,
      });
    }
    if (status === "rejected") {
      this.state.notifications.unshift({
        id: nextId("nt"), recipientId: e.organizerId, kind: "system",
        title: `${e.title} was not approved`, body: note ?? "See the review note for details.",
        createdAt: nowIso(), read: false,
      });
    }
    this.persist();
    return clone(e);
  }

  async setEventFeatured(id: string, featured: boolean): Promise<Event> {
    await this.simulate();
    const e = this.state.events.find((x) => x.id === id);
    if (!e) throw new MockApiError("Event not found", "not_found");
    e.featured = featured;
    this.persist();
    return clone(e);
  }

  // ————————————————————————————————————————————————————————— admin: destinations, users, partners, moderation

  async updateDestination(id: string, patch: Partial<Destination>): Promise<Destination> {
    await this.simulate();
    const d = this.state.destinations.find((x) => x.id === id);
    if (!d) throw new MockApiError("Destination not found", "not_found");
    Object.assign(d, patch);
    this.persist();
    return clone(d);
  }

  async listPlatformUsers(): Promise<PlatformUser[]> {
    await this.simulate();
    return clone(this.state.platformUsers);
  }

  async getPlatformUser(id: string): Promise<PlatformUser> {
    await this.simulate();
    const u = this.state.platformUsers.find((x) => x.id === id);
    if (!u) throw new MockApiError("User not found", "not_found");
    return clone(u);
  }

  async setPlatformUserStatus(id: string, status: PlatformUser["status"]): Promise<PlatformUser> {
    await this.simulate();
    const u = this.state.platformUsers.find((x) => x.id === id);
    if (!u) throw new MockApiError("User not found", "not_found");
    u.status = status;
    this.persist();
    return clone(u);
  }

  /** Partner verification flips the same `verified` flag the employer side already uses. */
  async setPartnerVerified(employerId: string, verified: boolean): Promise<Employer> {
    await this.simulate();
    const e = this.state.employers.find((x) => x.id === employerId);
    if (!e) throw new MockApiError("Partner not found", "not_found");
    e.verified = verified;
    const contact = this.state.platformUsers.find((u) => u.linkedEmployerId === employerId);
    if (contact) contact.status = verified ? "active" : "pending";
    this.persist();
    return clone(e);
  }

  async listReports(): Promise<Report[]> {
    await this.simulate();
    return clone([...this.state.reports].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  }

  async resolveReport(id: string, outcome: "resolved" | "dismissed", resolution: string): Promise<Report> {
    await this.simulate();
    const r = this.state.reports.find((x) => x.id === id);
    if (!r) throw new MockApiError("Report not found", "not_found");
    r.status = outcome;
    r.resolution = resolution;
    r.resolvedAt = nowIso();
    this.persist();
    return clone(r);
  }

  async listSystemServices(): Promise<SystemService[]> {
    await this.simulate();
    return clone(this.state.systemServices);
  }


  // ————————————————————————————————————————————————————————— accounts & auth

  private findAccount(email: string) {
    const e = email.trim().toLowerCase();
    return this.state.accounts.find((a) => a.email.toLowerCase() === e);
  }

  async getAccount(id: string): Promise<AuthUser> {
    await this.simulate();
    const a = this.state.accounts.find((x) => x.id === id);
    if (!a) throw new AuthError("That account no longer exists.", "not_found");
    return clone(a);
  }

  /**
   * Mock sign-in. Any password of the minimum length is accepted for a known
   * address — there are no stored credentials and none are ever checked.
   */
  async signIn(email: string, password: string): Promise<AuthUser> {
    await this.simulate();
    const account = this.findAccount(email);
    if (!account) throw new AuthError("We don't recognise that email address.", "invalid_credentials");
    if (password.length < MIN_PASSWORD_LENGTH) {
      throw new AuthError("That password doesn't match this account.", "invalid_credentials");
    }
    return clone(account);
  }

  async signUp(input: SignUpInput): Promise<AuthUser> {
    await this.simulate();
    if (this.findAccount(input.email)) {
      throw new AuthError("An account already uses that email. Try signing in instead.", "email_taken");
    }
    if (input.password.length < MIN_PASSWORD_LENGTH) {
      throw new AuthError(`Use at least ${MIN_PASSWORD_LENGTH} characters.`, "weak_password");
    }
    return clone(this.createAccount({ name: input.name, email: input.email, role: input.role ?? "customer", signInMethod: "email", emailVerified: false }));
  }

  /**
   * Simulated federated sign-in for Google and Apple. No credentials are involved:
   * the chooser hands back an identity, and we either return the existing account or
   * create a verified one. Swap this for a real OAuth code exchange and nothing above
   * it changes — the shape a provider returns is already what this takes.
   */
  async signInWithProvider(input: {
    provider: "google" | "apple";
    name: string;
    email: string;
    role?: AuthUser["role"];
  }): Promise<AuthUser> {
    await this.simulate();
    const existing = this.findAccount(input.email);
    if (existing) return clone(existing);
    // A federated address is already proven, so these accounts skip email verification.
    return clone(this.createAccount({
      name: input.name,
      email: input.email,
      role: input.role ?? "customer",
      signInMethod: input.provider,
      emailVerified: true,
    }));
  }

  /** @deprecated Use signInWithProvider. */
  async signInWithGoogle(input: { name: string; email: string; role?: AuthUser["role"] }): Promise<AuthUser> {
    return this.signInWithProvider({ provider: "google", ...input });
  }

  private createAccount(input: { name: string; email: string; role: AuthUser["role"]; signInMethod: AuthUser["signInMethod"]; emailVerified: boolean }): AuthUser {
    const palette = ["#001b56", "#17336b", "#0096b5", "#b88200", "#116a3e", "#932a1f", "#7a1fa2"];
    const colour = palette[this.state.accounts.length % palette.length];
    const platformUserId = nextId("pu");
    const account: AuthUser = {
      id: nextId("ac"),
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      role: input.role,
      avatarColor: colour,
      emailVerified: input.emailVerified,
      onboardingCompleted: false,
      signInMethod: input.signInMethod,
      createdAt: nowIso(),
      interests: [],
      platformUserId,
    };
    this.state.accounts.push(account);
    // A new sign-up is a real person on the platform, so it shows up in the admin console too.
    this.state.platformUsers.unshift({
      id: platformUserId,
      name: account.name,
      email: account.email,
      role: account.role === "partner" ? "organizer" : account.role === "worker" ? "professional" : account.role,
      status: input.emailVerified ? "active" : "pending",
      joinedAt: today(),
      lastActiveAt: nowIso(),
      place: "Kigali",
      avatarColor: colour,
      eventsAttended: 0,
    });
    this.persist();
    return account;
  }

  async updateAccount(id: string, patch: Partial<AuthUser>): Promise<AuthUser> {
    await this.simulate();
    const a = this.state.accounts.find((x) => x.id === id);
    if (!a) throw new AuthError("That account no longer exists.", "not_found");
    Object.assign(a, patch);
    const pu = this.state.platformUsers.find((u) => u.id === a.platformUserId);
    if (pu) {
      pu.name = a.name;
      pu.email = a.email;
      if (a.location) pu.place = a.location;
      if (a.emailVerified && pu.status === "pending") pu.status = "active";
      pu.lastActiveAt = nowIso();
    }
    this.persist();
    return clone(a);
  }

  /** Accepts any six digits — there is no real code to check. */
  async verifyEmail(id: string, code: string): Promise<AuthUser> {
    await this.simulate();
    if (!/^\d{6}$/.test(code.trim())) throw new AuthError("Enter the six-digit code from your email.", "invalid_credentials");
    return this.updateAccount(id, { emailVerified: true });
  }

  async completeCustomerOnboarding(id: string, input: CustomerOnboardingInput): Promise<AuthUser> {
    return this.updateAccount(id, {
      location: input.location,
      interests: input.interests,
      discoveryPreference: input.discoveryPreference,
      onboardingCompleted: true,
    });
  }

  /**
   * Finishing partner onboarding creates the Employer record the workforce product
   * already understands, so a new partner lands in a working workspace.
   */
  async completePartnerOnboarding(id: string, input: PartnerOnboardingInput): Promise<AuthUser> {
    await this.simulate();
    const account = this.state.accounts.find((x) => x.id === id);
    if (!account) throw new AuthError("That account no longer exists.", "not_found");

    const employerId = account.employerId ?? nextId("emp");
    if (!account.employerId) {
      this.state.employers.push({
        id: employerId,
        name: input.organizationName,
        slug: input.organizationName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
        sector: input.organizationType === "hotel" || input.organizationType === "restaurant" ? "hospitality" : "events",
        tagline: `${input.organizationName} on GigSyc.`,
        about: "This partner joined through the GigSyc prototype and has not added a description yet.",
        district: "Kimihurura",
        verified: false,
        memberSince: today(),
        markColor: account.avatarColor,
        contact: { name: input.contactName, role: "Primary contact", email: account.email, phone: input.phone },
        stats: { shiftsPosted: 0, workersEngaged: 0, avgRatingGiven: 0, fillRate: 0 },
      });
    }

    account.role = "partner";
    account.employerId = employerId;
    account.location = input.place;
    account.onboardingCompleted = true;
    account.organization = {
      name: input.organizationName,
      type: input.organizationType,
      contactName: input.contactName,
      phone: input.phone,
      place: input.place,
      verified: false,
    };
    const pu = this.state.platformUsers.find((u) => u.id === account.platformUserId);
    if (pu) { pu.role = "organizer"; pu.linkedEmployerId = employerId; pu.place = input.place; }
    this.persist();
    return clone(account);
  }

  /** Password reset is simulated end to end; nothing is stored or sent. */
  async requestPasswordReset(email: string): Promise<{ sent: boolean }> {
    await this.simulate();
    // Always reports success, and deliberately never reads the address, so the
    // response cannot disclose which addresses exist. The parameter stays in the
    // signature because the real endpoint will need it.
    void email;
    return { sent: true };
  }

  /**
   * Re-sends the six-digit verification code. Nothing is generated or delivered —
   * `verifyEmail` accepts any six digits — but this is its own seam so the UI is not
   * calling the password-reset endpoint to do it.
   */
  async resendVerification(email: string): Promise<{ sent: boolean }> {
    await this.simulate();
    void email;
    return { sent: true };
  }

  async resetPassword(password: string): Promise<{ ok: boolean }> {
    await this.simulate();
    if (password.length < MIN_PASSWORD_LENGTH) throw new AuthError(`Use at least ${MIN_PASSWORD_LENGTH} characters.`, "weak_password");
    return { ok: true };
  }

  // ————————————————————————————————————————————————————————— helpers

  private mustBooking(id: string) {
    const b = this.state.bookings.find((x) => x.id === id);
    if (!b) throw new MockApiError("Booking not found", "not_found");
    return b;
  }
  private workerName(id: string) {
    const w = this.state.workers.find((x) => x.id === id);
    return w ? `${w.firstName} ${w.lastName}` : "A worker";
  }
  private employerName(id: string) {
    return this.state.employers.find((x) => x.id === id)?.name ?? "An employer";
  }
  /** Tell a handful of workers with the right skills, so the worker inbox reflects a new post. */
  private notifyMatchingWorkers(shift: Shift) {
    const matches = this.state.workers.filter((w) => w.skills.includes(shift.role)).slice(0, 5);
    for (const w of matches) {
      this.state.notifications.unshift({
        id: nextId("nt"), recipientId: w.id, kind: "shift_match",
        title: "New shift matches your skills",
        body: `${shift.title} — RWF ${shift.payPerShift.toLocaleString()}, ${shift.date} ${shift.startTime}.`,
        createdAt: nowIso(), read: false, href: `/worker/shifts/${shift.id}`,
      });
    }
  }

  /** open ⇄ filled based on confirmed headcount. */
  private refreshShiftStatus(shift: Shift) {
    if (!["open", "filled"].includes(shift.status)) return;
    const confirmed = this.state.bookings.filter((b) => b.shiftId === shift.id && b.status === "confirmed").length;
    shift.status = confirmed >= shift.workersNeeded ? "filled" : "open";
  }
}


/** True once the event's final day has passed. */
function isEventOver(e: Event): boolean {
  const last = e.endDate ?? e.date;
  return isBefore(parseISO(`${last}T${e.endTime < e.startTime ? "23:59" : e.endTime}`), new Date());
}

function eventMinPrice(e: Event): number {
  if (e.attendanceMode === "free" || e.tickets.length === 0) return 0;
  return Math.min(...e.tickets.map((t) => t.price));
}

function applyEventFilters(list: Event[], f: EventFilters, employers: Employer[]): Event[] {
  let out = list;
  if (f.query) {
    const q = f.query.toLowerCase();
    const names = new Map(employers.map((e) => [e.id, e.name.toLowerCase()]));
    out = out.filter((e) =>
      e.title.toLowerCase().includes(q) || e.tagline.toLowerCase().includes(q) ||
      e.venue.toLowerCase().includes(q) || e.place.toLowerCase().includes(q) ||
      e.category.includes(q) || (names.get(e.organizerId) ?? "").includes(q));
  }
  if (f.categories?.length) out = out.filter((e) => f.categories!.includes(e.category));
  if (f.places?.length) out = out.filter((e) => f.places!.includes(e.place));
  if (f.featuredOnly) out = out.filter((e) => e.featured);
  if (f.price === "free") out = out.filter((e) => eventMinPrice(e) === 0);
  if (f.price === "paid") out = out.filter((e) => eventMinPrice(e) > 0);
  if (f.when && f.when !== "all") {
    // Whole-day windows, shared with the date rail's counts — see eventMatchesWhen.
    const now = new Date();
    out = out.filter((e) => eventMatchesWhen(e, f.when!, now));
  }
  switch (f.sort) {
    case "popular": out = [...out].sort((a, b) => b.attending - a.attending); break;
    case "price_asc": out = [...out].sort((a, b) => eventMinPrice(a) - eventMinPrice(b) || a.date.localeCompare(b.date)); break;
    case "newest": out = [...out].sort((a, b) => b.createdAt.localeCompare(a.createdAt)); break;
    default: out = [...out].sort((a, b) => `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`));
  }
  return out;
}

// ————————————————————————————————————————————————————————— filtering

function applyShiftFilters(list: Shift[], f: ShiftFilters, employers: Employer[]): Shift[] {
  let out = list;
  if (f.query) {
    const q = f.query.toLowerCase();
    const empName = new Map(employers.map((e) => [e.id, e.name.toLowerCase()]));
    out = out.filter((s) =>
      s.title.toLowerCase().includes(q) || s.venue.toLowerCase().includes(q) || s.district.toLowerCase().includes(q) ||
      ROLES[s.role].label.toLowerCase().includes(q) || (empName.get(s.employerId) ?? "").includes(q),
    );
  }
  if (f.roles?.length) out = out.filter((s) => f.roles!.includes(s.role));
  if (f.districts?.length) out = out.filter((s) => f.districts!.includes(s.district));
  if (f.minPay) out = out.filter((s) => s.payPerShift >= f.minPay!);
  if (f.urgentOnly) out = out.filter((s) => s.urgent);
  if (f.dateRange && f.dateRange !== "all") {
    const now = new Date();
    out = out.filter((s) => {
      const d = parseISO(s.date);
      switch (f.dateRange) {
        case "today": return isSameDay(d, now);
        case "tomorrow": return isSameDay(d, addDays(now, 1));
        case "week": return !isBefore(d, startOfWeek(now, { weekStartsOn: 1 })) && !isAfter(d, endOfWeek(now, { weekStartsOn: 1 }));
        case "weekend": { const day = d.getDay(); return (day === 0 || day === 6) && !isBefore(d, now) && !isAfter(d, addDays(now, 7)); }
        default: return true;
      }
    });
  }
  switch (f.sort) {
    case "pay_desc": out = [...out].sort((a, b) => b.payPerShift - a.payPerShift); break;
    case "newest": out = [...out].sort((a, b) => b.createdAt.localeCompare(a.createdAt)); break;
    default: out = [...out].sort((a, b) => `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`));
  }
  return out;
}

function applyWorkerFilters(list: Worker[], f: WorkerFilters): Worker[] {
  let out = list;
  if (f.query) {
    const q = f.query.toLowerCase();
    out = out.filter((w) =>
      `${w.firstName} ${w.lastName}`.toLowerCase().includes(q) || w.headline.toLowerCase().includes(q) ||
      w.skills.some((s) => ROLES[s].label.toLowerCase().includes(q)) || w.district.toLowerCase().includes(q),
    );
  }
  if (f.roles?.length) out = out.filter((w) => w.skills.some((s) => f.roles!.includes(s)));
  if (f.districts?.length) out = out.filter((w) => f.districts!.includes(w.district));
  if (f.minRating) out = out.filter((w) => w.rating >= f.minRating!);
  if (f.minReliability) out = out.filter((w) => w.reliability >= f.minReliability!);
  if (f.verifiedOnly) out = out.filter((w) => Object.values(w.verifications).every(Boolean));
  switch (f.sort) {
    case "rating": out = [...out].sort((a, b) => b.rating - a.rating); break;
    case "reliability": out = [...out].sort((a, b) => b.reliability - a.reliability); break;
    case "experience": out = [...out].sort((a, b) => b.completedShifts - a.completedShifts); break;
    default: out = [...out].sort((a, b) => b.rating * 20 + b.reliability - (a.rating * 20 + a.reliability));
  }
  return out;
}

export const store = new MockStore();
export { DEMO_EMPLOYER_ID, DEMO_WORKER_ID };
export { isEventOver, eventMinPrice };
