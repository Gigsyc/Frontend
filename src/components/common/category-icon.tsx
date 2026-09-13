import {
  Baby, Briefcase, Drama, HeartHandshake, Martini, Mountain, Music, PartyPopper, Trophy, UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import type { EventCategory } from "@/types";
import { EVENT_CATEGORIES } from "@/data/events";
import { cn } from "@/lib/utils";

const ICONS: Record<EventCategory, LucideIcon> = {
  music: Music, culture: Drama, food: UtensilsCrossed, sports: Trophy, nightlife: Martini,
  family: Baby, business: Briefcase, festivals: PartyPopper, outdoor: Mountain, community: HeartHandshake,
};

export function categoryIcon(c: EventCategory): LucideIcon {
  return ICONS[c];
}

/** Square category glyph, mirroring RoleIcon on the workforce side. */
export function CategoryIcon({ category, size = "md", className }: { category: EventCategory; size?: "sm" | "md" | "lg"; className?: string }) {
  const Icon = ICONS[category];
  return (
    <span
      role="img"
      aria-label={EVENT_CATEGORIES[category].label}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-md bg-navy-50 text-navy-800",
        size === "sm" ? "size-8 [&_svg]:size-4" : size === "md" ? "size-10 [&_svg]:size-5" : "size-12 [&_svg]:size-6",
        className,
      )}
    >
      <Icon />
    </span>
  );
}
