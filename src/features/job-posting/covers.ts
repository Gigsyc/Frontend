import { IMAGES } from "@/data/images";
import type { RoleCategory } from "@/types";

/** Same pairing the seed data uses, so posted shifts sit naturally beside the mocks. */
export const COVER_BY_ROLE: Record<RoleCategory, string> = {
  usher: IMAGES.conferenceAudience,
  registration: IMAGES.conferenceHall,
  waiter: IMAGES.catering,
  bartender: IMAGES.cocktails,
  host: IMAGES.eventDecor,
  barista: IMAGES.cafe,
  promoter: IMAGES.retailStore,
  data_collector: IMAGES.tabletWork,
  receptionist: IMAGES.hotelReception,
  setup_crew: IMAGES.exhibition,
  warehouse: IMAGES.warehouse,
  retail: IMAGES.retailStore,
  steward: IMAGES.basketball,
  av_support: IMAGES.presentation,
};
