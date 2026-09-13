import {
  BellRing, Boxes, ClipboardCheck, ClipboardList, Coffee, HandHeart, Hammer, Megaphone, MonitorSpeaker, ShieldCheck, ShoppingBag, Signpost, UtensilsCrossed, Wine,
  type LucideIcon,
} from "lucide-react";
import type { RoleCategory } from "@/types";
import { ROLES } from "@/data/roles";
import { cn } from "@/lib/utils";

const ICONS: Record<RoleCategory, LucideIcon> = {
  usher: Signpost, registration: ClipboardCheck, waiter: UtensilsCrossed, bartender: Wine, host: HandHeart, barista: Coffee,
  promoter: Megaphone, data_collector: ClipboardList, receptionist: BellRing, setup_crew: Hammer, warehouse: Boxes, retail: ShoppingBag,
  steward: ShieldCheck, av_support: MonitorSpeaker,
};

export function roleIcon(role: RoleCategory): LucideIcon {
  return ICONS[role];
}

/** Square role glyph used in cards and lists. */
export function RoleIcon({ role, size = "md", className }: { role: RoleCategory; size?: "sm" | "md" | "lg"; className?: string }) {
  const Icon = ICONS[role];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-md bg-navy-50 text-navy-800",
        size === "sm" ? "size-8 [&_svg]:size-4" : size === "md" ? "size-10 [&_svg]:size-5" : "size-12 [&_svg]:size-6",
        className,
      )}
      aria-label={ROLES[role].label}
      role="img"
    >
      <Icon />
    </span>
  );
}
