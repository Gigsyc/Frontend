import type { Destination, PlatformUser, Report, SystemService } from "@/types";
import { IMAGES } from "../images";
import { dayOffset, isoOffset } from "./dates";

export const DESTINATIONS: Destination[] = [
  {
    id: "ds_kigali", slug: "kigali", name: "Kigali", region: "Kigali City",
    tagline: "The capital, and the country's event engine.",
    description: "Rwanda's capital spreads across a dozen hills and hosts most of the country's conferences, concerts and nightlife. Everything from a Tuesday listening night to a 25,000-seat stadium show happens here.",
    heroImage: IMAGES.cityBusiness, gallery: [IMAGES.conferenceHall, IMAGES.clubNight, IMAGES.foodCommunal],
    knownFor: ["Conferences and expos", "Live music and nightlife", "Coffee and food markets", "The Car Free Zone"],
    featured: true, published: true,
  },
  {
    id: "ds_musanze", slug: "musanze", name: "Musanze", region: "Northern Province",
    tagline: "Volcano country, and the gateway to the gorillas.",
    description: "Musanze sits at the foot of the Virunga chain. Beyond gorilla trekking it has become the base for trail running, caving and the Kwita Izina ceremony each year.",
    heroImage: IMAGES.greenHills, gallery: [IMAGES.hiking, IMAGES.forest, IMAGES.communityKids],
    knownFor: ["Gorilla trekking", "Volcano trail runs", "Kwita Izina", "Caves and craters"],
    featured: true, published: true, travelFromKigali: "2h by road",
  },
  {
    id: "ds_rubavu", slug: "rubavu", name: "Rubavu", region: "Western Province",
    tagline: "Lake Kivu's beach town, two hours from the capital.",
    description: "Gisenyi's waterfront is the closest thing Rwanda has to a beach resort: sailing, sunset cruises, beach volleyball and a string of lakeside bars.",
    heroImage: IMAGES.lakeKivu, gallery: [IMAGES.lakeBoat, IMAGES.cocktailsNeon, IMAGES.familyKids],
    knownFor: ["Lake Kivu beaches", "Sunset cruises", "Beach sports", "Congo Nile Trail start"],
    featured: true, published: true, travelFromKigali: "3h by road",
  },
  {
    id: "ds_huye", slug: "huye", name: "Huye", region: "Southern Province",
    tagline: "The university town, and the country's museum quarter.",
    description: "Huye holds the National Museum, the oldest university campus and a steady calendar of student theatre, poetry and heritage walks.",
    heroImage: IMAGES.communityMarket, gallery: [IMAGES.cultureCrowd, IMAGES.workshop],
    knownFor: ["National Museum", "Student arts scene", "Craft cooperatives", "Coffee washing stations"],
    featured: false, published: true, travelFromKigali: "2h 30m by road",
  },
  {
    id: "ds_nyanza", slug: "nyanza", name: "Nyanza", region: "Southern Province",
    tagline: "The royal capital and the Inyambo cattle.",
    description: "Nyanza's reconstructed King's Palace and its long-horned Inyambo herd anchor most of the country's ceremonial and heritage programming.",
    heroImage: IMAGES.fashionShow, gallery: [IMAGES.cultureCrowd, IMAGES.greenHills],
    knownFor: ["King's Palace Museum", "Inyambo cattle", "Traditional dance", "Royal history"],
    featured: false, published: true, travelFromKigali: "1h 45m by road",
  },
  {
    id: "ds_karongi", slug: "karongi", name: "Karongi", region: "Western Province",
    tagline: "Quiet lake days on the Kibuye shore.",
    description: "Karongi is the calmer side of Lake Kivu: island hopping, family beach days and a growing weekend market.",
    heroImage: IMAGES.lakeBoat, gallery: [IMAGES.lakeKivu, IMAGES.familyKids],
    knownFor: ["Island boat trips", "Family beach days", "Fishermen's singing", "Weekend market"],
    featured: false, published: true, travelFromKigali: "3h by road",
  },
  {
    id: "ds_nyungwe", slug: "nyungwe", name: "Nyungwe", region: "Western Province",
    tagline: "Ancient rainforest and a canopy walk sixty metres up.",
    description: "One of Africa's oldest rainforests, with chimpanzee tracking, thirteen primate species and a suspended canopy walkway.",
    heroImage: IMAGES.forest, gallery: [IMAGES.hiking, IMAGES.greenHills],
    knownFor: ["Canopy walkway", "Chimpanzee tracking", "Waterfall trails", "Tea estates"],
    featured: true, published: true, travelFromKigali: "5h by road",
  },
  {
    id: "ds_akagera", slug: "akagera", name: "Akagera", region: "Eastern Province",
    tagline: "Savannah, lakes and the Big Five, two hours east.",
    description: "Rwanda's only savannah park, restored over the last decade to hold lion, rhino, elephant and buffalo across a landscape of lakes and papyrus swamp.",
    heroImage: IMAGES.savannah, gallery: [IMAGES.wildlife, IMAGES.safari, IMAGES.giraffeSunset],
    knownFor: ["Big Five game drives", "Boat safaris on Lake Ihema", "Night drives", "Birding"],
    featured: true, published: true, travelFromKigali: "2h 30m by road",
  },
];

const U = (
  id: string, name: string, email: string, role: PlatformUser["role"], status: PlatformUser["status"],
  joined: number, active: number, place: PlatformUser["place"], color: string, attended: number,
  extra: Partial<PlatformUser> = {},
): PlatformUser => ({
  id, name, email, role, status,
  joinedAt: dayOffset(joined), lastActiveAt: isoOffset(active, 14),
  place, avatarColor: color, eventsAttended: attended, ...extra,
});

export const PLATFORM_USERS: PlatformUser[] = [
  U("pu_chantal", "Chantal Iradukunda", "chantal.i@example.rw", "customer", "active", -140, 0, "Kigali", "#001b56", 14),
  U("pu_eric", "Eric Mugabo", "eric.mugabo@example.rw", "customer", "active", -96, -1, "Kigali", "#17336b", 9),
  U("pu_nadia", "Nadia Umulisa", "nadia.u@example.rw", "customer", "active", -61, 0, "Rubavu", "#0096b5", 6),
  U("pu_jean", "Jean de Dieu Habimana", "jdd.habimana@example.rw", "customer", "active", -48, -2, "Musanze", "#116a3e", 4),
  U("pu_alice", "Alice Mutoni", "alice.mutoni@example.rw", "customer", "active", -33, -1, "Kigali", "#b88200", 7),
  U("pu_kevin", "Kevin Ndayisenga", "kevin.n@example.rw", "customer", "pending", -2, -2, "Huye", "#4d5567", 0),
  U("pu_sylvie", "Sylvie Mukandayisenga", "sylvie.m@example.rw", "customer", "active", -19, -3, "Kigali", "#932a1f", 2),
  U("pu_bosco", "Bosco Nkurunziza", "bosco.n@example.rw", "customer", "suspended", -210, -30, "Kigali", "#8f6400", 21),
  U("pu_aline", "Aline Uwase", "aline.uwase@example.rw", "professional", "active", -190, 0, "Kigali", "#001b56", 11, { linkedWorkerId: "wk_aline" }),
  U("pu_divine", "Divine Iradukunda", "divine.i@example.rw", "professional", "active", -300, -1, "Kigali", "#0096b5", 8, { linkedWorkerId: "wk_divine" }),
  U("pu_kevinm", "Kevin Mugisha", "kevin.mugisha@example.rw", "professional", "active", -280, -1, "Kigali", "#365aa8", 5, { linkedWorkerId: "wk_kevin" }),
  U("pu_diane", "Diane Mukamana", "diane@ikaze.rw", "organizer", "active", -210, 0, "Kigali", "#001b56", 0, { linkedEmployerId: "emp_ikaze" }),
  U("pu_bruce", "Bruce Mugisha", "bruce@isongalive.rw", "organizer", "active", -180, 0, "Kigali", "#7a1fa2", 0, { linkedEmployerId: "emp_isonga" }),
  U("pu_immaculee", "Immaculée Nyiransabimana", "programmes@urukundo.rw", "organizer", "active", -240, -1, "Nyanza", "#8f6400", 0, { linkedEmployerId: "emp_urukundo" }),
  U("pu_thierry", "Thierry Rwigema", "thierry@ubuzimaoutdoor.rw", "organizer", "pending", -21, 0, "Musanze", "#116a3e", 0, { linkedEmployerId: "emp_ubuzima" }),
  U("pu_aimee", "Aimée Kayitesi", "hello@ejofood.rw", "organizer", "pending", -14, 0, "Kigali", "#b83527", 0, { linkedEmployerId: "emp_ejo" }),
  U("pu_patrick", "Patrick Nsengimana", "patrick@gigsyc.rw", "admin", "active", -365, 0, "Kigali", "#001b56", 0),
  U("pu_grace", "Grace Ingabire", "grace@gigsyc.rw", "admin", "active", -220, 0, "Kigali", "#17336b", 0),
];

export const DEMO_CUSTOMER_ID = "pu_chantal";
export const DEMO_ADMIN_ID = "pu_patrick";

export const REPORTS: Report[] = [
  {
    id: "rp_1", kind: "event", targetId: "ev_cryptoseminar", targetLabel: "Crypto Wealth Seminar",
    reason: "Misleading financial claims",
    detail: "Listing promises guaranteed monthly returns and hides the venue until payment. Two customers asked for refunds before we pulled it.",
    reportedByName: "Alice Mutoni", createdAt: isoOffset(-9, 13), status: "resolved", severity: "high",
    resolution: "Listing rejected and the organiser was warned.", resolvedAt: isoOffset(-8, 9),
  },
  {
    id: "rp_2", kind: "event", targetId: "ev_afrobeat", targetLabel: "Nyundo Sounds: Afrobeat Night",
    reason: "Capacity concern",
    detail: "Attendee says the floor was well past comfortable at midnight and the second fire exit was blocked by a stall.",
    reportedByName: "Eric Mugabo", createdAt: isoOffset(-2, 23), status: "open", severity: "high",
  },
  {
    id: "rp_3", kind: "organizer", targetId: "emp_ejo", targetLabel: "Ejo Food Collective",
    reason: "Unverified organiser taking payments",
    detail: "Organiser is still pending verification but has a paid listing live. Customer wants to know who they are paying.",
    reportedByName: "Nadia Umulisa", createdAt: isoOffset(-1, 10), status: "open", severity: "medium",
  },
  {
    id: "rp_4", kind: "event", targetId: "ev_rooftop", targetLabel: "Rooftop Sundowner Sessions",
    reason: "Wrong start time",
    detail: "Listing says doors at 17:00 but the venue did not open until 18:30 on the last two dates.",
    reportedByName: "Sylvie Mukandayisenga", createdAt: isoOffset(-3, 20), status: "open", severity: "low",
  },
  {
    id: "rp_5", kind: "profile", targetId: "pu_bosco", targetLabel: "Bosco Nkurunziza",
    reason: "Ticket resale spam",
    detail: "Account is posting resale offers in the comments of several events at inflated prices.",
    reportedByName: "Chantal Iradukunda", createdAt: isoOffset(-5, 16), status: "resolved", severity: "medium",
    resolution: "Account suspended pending appeal.", resolvedAt: isoOffset(-4, 11),
  },
  {
    id: "rp_6", kind: "review", targetId: "ev_foodwalk", targetLabel: "Kimironko Market Food Walk",
    reason: "Suspected fake review",
    detail: "Five-star review posted by an account created the same hour, with wording copied from the listing.",
    reportedByName: "Jean de Dieu Habimana", createdAt: isoOffset(-6, 12), status: "dismissed", severity: "low",
    resolution: "Reviewer confirmed as a genuine attendee. No action taken.", resolvedAt: isoOffset(-5, 15),
  },
  {
    id: "rp_7", kind: "event", targetId: "ev_nightcycle", targetLabel: "Night Cycling Kigali",
    reason: "Safety plan missing",
    detail: "Route uses the ring road after dark. No marshal plan or ambulance cover listed in the submission.",
    reportedByName: "Grace Ingabire", createdAt: isoOffset(-1, 9), status: "open", severity: "medium",
  },
];

export const SYSTEM_SERVICES: SystemService[] = [
  { id: "sv_web", name: "Website", description: "Public site and event discovery", status: "operational", uptime: 99.98, latencyMs: 184 },
  { id: "sv_search", name: "Search", description: "Event and destination search index", status: "operational", uptime: 99.91, latencyMs: 212 },
  { id: "sv_media", name: "Media", description: "Image upload, processing and delivery", status: "operational", uptime: 99.95, latencyMs: 96 },
  {
    id: "sv_notifications", name: "Notifications", description: "Email, SMS and push delivery",
    status: "degraded", uptime: 97.42, latencyMs: 1840,
    note: "SMS delivery to one mobile network is queueing. Email and push are unaffected.",
    lastIncidentAt: isoOffset(0, 11, 20),
  },
  { id: "sv_analytics", name: "Analytics", description: "Reporting pipeline and dashboards", status: "operational", uptime: 99.87, latencyMs: 340 },
  { id: "sv_payments", name: "Payments", description: "Mobile money and card settlement", status: "operational", uptime: 99.99, latencyMs: 420 },
];
