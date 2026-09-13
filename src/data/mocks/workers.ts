import type { KigaliDistrict, Language, RoleCategory, VerificationKey, Worker, WorkHistoryItem } from "@/types";
import { dayOffset } from "./dates";

const AVATAR_COLORS = ["#001b56", "#17336b", "#0096b5", "#b88200", "#116a3e", "#932a1f", "#4d5567", "#365aa8", "#8f6400", "#007a94"];

interface Seed {
  id: string;
  first: string;
  last: string;
  headline: string;
  bio: string;
  district: KigaliDistrict;
  skills: RoleCategory[];
  languages: Language[];
  rating: number;
  ratingCount: number;
  reliability: number;
  completed: number;
  noShows?: number;
  joinedDaysAgo: number;
  verifications?: Partial<Record<VerificationKey, boolean>>;
  education?: string;
  certifications?: string[];
  availability?: Partial<Worker["availability"]>;
  minShiftPay?: number;
}

const ALL_VERIFIED: Record<VerificationKey, boolean> = { identity: true, phone: true, photo: true, references: true, skills: true };

const SEEDS: Seed[] = [
  {
    id: "wk_aline", first: "Aline", last: "Uwase",
    headline: "Hospitality student · banquet service & registration",
    bio: "Final-year Hospitality Management student at University of Rwanda. I've worked 40+ banquets and conference days around Kimihurura and I'm comfortable with formal service, delegate check-in and guest queries in three languages.",
    district: "Remera", skills: ["waiter", "registration", "host", "usher"], languages: ["Kinyarwanda", "English", "French"],
    rating: 4.9, ratingCount: 38, reliability: 98, completed: 42, joinedDaysAgo: 190,
    education: "BSc Hospitality Management, University of Rwanda (2026)",
    certifications: ["Food Safety Level 1", "GigSyc Hospitality Excellence"],
    availability: { weekdays: true, weekends: true, evenings: true, overnight: false }, minShiftPay: 18000,
  },
  { id: "wk_kevin", first: "Kevin", last: "Mugisha", headline: "Bartender & barista · 5 yrs hotel bars", bio: "Trained at Serena's bar academy programme, then three years across hotel bars and pop-up events. Fast, tidy and calm under a rush.", district: "Kimihurura", skills: ["bartender", "barista", "waiter"], languages: ["Kinyarwanda", "English"], rating: 4.8, ratingCount: 61, reliability: 96, completed: 67, joinedDaysAgo: 280, certifications: ["Responsible Alcohol Service"] },
  { id: "wk_divine", first: "Divine", last: "Iradukunda", headline: "Registration & protocol · conference specialist", bio: "I've run registration desks for summits with 1,000+ delegates. Badge printing systems, VIP protocol and multilingual welcome.", district: "Kacyiru", skills: ["registration", "host", "usher"], languages: ["Kinyarwanda", "English", "French", "Swahili"], rating: 5, ratingCount: 44, reliability: 100, completed: 51, joinedDaysAgo: 300, education: "BA International Relations, University of Kigali" },
  { id: "wk_eric", first: "Eric", last: "Nshimiyimana", headline: "Setup crew lead · staging and AV", bio: "Ex-venue technician. I lead load-ins, stage builds and basic AV. Own toolkit and safety boots.", district: "Gikondo", skills: ["setup_crew", "av_support", "steward"], languages: ["Kinyarwanda", "English"], rating: 4.7, ratingCount: 52, reliability: 94, completed: 73, noShows: 1, joinedDaysAgo: 340, certifications: ["Manual Handling", "Working at Height"] },
  { id: "wk_claudine", first: "Claudine", last: "Ingabire", headline: "Brand promoter · FMCG & telecom activations", bio: "Confident, outgoing, and good with scripts. I've done sampling and roadshow activations for beverage and telecom brands across Kigali malls and campuses.", district: "Kimironko", skills: ["promoter", "retail", "host"], languages: ["Kinyarwanda", "English"], rating: 4.6, ratingCount: 29, reliability: 92, completed: 33, joinedDaysAgo: 120 },
  { id: "wk_patrick", first: "Patrick", last: "Byiringiro", headline: "Field enumerator · household & market surveys", bio: "Statistics graduate with ODK/KoboToolbox experience. Comfortable in rural and urban field settings, motorbike licence.", district: "Gisozi", skills: ["data_collector", "registration"], languages: ["Kinyarwanda", "English", "French"], rating: 4.9, ratingCount: 21, reliability: 100, completed: 24, joinedDaysAgo: 160, education: "BSc Applied Statistics, University of Rwanda" },
  { id: "wk_grace", first: "Grace", last: "Mukamana", headline: "Front desk & guest relations", bio: "Two years hotel reception. Opera PMS, phone etiquette, calm with difficult guests.", district: "Nyarutarama", skills: ["receptionist", "host", "registration"], languages: ["Kinyarwanda", "English", "French"], rating: 4.8, ratingCount: 35, reliability: 97, completed: 39, joinedDaysAgo: 220 },
  { id: "wk_samuel", first: "Samuel", last: "Tuyishime", headline: "Warehouse & stock assistant", bio: "Reliable for receiving, counts and loading. Forklift-adjacent experience (pallet jack). Available early mornings.", district: "Gikondo", skills: ["warehouse", "setup_crew", "retail"], languages: ["Kinyarwanda"], rating: 4.5, ratingCount: 18, reliability: 90, completed: 22, noShows: 1, joinedDaysAgo: 90, availability: { weekdays: true, weekends: false, evenings: false, overnight: true } },
  { id: "wk_sandrine", first: "Sandrine", last: "Keza", headline: "Hostess & VIP protocol", bio: "Protocol-trained host for galas, launches and diplomatic receptions.", district: "Kiyovu", skills: ["host", "usher", "registration"], languages: ["Kinyarwanda", "English", "French"], rating: 4.9, ratingCount: 47, reliability: 99, completed: 55, joinedDaysAgo: 310, certifications: ["Protocol & Etiquette (RDB)"] },
  { id: "wk_jeanpaul", first: "Jean Paul", last: "Habimana", headline: "Banquet server · fine dining", bio: "Silver-service trained. Weddings, state dinners and hotel banquets.", district: "Kimihurura", skills: ["waiter", "bartender", "host"], languages: ["Kinyarwanda", "English", "French"], rating: 4.7, ratingCount: 58, reliability: 95, completed: 64, noShows: 1, joinedDaysAgo: 330 },
  { id: "wk_vanessa", first: "Vanessa", last: "Ishimwe", headline: "Barista · latte art & speed", bio: "Three years specialty coffee. I can run a bar solo during a brunch rush.", district: "Nyarutarama", skills: ["barista", "waiter", "retail"], languages: ["Kinyarwanda", "English"], rating: 4.8, ratingCount: 26, reliability: 96, completed: 31, joinedDaysAgo: 140, certifications: ["SCA Barista Foundation"] },
  { id: "wk_fabrice", first: "Fabrice", last: "Nsengiyumva", headline: "Crowd steward · arena & stadium events", bio: "Steward for league nights and concerts. Calm, alert, good at access control.", district: "Remera", skills: ["steward", "usher", "setup_crew"], languages: ["Kinyarwanda", "English"], rating: 4.4, ratingCount: 40, reliability: 88, completed: 48, noShows: 2, joinedDaysAgo: 260 },
  { id: "wk_josiane", first: "Josiane", last: "Mukeshimana", headline: "Registration & admin support", bio: "Fast on Excel and check-in software. Reliable for multi-day conferences.", district: "Kacyiru", skills: ["registration", "receptionist", "data_collector"], languages: ["Kinyarwanda", "English"], rating: 4.7, ratingCount: 19, reliability: 97, completed: 21, joinedDaysAgo: 100 },
  { id: "wk_yves", first: "Yves", last: "Kalisa", headline: "AV technician · hybrid meetings", bio: "Zoom/Teams hybrid rooms, mics, projectors, clickers. Sound-check obsessive.", district: "Kibagabaga", skills: ["av_support", "setup_crew"], languages: ["Kinyarwanda", "English", "French"], rating: 4.9, ratingCount: 23, reliability: 100, completed: 27, joinedDaysAgo: 180, certifications: ["Dante Level 1"] },
  { id: "wk_ange", first: "Ange", last: "Uwimana", headline: "Retail assistant · visual merchandising", bio: "Home & lifestyle retail. Merchandising, till cover and stock room.", district: "Kimironko", skills: ["retail", "promoter", "warehouse"], languages: ["Kinyarwanda", "English"], rating: 4.6, ratingCount: 15, reliability: 93, completed: 17, joinedDaysAgo: 70 },
  { id: "wk_emmanuel", first: "Emmanuel", last: "Rukundo", headline: "Usher & guest services", bio: "Cheerful and organised. Concerts, conferences and graduation ceremonies.", district: "Kanombe", skills: ["usher", "steward", "registration"], languages: ["Kinyarwanda", "English", "Swahili"], rating: 4.5, ratingCount: 33, reliability: 91, completed: 36, noShows: 1, joinedDaysAgo: 200 },
  { id: "wk_liliane", first: "Liliane", last: "Nyirahabimana", headline: "Server & catering assistant", bio: "Outside catering: buffet lines, canapé service, clearing and packing down.", district: "Gisozi", skills: ["waiter", "setup_crew", "barista"], languages: ["Kinyarwanda", "French"], rating: 4.6, ratingCount: 24, reliability: 94, completed: 28, joinedDaysAgo: 130 },
  { id: "wk_olivier", first: "Olivier", last: "Manzi", headline: "Promoter & sales support", bio: "Telecom SIM activations and campus roadshows. Target-driven.", district: "Nyarugenge", skills: ["promoter", "retail", "usher"], languages: ["Kinyarwanda", "English"], rating: 4.3, ratingCount: 27, reliability: 87, completed: 30, noShows: 2, joinedDaysAgo: 150 },
  { id: "wk_clarisse", first: "Clarisse", last: "Umuhoza", headline: "Enumerator & data entry", bio: "Public health background. Household surveys, consent scripts, clean data.", district: "Kacyiru", skills: ["data_collector", "registration", "receptionist"], languages: ["Kinyarwanda", "English", "French"], rating: 4.8, ratingCount: 16, reliability: 98, completed: 18, joinedDaysAgo: 110, education: "BSc Public Health, Mount Kenya University Kigali" },
  { id: "wk_didier", first: "Didier", last: "Hakizimana", headline: "Bartender · cocktails & events", bio: "Mixology-focused. Weddings, launches and hotel pool bars.", district: "Kiyovu", skills: ["bartender", "waiter"], languages: ["Kinyarwanda", "English", "French"], rating: 4.7, ratingCount: 31, reliability: 95, completed: 34, joinedDaysAgo: 170 },
  { id: "wk_nadine", first: "Nadine", last: "Mutesi", headline: "Host & registration · trilingual", bio: "Warm welcome, sharp with names and seating plans.", district: "Gacuriro", skills: ["host", "registration", "usher"], languages: ["Kinyarwanda", "English", "French"], rating: 4.8, ratingCount: 22, reliability: 96, completed: 25, joinedDaysAgo: 95 },
  { id: "wk_thierry", first: "Thierry", last: "Ndayisaba", headline: "Setup crew & driver support", bio: "Load-in and teardown. Category B licence, own boots and gloves.", district: "Kanombe", skills: ["setup_crew", "warehouse", "steward"], languages: ["Kinyarwanda"], rating: 4.4, ratingCount: 20, reliability: 89, completed: 26, noShows: 1, joinedDaysAgo: 210 },
  { id: "wk_esther", first: "Esther", last: "Uwera", headline: "New to GigSyc · hospitality graduate", bio: "Recent graduate looking for first banquet and café shifts. Eager, punctual, quick learner.", district: "Remera", skills: ["waiter", "barista", "host"], languages: ["Kinyarwanda", "English"], rating: 0, ratingCount: 0, reliability: 100, completed: 0, joinedDaysAgo: 6, verifications: { identity: true, phone: true, photo: true, references: false, skills: false } },
  { id: "wk_moses", first: "Moses", last: "Gatera", headline: "Usher · student, weekends only", bio: "Second-year engineering student. Weekend ushering and stewarding.", district: "Gikondo", skills: ["usher", "steward"], languages: ["Kinyarwanda", "English"], rating: 4.2, ratingCount: 9, reliability: 85, completed: 11, noShows: 1, joinedDaysAgo: 80, verifications: { identity: true, phone: true, photo: true, references: false, skills: true }, availability: { weekdays: false, weekends: true, evenings: true, overnight: false } },
];

export const WORKERS: Worker[] = SEEDS.map((s, i) => ({
  id: s.id,
  firstName: s.first,
  lastName: s.last,
  headline: s.headline,
  bio: s.bio,
  district: s.district,
  skills: s.skills,
  languages: s.languages,
  rating: s.rating,
  ratingCount: s.ratingCount,
  reliability: s.reliability,
  completedShifts: s.completed,
  noShows: s.noShows ?? 0,
  verifications: { ...ALL_VERIFIED, ...(s.verifications ?? {}) },
  joinedAt: dayOffset(-s.joinedDaysAgo),
  avatarColor: AVATAR_COLORS[i % AVATAR_COLORS.length],
  availability: { weekdays: true, weekends: true, evenings: true, overnight: false, ...(s.availability ?? {}) },
  education: s.education,
  certifications: s.certifications ?? [],
  history: [],
  minShiftPay: s.minShiftPay,
}));

export const workerById = (id: string) => WORKERS.find((w) => w.id === id);

/** Verified work history for the demo worker persona; other workers get generated history in the store. */
export const ALINE_HISTORY: WorkHistoryItem[] = [
  { id: "wh_1", employerId: "emp_ikaze", role: "waiter", title: "Gala dinner service", date: dayOffset(-9), hours: 7, rating: 5, feedback: "Aline anchored the VIP table. Zero issues." },
  { id: "wh_2", employerId: "emp_akagera", role: "registration", title: "Fintech summit registration", date: dayOffset(-16), hours: 9, rating: 5, feedback: "Handled the 8am rush calmly." },
  { id: "wh_3", employerId: "emp_imbuto", role: "host", title: "Product launch hosting", date: dayOffset(-23), hours: 5, rating: 4.5 },
  { id: "wh_4", employerId: "emp_ikaze", role: "waiter", title: "Wedding banquet", date: dayOffset(-30), hours: 8, rating: 5, feedback: "Requested by name for the next one." },
  { id: "wk_5", employerId: "emp_intego", role: "usher", title: "League night ushering", date: dayOffset(-44), hours: 6, rating: 4.5 },
];
