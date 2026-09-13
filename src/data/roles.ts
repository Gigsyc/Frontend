import type { RoleCategory, Sector, KigaliDistrict, Language } from "@/types";

export interface RoleMeta {
  id: RoleCategory;
  label: string;
  short: string;
  sector: Sector;
  description: string;
  /** Typical flat pay per shift in RWF, used for defaults and validation hints */
  typicalPay: [number, number];
  /** lucide icon name, resolved in the UI layer */
  icon: string;
}

export const ROLES: Record<RoleCategory, RoleMeta> = {
  usher: {
    id: "usher", label: "Event usher", short: "Usher", sector: "events",
    description: "Guide guests, manage seating and entrances, answer questions.",
    typicalPay: [15000, 25000], icon: "Signpost",
  },
  registration: {
    id: "registration", label: "Registration desk", short: "Registration", sector: "events",
    description: "Check in delegates, print badges, handle queries at the front of house.",
    typicalPay: [18000, 30000], icon: "ClipboardCheck",
  },
  waiter: {
    id: "waiter", label: "Waiter / server", short: "Server", sector: "hospitality",
    description: "Table and banquet service, tray service, clearing and resetting.",
    typicalPay: [15000, 30000], icon: "UtensilsCrossed",
  },
  bartender: {
    id: "bartender", label: "Bartender", short: "Bartender", sector: "hospitality",
    description: "Prepare and serve drinks, manage bar stock, keep the bar presentable.",
    typicalPay: [20000, 35000], icon: "Wine",
  },
  host: {
    id: "host", label: "Host / hostess", short: "Host", sector: "hospitality",
    description: "Welcome guests, manage reservations and protocol seating.",
    typicalPay: [20000, 40000], icon: "HandHeart",
  },
  barista: {
    id: "barista", label: "Barista", short: "Barista", sector: "hospitality",
    description: "Espresso-based drinks, coffee bar service, station cleanliness.",
    typicalPay: [15000, 25000], icon: "Coffee",
  },
  promoter: {
    id: "promoter", label: "Brand promoter", short: "Promoter", sector: "marketing",
    description: "Represent a brand at activations, sampling and product launches.",
    typicalPay: [15000, 30000], icon: "Megaphone",
  },
  data_collector: {
    id: "data_collector", label: "Field data collector", short: "Data collector", sector: "corporate",
    description: "Run surveys and structured interviews on tablet or paper, in the field.",
    typicalPay: [18000, 30000], icon: "ClipboardList",
  },
  receptionist: {
    id: "receptionist", label: "Front desk / reception", short: "Front desk", sector: "corporate",
    description: "Reception cover, visitor management, calls and basic admin.",
    typicalPay: [18000, 30000], icon: "BellRing",
  },
  setup_crew: {
    id: "setup_crew", label: "Setup & logistics crew", short: "Setup crew", sector: "events",
    description: "Load-in, staging, seating, signage and teardown.",
    typicalPay: [15000, 25000], icon: "Hammer",
  },
  warehouse: {
    id: "warehouse", label: "Warehouse assistant", short: "Warehouse", sector: "retail_logistics",
    description: "Receiving, picking and packing, stock counts, loading.",
    typicalPay: [12000, 20000], icon: "Boxes",
  },
  retail: {
    id: "retail", label: "Retail assistant", short: "Retail", sector: "retail_logistics",
    description: "Shop floor support, merchandising, customer help and till cover.",
    typicalPay: [12000, 20000], icon: "ShoppingBag",
  },
  steward: {
    id: "steward", label: "Crowd steward", short: "Steward", sector: "events",
    description: "Crowd flow, access control support and guest safety at large events.",
    typicalPay: [15000, 25000], icon: "ShieldCheck",
  },
  av_support: {
    id: "av_support", label: "AV & tech support", short: "AV support", sector: "events",
    description: "Mics, projectors, laptops and hybrid-meeting support for sessions.",
    typicalPay: [25000, 45000], icon: "MonitorSpeaker",
  },
};

export const ROLE_LIST = Object.values(ROLES);

export const SECTORS: Record<Sector, { label: string; description: string }> = {
  hospitality: { label: "Hospitality", description: "Hotels, restaurants, catering, conference venues" },
  events: { label: "Events & MICE", description: "Conferences, exhibitions, concerts, sports" },
  marketing: { label: "Marketing & activations", description: "Brand activations, launches, sampling" },
  corporate: { label: "Corporate services", description: "Reception, admin, data collection, call centres" },
  retail_logistics: { label: "Retail & logistics", description: "Shop floor, warehousing, distribution" },
};

export const DISTRICTS: KigaliDistrict[] = [
  "Kimihurura", "Nyarutarama", "Kacyiru", "Remera", "Gikondo", "Kiyovu", "Nyarugenge",
  "Gisozi", "Kimironko", "Kanombe", "Rusororo", "Kibagabaga", "Gacuriro",
];

export const LANGUAGES: Language[] = ["Kinyarwanda", "English", "French", "Swahili"];

/** Platform commission applied on top of worker pay for employer invoices. */
export const SERVICE_FEE_RATE = 0.18;
