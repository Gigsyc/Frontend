import { ROLES, SERVICE_FEE_RATE } from "@/data/roles";
import { formatRwf, pluralize } from "@/lib/utils";
import { PRICING_EXAMPLE, PRICING_POINTS } from "../../content";
import { CheckList } from "../check-list";
import { Section, SectionIntro } from "../section";

/** Worked example: worker pay + 18% service fee, one line each. Money always via formatRwf. */
export function PricingSection() {
  const { workers, role, payPerShift } = PRICING_EXAMPLE;
  const noun = ROLES[role].short.toLowerCase();
  const subtotal = workers * payPerShift;
  const fee = Math.round(subtotal * SERVICE_FEE_RATE);
  const total = subtotal + fee;
  const feePct = Math.round(SERVICE_FEE_RATE * 100);

  return (
    <Section id="pricing" tone="canvas">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-start lg:gap-16">
        <div>
          <SectionIntro
            eyebrow="Pricing"
            title="Pay only for completed shifts"
            lede={`Worker pay plus an ${feePct}% service fee, invoiced fortnightly. No subscription, no posting fee, nothing charged for a no-show.`}
          />
          <CheckList items={PRICING_POINTS} className="mt-8" />
        </div>

        <div className="rounded-lg bg-surface p-5 shadow-card sm:p-6" aria-labelledby="pricing-example">
          <p id="pricing-example" className="text-xs font-semibold uppercase tracking-wider text-fg-muted">Worked example</p>
          <h3 className="mt-2 text-lg font-semibold">
            {pluralize(workers, noun)} for one gala dinner
          </h3>
          <dl className="mt-6 divide-y divide-border text-sm">
            <div className="flex items-baseline justify-between gap-4 py-3">
              <dt className="text-fg-muted">
                <span className="tabular">{workers}</span> × {formatRwf(payPerShift)} per shift
              </dt>
              <dd className="font-medium tabular text-fg">{formatRwf(subtotal)}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 py-3">
              <dt className="text-fg-muted">Service fee ({feePct}%)</dt>
              <dd className="font-medium tabular text-fg">{formatRwf(fee)}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 pt-4">
              <dt className="font-semibold text-fg">Invoiced to you</dt>
              <dd className="font-display text-2xl font-semibold tabular text-navy-900">{formatRwf(total)}</dd>
            </div>
          </dl>
          <p className="mt-5 text-[13px] leading-5 text-fg-muted">
            Each {noun} receives {formatRwf(payPerShift)} on MTN MoMo or Airtel Money within 48 hours of your approval. Transport allowance, if you offer one, is added at cost.
          </p>
        </div>
      </div>
    </Section>
  );
}
