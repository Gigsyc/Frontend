import type { Shift } from "@/types";
import { IMAGES } from "../images";
import { dayOffset, isoOffset } from "./dates";

type ShiftSeed = Omit<Shift, "createdAt" | "sector" | "coverImage" | "breakMinutes" | "mealProvided" | "checkInMethod" | "supervisor"> &
  Partial<Pick<Shift, "createdAt" | "coverImage" | "breakMinutes" | "mealProvided" | "checkInMethod" | "supervisor" | "sector">>;

const SUPERVISORS: Record<string, Shift["supervisor"]> = {
  emp_ikaze: { name: "Diane Mukamana", phone: "+250 788 300 214" },
  emp_akagera: { name: "Eric Niyonzima", phone: "+250 788 411 900" },
  emp_imbuto: { name: "Sandrine Umutoni", phone: "+250 789 223 118" },
  emp_bold: { name: "Patrick Habimana", phone: "+250 788 672 340" },
  emp_isoko: { name: "Grace Mukamana", phone: "+250 788 110 553" },
  emp_umuganda: { name: "Josiane Uwimana", phone: "+250 788 905 771" },
  emp_kivu: { name: "Yves Kalisa", phone: "+250 788 555 231" },
  emp_intego: { name: "Emmanuel Rukundo", phone: "+250 788 777 101" },
};

const SECTOR_BY_EMPLOYER: Record<string, Shift["sector"]> = {
  emp_ikaze: "hospitality", emp_akagera: "events", emp_imbuto: "events", emp_bold: "marketing",
  emp_isoko: "retail_logistics", emp_umuganda: "corporate", emp_kivu: "hospitality", emp_intego: "events",
};

const COVER_BY_ROLE: Record<Shift["role"], string> = {
  usher: IMAGES.conferenceAudience, registration: IMAGES.conferenceHall, waiter: IMAGES.catering,
  bartender: IMAGES.cocktails, host: IMAGES.eventDecor, barista: IMAGES.cafe, promoter: IMAGES.retailStore,
  data_collector: IMAGES.tabletWork, receptionist: IMAGES.hotelReception, setup_crew: IMAGES.exhibition,
  warehouse: IMAGES.warehouse, retail: IMAGES.retailStore, steward: IMAGES.basketball, av_support: IMAGES.presentation,
};

const seeds: ShiftSeed[] = [
  // ——— Ikaze Hospitality Group (demo employer) ———
  {
    id: "sh_ikaze_gala", employerId: "emp_ikaze", title: "Banquet servers · Rwanda Bankers' Gala Dinner", role: "waiter",
    description: "Formal plated dinner for 320 guests in the Umucyo Banquet Hall. Three-course silver service with a welcome cocktail hour. You'll be assigned 2–3 tables with a section lead.",
    responsibilities: ["Welcome-drink tray service during cocktail hour", "Plated service for assigned tables (3 courses)", "Wine and water top-ups", "Clear and reset between courses", "Assist with pack-down until 23:30"],
    requirements: ["Previous banquet or restaurant service", "Black trousers, black closed shoes", "Comfortable standing 7+ hours", "English or French for guest interaction"],
    dressCode: "Black trousers, black closed shoes. White shirt and apron provided.",
    venue: "Umucyo Banquet Hall, Ikaze Kimihurura", district: "Kimihurura", address: "KG 7 Ave, Kimihurura",
    date: dayOffset(5), startTime: "16:00", endTime: "23:30", workersNeeded: 18, payPerShift: 25000, transportAllowance: 3000,
    status: "open", urgent: false, createdAt: isoOffset(-3, 10),
  },
  {
    id: "sh_ikaze_reg", employerId: "emp_ikaze", title: "Registration desk · East Africa Health Forum (Day 1)", role: "registration",
    description: "Delegate registration for a two-day forum with ~600 attendees. Badge printing, QR scanning and directing delegates to the plenary.",
    responsibilities: ["Check delegates in against the registration list", "Print and hand out badges", "Manage the on-site registration queue", "Direct delegates to sessions and breakout rooms"],
    requirements: ["Experience with conference registration", "Confident with laptops and badge printers", "Fluent English; French a plus", "Smart business attire"],
    dressCode: "Business attire, dark colours.",
    venue: "Ikaze Conference Wing", district: "Kimihurura", address: "KG 7 Ave, Kimihurura",
    date: dayOffset(2), startTime: "06:30", endTime: "14:00", workersNeeded: 6, payPerShift: 28000,
    status: "open", urgent: true, createdAt: isoOffset(-1, 15),
  },
  {
    id: "sh_ikaze_reg2", employerId: "emp_ikaze", title: "Registration desk · East Africa Health Forum (Day 2)", role: "registration",
    description: "Day two of the forum. Lighter check-in, more wayfinding and session-room support.",
    responsibilities: ["Late registrations and badge reprints", "Session-room door management", "Delegate queries"],
    requirements: ["Experience with conference registration", "Fluent English", "Smart business attire"],
    dressCode: "Business attire, dark colours.",
    venue: "Ikaze Conference Wing", district: "Kimihurura", address: "KG 7 Ave, Kimihurura",
    date: dayOffset(3), startTime: "07:00", endTime: "13:00", workersNeeded: 4, payPerShift: 24000,
    status: "open", urgent: false, createdAt: isoOffset(-1, 15),
  },
  {
    id: "sh_ikaze_brunch", employerId: "emp_ikaze", title: "Sunday brunch service", role: "waiter",
    description: "Buffet brunch for hotel guests and walk-ins, 180–220 covers. Buffet replenishment, table clearing, drinks orders.",
    responsibilities: ["Buffet line upkeep", "Table clearing and resetting", "Drinks orders to the bar"],
    requirements: ["Restaurant experience", "Black trousers, black shoes"],
    venue: "Ikaze Kimihurura · Inzozi Restaurant", district: "Kimihurura", address: "KG 7 Ave, Kimihurura",
    date: dayOffset(0), startTime: "09:00", endTime: "15:00", workersNeeded: 6, payPerShift: 18000, mealProvided: true,
    status: "in_progress", urgent: false, createdAt: isoOffset(-6, 9),
  },
  {
    id: "sh_ikaze_hosts", employerId: "emp_ikaze", title: "Hosts · Chamber of Commerce Awards Night", role: "host",
    description: "Front-of-house hosts for an awards ceremony. Guest welcome, seating by table plan, VIP escort.",
    responsibilities: ["Welcome guests and check names", "Escort VIPs to reserved seating", "Coordinate with the MC on run-of-show timing"],
    requirements: ["Protocol or hosting experience", "Trilingual preferred", "Formal evening wear (black)"],
    dressCode: "Formal black evening wear.",
    venue: "Umucyo Banquet Hall", district: "Kimihurura", address: "KG 7 Ave, Kimihurura",
    date: dayOffset(9), startTime: "17:00", endTime: "23:00", workersNeeded: 4, payPerShift: 35000,
    status: "filled", urgent: false, createdAt: isoOffset(-8, 11),
  },
  {
    id: "sh_ikaze_wedding_past", employerId: "emp_ikaze", title: "Wedding banquet servers", role: "waiter",
    description: "Plated wedding dinner for 250 guests.",
    responsibilities: ["Plated service", "Clearing", "Pack-down"], requirements: ["Banquet experience"],
    venue: "Umucyo Banquet Hall", district: "Kimihurura", address: "KG 7 Ave, Kimihurura",
    date: dayOffset(-9), startTime: "15:00", endTime: "22:00", workersNeeded: 14, payPerShift: 25000,
    status: "completed", urgent: false, createdAt: isoOffset(-18, 10),
  },
  {
    id: "sh_ikaze_conf_past", employerId: "emp_ikaze", title: "Conference ushers · Insurance Leaders Summit", role: "usher",
    description: "Ushering and room support for a one-day summit.",
    responsibilities: ["Door management", "Seating", "Mic running during Q&A"], requirements: ["Event experience"],
    venue: "Ikaze Conference Wing", district: "Kimihurura", address: "KG 7 Ave, Kimihurura",
    date: dayOffset(-16), startTime: "07:00", endTime: "17:30", workersNeeded: 8, payPerShift: 22000,
    status: "completed", urgent: false, createdAt: isoOffset(-25, 10),
  },
  {
    id: "sh_ikaze_draft", employerId: "emp_ikaze", title: "Pool bar bartenders · Kwita Izina weekend", role: "bartender",
    description: "Pool bar cover during the gorilla-naming weekend surge.",
    responsibilities: ["Cocktail and beer service", "Stock and cash handling"], requirements: ["Bartending experience"],
    venue: "Ikaze Nyarutarama · Pool Bar", district: "Nyarutarama", address: "KG 9 Ave, Nyarutarama",
    date: dayOffset(19), startTime: "12:00", endTime: "20:00", workersNeeded: 3, payPerShift: 30000,
    status: "draft", urgent: false, createdAt: isoOffset(0, 8),
  },

  // ——— Akagera Conference Centre ———
  {
    id: "sh_akagera_ushers", employerId: "emp_akagera", title: "Ushers · Kigali Fintech Summit", role: "usher",
    description: "Plenary and breakout ushering for 1,800 delegates across two halls.",
    responsibilities: ["Hall entrances and seating", "Session changeovers", "Mic running", "Delegate wayfinding"],
    requirements: ["Large-event experience", "Comfortable on your feet all day", "English required"],
    dressCode: "Black trousers, white shirt. Branded sash provided.",
    venue: "Akagera Conference Centre · Main Hall", district: "Rusororo", address: "KK 15 Rd, Rusororo",
    date: dayOffset(7), startTime: "07:00", endTime: "18:00", workersNeeded: 24, payPerShift: 22000, mealProvided: true, transportAllowance: 4000,
    status: "open", urgent: false, createdAt: isoOffset(-4, 9),
  },
  {
    id: "sh_akagera_av", employerId: "emp_akagera", title: "AV support · breakout rooms", role: "av_support",
    description: "Support 6 breakout rooms: mics, clickers, laptop hand-offs, hybrid Zoom links.",
    responsibilities: ["Sound checks before each session", "Speaker laptop connections", "Hybrid link monitoring"],
    requirements: ["AV or IT support experience", "Familiar with Zoom/Teams rooms"],
    venue: "Akagera Conference Centre", district: "Rusororo", address: "KK 15 Rd, Rusororo",
    date: dayOffset(7), startTime: "06:30", endTime: "18:30", workersNeeded: 4, payPerShift: 40000, mealProvided: true,
    status: "open", urgent: true, createdAt: isoOffset(-2, 16),
  },
  {
    id: "sh_akagera_setup", employerId: "emp_akagera", title: "Setup crew · Made in Rwanda Expo build", role: "setup_crew",
    description: "Two-day build of 140 exhibition stands. Carrying, assembling shell scheme, signage and furniture placement.",
    responsibilities: ["Unload and move stand materials", "Assemble shell-scheme panels under crew lead", "Furniture and signage placement"],
    requirements: ["Physically fit", "Closed-toe boots", "Follow safety briefings"],
    venue: "Akagera Exhibition Hall", district: "Rusororo", address: "KK 15 Rd, Rusororo",
    date: dayOffset(12), startTime: "07:00", endTime: "17:00", workersNeeded: 30, payPerShift: 18000, mealProvided: true, transportAllowance: 3000,
    status: "open", urgent: false, createdAt: isoOffset(-5, 12),
  },
  {
    id: "sh_akagera_past", employerId: "emp_akagera", title: "Registration · Fintech Summit pre-registration day", role: "registration",
    description: "Early badge collection for delegates.",
    responsibilities: ["Badge collection", "Queue management"], requirements: ["Registration experience"],
    venue: "Akagera Conference Centre", district: "Rusororo", address: "KK 15 Rd, Rusororo",
    date: dayOffset(-16), startTime: "08:00", endTime: "17:00", workersNeeded: 10, payPerShift: 26000,
    status: "completed", urgent: false, createdAt: isoOffset(-26, 9),
  },

  // ——— Imbuto Events ———
  {
    id: "sh_imbuto_launch", employerId: "emp_imbuto", title: "Hosts & promoters · Bank Kigali app launch", role: "host",
    description: "Evening launch event for 400 guests. Guest welcome, demo-station hosting and product walk-throughs after a 30-minute briefing.",
    responsibilities: ["Guest welcome and wayfinding", "Host a demo station and walk guests through the app", "Capture sign-ups on tablets"],
    requirements: ["Confident presenter", "Comfortable with tablets", "English and Kinyarwanda"],
    dressCode: "Smart casual in navy; branded T-shirt provided.",
    venue: "Kigali Heights Rooftop", district: "Kacyiru", address: "KG 7 Ave, Kacyiru",
    date: dayOffset(4), startTime: "15:00", endTime: "22:00", workersNeeded: 10, payPerShift: 30000, mealProvided: true,
    status: "open", urgent: false, createdAt: isoOffset(-3, 14),
  },
  {
    id: "sh_imbuto_gala_bar", employerId: "emp_imbuto", title: "Bartenders · NGO fundraising gala", role: "bartender",
    description: "Two bars for 300 guests. Signature cocktail, wine and soft drinks.",
    responsibilities: ["Cocktail and wine service", "Bar setup and breakdown", "Stock counts with the bar lead"],
    requirements: ["Bartending experience", "Responsible service"],
    venue: "Serene Gardens, Nyarutarama", district: "Nyarutarama", address: "KG 11 Ave, Nyarutarama",
    date: dayOffset(6), startTime: "16:00", endTime: "00:00", workersNeeded: 6, payPerShift: 32000, transportAllowance: 5000,
    status: "open", urgent: false, createdAt: isoOffset(-2, 10),
  },
  {
    id: "sh_imbuto_past", employerId: "emp_imbuto", title: "Product launch hosting", role: "host",
    description: "Launch event hosting.", responsibilities: ["Welcome", "Demo stations"], requirements: ["Hosting experience"],
    venue: "Norrsken House Kigali", district: "Kiyovu", address: "KN 78 St, Kiyovu",
    date: dayOffset(-23), startTime: "17:00", endTime: "22:00", workersNeeded: 6, payPerShift: 30000,
    status: "completed", urgent: false, createdAt: isoOffset(-30, 9),
  },

  // ——— Bold Activations ———
  {
    id: "sh_bold_mall", employerId: "emp_bold", title: "Brand promoters · beverage sampling, Kigali Heights", role: "promoter",
    description: "Weekend sampling activation for a new beverage. Approach shoppers, offer samples, record feedback on a tablet.",
    responsibilities: ["Sampling and short product pitch", "Capture consumer feedback", "Keep the stand tidy and stocked"],
    requirements: ["Outgoing and confident", "Previous activation experience preferred", "Kinyarwanda and English"],
    dressCode: "Branded T-shirt and cap provided; dark jeans, clean white sneakers.",
    venue: "Kigali Heights · Ground floor atrium", district: "Kacyiru", address: "KG 7 Ave, Kacyiru",
    date: dayOffset(6), startTime: "10:00", endTime: "18:00", workersNeeded: 8, payPerShift: 20000, mealProvided: true,
    status: "open", urgent: false, createdAt: isoOffset(-4, 11),
  },
  {
    id: "sh_bold_campus", employerId: "emp_bold", title: "Campus roadshow promoters · telecom SIM activation", role: "promoter",
    description: "Three-day campus roadshow. Registrations, SIM activations and giveaways at University of Rwanda Gikondo campus.",
    responsibilities: ["Engage students and explain the offer", "Complete SIM registrations on the app", "Hit daily activation targets"],
    requirements: ["Sales or promo experience", "Target-driven", "Smartphone-literate"],
    venue: "UR Gikondo Campus", district: "Gikondo", address: "KK 737 St, Gikondo",
    date: dayOffset(10), startTime: "09:00", endTime: "17:00", workersNeeded: 12, payPerShift: 18000, transportAllowance: 2000,
    status: "open", urgent: false, createdAt: isoOffset(-1, 9),
  },

  // ——— Isoko Retail ———
  {
    id: "sh_isoko_stock", employerId: "emp_isoko", title: "Stock-take assistants · month-end count", role: "warehouse",
    description: "Overnight month-end stock count at the Gikondo distribution store. Scanning, counting and reconciliation with the store team.",
    responsibilities: ["Scan and count assigned aisles", "Flag discrepancies to the supervisor", "Re-shelve after counting"],
    requirements: ["Attention to detail", "Comfortable with handheld scanners", "Closed shoes"],
    venue: "Isoko Distribution Store", district: "Gikondo", address: "KK 15 Ave, Gikondo",
    date: dayOffset(17), startTime: "20:00", endTime: "04:00", workersNeeded: 10, payPerShift: 20000, mealProvided: true, transportAllowance: 5000,
    status: "open", urgent: false, createdAt: isoOffset(-2, 13),
  },
  {
    id: "sh_isoko_floor", employerId: "emp_isoko", title: "Retail assistants · payday promotion weekend", role: "retail",
    description: "Extra floor staff for the promotion weekend at Kigali Heights store. Greeting, merchandising and till support.",
    responsibilities: ["Greet and assist customers", "Restock promo displays", "Support the till during peaks"],
    requirements: ["Retail or customer service experience", "Friendly and presentable"],
    venue: "Isoko · Kigali Heights", district: "Kacyiru", address: "KG 7 Ave, Kacyiru",
    date: dayOffset(13), startTime: "09:30", endTime: "18:30", workersNeeded: 5, payPerShift: 16000,
    status: "open", urgent: false, createdAt: isoOffset(-1, 12),
  },

  // ——— Umuganda Research ———
  {
    id: "sh_umuganda_survey", employerId: "emp_umuganda", title: "Field enumerators · household survey, Gasabo", role: "data_collector",
    description: "Day 1 of a 5-day household survey. Tablet-based questionnaire (Kobo). Full-day training is paid separately the day before.",
    responsibilities: ["Administer a 40-minute questionnaire", "Follow consent protocol", "Sync data at end of day"],
    requirements: ["Previous survey experience", "Kinyarwanda essential", "Own smartphone with data"],
    venue: "Gasabo District (Kimironko & Kibagabaga sectors)", district: "Kimironko", address: "Field · meeting point Kimironko market",
    date: dayOffset(8), startTime: "08:00", endTime: "17:00", workersNeeded: 15, payPerShift: 25000, transportAllowance: 5000,
    status: "open", urgent: false, createdAt: isoOffset(-3, 9),
  },

  // ——— Kivu Coffee House ———
  {
    id: "sh_kivu_barista", employerId: "emp_kivu", title: "Barista · weekend brunch cover", role: "barista",
    description: "Cover our Nyarutarama bar during Saturday brunch. Espresso, pour-over and iced drinks.",
    responsibilities: ["Espresso-based drinks to spec", "Keep the bar stocked and clean"],
    requirements: ["Barista experience", "Latte art a plus"],
    venue: "Kivu Coffee House Nyarutarama", district: "Nyarutarama", address: "KG 9 Ave, Nyarutarama",
    date: dayOffset(6), startTime: "07:00", endTime: "14:00", workersNeeded: 2, payPerShift: 18000, mealProvided: true,
    status: "open", urgent: false, createdAt: isoOffset(-1, 18),
  },

  // ——— Intego Sports ———
  {
    id: "sh_intego_stewards", employerId: "emp_intego", title: "Crowd stewards · BK Arena league night", role: "steward",
    description: "Stewarding for a 9,000-capacity basketball night. Access control support, aisle management, guest safety.",
    responsibilities: ["Check tickets at section entrances", "Keep aisles and exits clear", "Escalate incidents to security"],
    requirements: ["Stewarding or security-adjacent experience", "Calm under pressure", "Available until 23:30"],
    dressCode: "Black trousers, black shoes. Hi-vis vest provided.",
    venue: "BK Arena", district: "Remera", address: "KG 17 Ave, Remera",
    date: dayOffset(1), startTime: "16:00", endTime: "23:30", workersNeeded: 40, payPerShift: 20000, transportAllowance: 3000,
    status: "open", urgent: true, createdAt: isoOffset(-2, 17),
  },
  {
    id: "sh_intego_ushers", employerId: "emp_intego", title: "Ushers · Kigali Jazz Night", role: "usher",
    description: "Seated concert for 2,500. Ticket scanning at entrances, seating and guest queries.",
    responsibilities: ["Scan tickets", "Seat guests by section", "Guest queries"],
    requirements: ["Event experience", "Smartphone-literate"],
    venue: "Kigali Arena Grounds", district: "Remera", address: "KG 17 Ave, Remera",
    date: dayOffset(14), startTime: "15:00", endTime: "23:00", workersNeeded: 25, payPerShift: 18000, transportAllowance: 3000,
    status: "open", urgent: false, createdAt: isoOffset(-6, 10),
  },
  {
    id: "sh_intego_past", employerId: "emp_intego", title: "League night ushering", role: "usher",
    description: "Ushering for league night.", responsibilities: ["Seating", "Tickets"], requirements: ["Event experience"],
    venue: "BK Arena", district: "Remera", address: "KG 17 Ave, Remera",
    date: dayOffset(-44), startTime: "16:00", endTime: "22:30", workersNeeded: 30, payPerShift: 18000,
    status: "completed", urgent: false, createdAt: isoOffset(-50, 10),
  },
];

export const SHIFTS: Shift[] = seeds.map((s) => ({
  ...s,
  sector: s.sector ?? SECTOR_BY_EMPLOYER[s.employerId],
  coverImage: s.coverImage ?? COVER_BY_ROLE[s.role],
  breakMinutes: s.breakMinutes ?? 30,
  mealProvided: s.mealProvided ?? false,
  checkInMethod: s.checkInMethod ?? "qr",
  supervisor: s.supervisor ?? SUPERVISORS[s.employerId],
  createdAt: s.createdAt ?? isoOffset(-2),
}));
