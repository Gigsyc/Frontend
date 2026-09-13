import type { DiscoveryPreferenceId, EventCategory, InterestId, OrganizationType, UserRole } from "@/types";
import { IMAGES } from "./images";

export interface InterestMeta {
  id: InterestId;
  label: string;
  /** lucide icon name, resolved in the UI layer. */
  icon: string;
  image: string;
  /** Event categories this interest pulls in, used for mock personalisation. */
  categories: EventCategory[];
}

/** Twelve interests, deliberately no more — onboarding should feel light. */
export const INTERESTS: Record<InterestId, InterestMeta> = {
  culture: { id: "culture", label: "Culture", icon: "Drama", image: IMAGES.cultureCrowd, categories: ["culture"] },
  food: { id: "food", label: "Food", icon: "UtensilsCrossed", image: IMAGES.foodPlates, categories: ["food"] },
  music: { id: "music", label: "Music", icon: "Music", image: IMAGES.concertStage, categories: ["music"] },
  nightlife: { id: "nightlife", label: "Nightlife", icon: "Martini", image: IMAGES.clubNight, categories: ["nightlife"] },
  nature: { id: "nature", label: "Nature", icon: "Trees", image: IMAGES.greenHills, categories: ["outdoor"] },
  adventure: { id: "adventure", label: "Adventure", icon: "Mountain", image: IMAGES.hiking, categories: ["outdoor", "sports"] },
  sports: { id: "sports", label: "Sports", icon: "Trophy", image: IMAGES.cycling, categories: ["sports"] },
  history: { id: "history", label: "History", icon: "Landmark", image: IMAGES.fashionShow, categories: ["culture"] },
  family: { id: "family", label: "Family", icon: "Baby", image: IMAGES.familyKids, categories: ["family"] },
  art: { id: "art", label: "Art", icon: "Palette", image: IMAGES.craftWorkshop, categories: ["culture", "community"] },
  business: { id: "business", label: "Business", icon: "Briefcase", image: IMAGES.conferenceHall, categories: ["business"] },
  festivals: { id: "festivals", label: "Festivals", icon: "PartyPopper", image: IMAGES.festivalCrowd, categories: ["festivals"] },
};

export const INTEREST_LIST = Object.values(INTERESTS);

/** Interests → event categories, de-duplicated. Drives the "Because you like…" rows. */
export function categoriesForInterests(interests: InterestId[]): EventCategory[] {
  const set = new Set<EventCategory>();
  for (const i of interests) INTERESTS[i]?.categories.forEach((c) => set.add(c));
  return [...set];
}

export interface DiscoveryPreferenceMeta {
  id: DiscoveryPreferenceId;
  label: string;
  description: string;
  icon: string;
}

export const DISCOVERY_PREFERENCES: Record<DiscoveryPreferenceId, DiscoveryPreferenceMeta> = {
  near_me: { id: "near_me", label: "Things happening near me", description: "Events close to home, mostly on weeknights.", icon: "MapPin" },
  places: { id: "places", label: "Places to visit", description: "Destinations and attractions worth the trip.", icon: "Map" },
  weekends: { id: "weekends", label: "Weekend activities", description: "Something to do on Saturday and Sunday.", icon: "CalendarDays" },
  trips: { id: "trips", label: "Trips around the country", description: "Longer journeys beyond your own city.", icon: "Route" },
  food_culture: { id: "food_culture", label: "Food and culture", description: "Markets, tastings, heritage and the arts.", icon: "UtensilsCrossed" },
  everything: { id: "everything", label: "A bit of everything", description: "Show me what's good, wherever it is.", icon: "Sparkles" },
};

export const DISCOVERY_PREFERENCE_LIST = Object.values(DISCOVERY_PREFERENCES);

export const ORGANIZATION_TYPES: Record<OrganizationType, { label: string; description: string; icon: string }> = {
  event_organizer: { label: "Event organiser", description: "Concerts, conferences, festivals and launches.", icon: "PartyPopper" },
  tour_operator: { label: "Tour operator", description: "Guided trips, treks and day tours.", icon: "Route" },
  hotel: { label: "Hotel", description: "Rooms, banquets and conference facilities.", icon: "BedDouble" },
  restaurant: { label: "Restaurant", description: "Dining, supper clubs and tastings.", icon: "UtensilsCrossed" },
  experience_provider: { label: "Experience provider", description: "Workshops, classes and activities.", icon: "Sparkles" },
  cultural_organization: { label: "Cultural organisation", description: "Museums, troupes and heritage programmes.", icon: "Drama" },
  attraction: { label: "Attraction", description: "Parks, landmarks and visitor sites.", icon: "Landmark" },
};

export const ORGANIZATION_TYPE_LIST = Object.entries(ORGANIZATION_TYPES).map(([id, v]) => ({ id: id as OrganizationType, ...v }));

/** Where each role lands once it is past onboarding. */
export const ROLE_HOME: Record<UserRole, string> = {
  customer: "/events",
  partner: "/partner",
  worker: "/worker",
  admin: "/admin",
};

/** Human label for a role, used in menus and the login rows. */
export const ROLE_LABEL: Record<UserRole, string> = {
  customer: "Explorer",
  partner: "Partner",
  worker: "Professional",
  admin: "Platform admin",
};

/** Minimum password length accepted by the mock service. */
export const MIN_PASSWORD_LENGTH = 8;
