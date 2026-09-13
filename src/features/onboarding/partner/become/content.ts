import { CalendarCheck, ClipboardPen, ShieldCheck, UserRoundPlus, type LucideIcon } from "lucide-react";

/**
 * Copy for /become-a-partner. Words live here so the section components stay small.
 * Domain numbers (the fee rate, money formatting) still come from the data layer.
 *
 * Everything promised here has to exist in the workspace a new partner lands in. Today that
 * is shifts, candidates, payments and invoices; putting an event on the public board is a
 * step an admin opens once the organisation is verified, so the copy says exactly that.
 */

export interface PartnerStep {
  id: string;
  title: string;
  body: string;
  icon: LucideIcon;
}

export const PARTNER_STEPS: PartnerStep[] = [
  { id: "account", title: "Create your account", body: "Email and a password, or continue with Google. It takes under a minute.", icon: UserRoundPlus },
  { id: "organisation", title: "Tell us about your organisation", body: "Name, what kind of organisation you are, a contact and the city you work from.", icon: ClipboardPen },
  { id: "shifts", title: "Post the shifts your event needs", body: "Role, venue, date and pay for each one. Confirm your team from a ranked list of verified professionals.", icon: CalendarCheck },
  { id: "verify", title: "We verify your organisation", body: "An admin checks your details, usually within a day. Once you are verified you can put your events on the public board.", icon: ShieldCheck },
];

/** The three reasons, in the order a partner cares about them. */
export const PARTNER_VALUE = {
  reach: {
    title: "Reach people already looking",
    body: "Once your organisation is verified, your event sits on the GigSyc events board beside everything else on that weekend, in the same format people already scan: date, place, price.",
  },
  staff: {
    title: "Staff the event with verified professionals",
    body: "Post the roles you need and confirm from a ranked list of people whose ID, phone and references have been checked.",
  },
  invoice: {
    title: "One invoice at the end",
    body: "Workers are paid to MTN MoMo within 48 hours of your approval. You settle once, on one invoice, when the work is done.",
  },
} as const;

/** A fortnight of work on one invoice: the pay line, the fee line, the total. */
export const PREVIEW_INVOICE_SUBTOTAL = 240_000;
