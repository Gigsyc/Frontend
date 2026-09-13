import { Smartphone } from "lucide-react";
import { Photo } from "@/components/ui/photo";
import { IMAGES } from "@/data/images";
import { WORKER_REQUIREMENTS } from "../../content";
import { CheckList } from "../check-list";
import { Section, SectionIntro } from "../section";

const PAYMENT_POINTS = [
  "Paid to MTN MoMo or Airtel Money within 48 hours of the employer approving your hours",
  "A reference number for every payout, visible in Earnings",
  "No fees deducted — the amount on the shift is the amount you receive",
];

/** Payments and requirements side by side: the two questions asked before anyone signs up. */
export function PaymentsSection() {
  return (
    <Section>
      <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
        <div>
          <SectionIntro
            eyebrow="Payments"
            title="Paid to mobile money within 48 hours"
            lede="You check out, the supervisor approves the hours the next morning, and the payout is scheduled. No envelopes, no chasing."
          />
          <CheckList items={PAYMENT_POINTS} className="mt-8" />
          <div className="mt-8 flex items-center gap-3 rounded-lg border border-border p-4 text-sm">
            <Smartphone className="size-5 shrink-0 text-navy-700" aria-hidden />
            <p className="text-fg-muted">Payout number must match the phone number verified on your profile. You can change it in Settings before a shift, never during one.</p>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <Photo src={IMAGES.tabletWork} alt="Worker checking a payment confirmation on a phone" aspect="video" sizes="(max-width: 1024px) 100vw, 50vw" />
          <div>
            <h3 className="text-lg font-semibold">What you need to join</h3>
            <CheckList items={WORKER_REQUIREMENTS} className="mt-4" />
          </div>
        </div>
      </div>
    </Section>
  );
}
