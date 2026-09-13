/**
 * Public events layer.
 *
 * One `Event` model powers both the customer-facing discovery pages and the admin
 * console. `status` is the single switch between them: only `published` events are
 * ever returned by the public queries, so an admin unpublishing an event genuinely
 * removes it from `/events`.
 */

export type EventCategory =
  | "music"
  | "culture"
  | "food"
  | "sports"
  | "nightlife"
  | "family"
  | "business"
  | "festivals"
  | "outdoor"
  | "community";

export type EventStatus =
  | "draft"
  | "pending_review"
  | "published"
  | "rejected"
  | "cancelled"
  | "completed";

/** Cities and parks we run events in. Doubles as the destination key. */
export type RwandaPlace =
  | "Kigali"
  | "Musanze"
  | "Rubavu"
  | "Huye"
  | "Nyanza"
  | "Karongi"
  | "Nyungwe"
  | "Akagera";

/** How a guest gets in. Drives which primary action the detail page offers. */
export type AttendanceMode = "tickets" | "register" | "free";

export interface TicketTier {
  id: string;
  name: string;
  /** RWF. 0 means free. */
  price: number;
  description?: string;
  /** Remaining allocation; undefined = not tracked. */
  remaining?: number;
  soldOut?: boolean;
}

export interface Event {
  id: string;
  slug: string;
  title: string;
  /** One-line hook shown on cards and under the detail title. */
  tagline: string;
  description: string;
  /** "What to expect" bullets. */
  highlights: string[];
  category: EventCategory;
  status: EventStatus;
  featured: boolean;
  /** Organiser — an Employer record, so partners are the same entities that hire staff. */
  organizerId: string;
  place: RwandaPlace;
  venue: string;
  address: string;
  /** yyyy-MM-dd */
  date: string;
  /** Set for multi-day events. */
  endDate?: string;
  /** HH:mm */
  startTime: string;
  endTime: string;
  doorsOpen?: string;
  coverImage: string;
  gallery: string[];
  attendanceMode: AttendanceMode;
  tickets: TicketTier[];
  capacity: number;
  /** Drives "popular" sorting and the social proof line. */
  attending: number;
  ageRestriction?: string;
  accessibility: string[];
  /** Practical notes shown under "Good to know". */
  goodToKnow: string[];
  createdAt: string;
  submittedAt?: string;
  reviewedAt?: string;
  reviewNote?: string;
  /** GigSyc shifts staffing this event — the link back to the workforce product. */
  staffedShiftIds: string[];
}

export interface EventFilters {
  query?: string;
  categories?: EventCategory[];
  places?: RwandaPlace[];
  when?: "today" | "tomorrow" | "weekend" | "week" | "month" | "all";
  price?: "all" | "free" | "paid";
  featuredOnly?: boolean;
  sort?: "soonest" | "popular" | "price_asc" | "newest";
}

export interface AdminEventFilters {
  query?: string;
  statuses?: EventStatus[];
  categories?: EventCategory[];
  places?: RwandaPlace[];
  sort?: "soonest" | "submitted" | "title";
}

export interface Destination {
  id: string;
  slug: string;
  name: RwandaPlace;
  region: string;
  tagline: string;
  description: string;
  heroImage: string;
  gallery: string[];
  knownFor: string[];
  featured: boolean;
  published: boolean;
  /** Rough drive time from Kigali; undefined for Kigali itself. */
  travelFromKigali?: string;
}

export type PlatformRole = "customer" | "organizer" | "professional" | "admin";
export type PlatformUserStatus = "active" | "pending" | "suspended";

export interface PlatformUser {
  id: string;
  name: string;
  email: string;
  role: PlatformRole;
  status: PlatformUserStatus;
  joinedAt: string;
  lastActiveAt: string;
  place: RwandaPlace;
  avatarColor: string;
  eventsAttended: number;
  /** Set when this account is also a worker or an organisation contact. */
  linkedWorkerId?: string;
  linkedEmployerId?: string;
}

export type ReportKind = "event" | "organizer" | "review" | "profile";
export type ReportStatus = "open" | "resolved" | "dismissed";
export type ReportSeverity = "low" | "medium" | "high";

export interface Report {
  id: string;
  kind: ReportKind;
  /** Event id, employer id, etc. */
  targetId: string;
  targetLabel: string;
  reason: string;
  detail: string;
  reportedByName: string;
  createdAt: string;
  status: ReportStatus;
  severity: ReportSeverity;
  resolution?: string;
  resolvedAt?: string;
}

export type ServiceStatus = "operational" | "degraded" | "down" | "maintenance";

export interface SystemService {
  id: string;
  name: string;
  description: string;
  status: ServiceStatus;
  /** Percentage, 30-day. */
  uptime: number;
  latencyMs: number;
  note?: string;
  lastIncidentAt?: string;
}

export interface SavedEvent {
  userId: string;
  eventId: string;
  savedAt: string;
}
