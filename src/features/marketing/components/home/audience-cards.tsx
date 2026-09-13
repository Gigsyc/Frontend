import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Photo } from "@/components/ui/photo";
import { IMAGES } from "@/data/images";
import { AUDIENCE_BENEFITS } from "../../content";
import { CheckList } from "../check-list";
import { Section } from "../section";

/** Two doors: navy for business, white with an amber accent for professionals. */
export function AudienceCards() {
  return (
    <Section tone="canvas">
      <div className="grid gap-6 lg:grid-cols-2">
        <article className="flex flex-col overflow-hidden rounded-lg bg-navy-900 text-white shadow-card">
          <Photo src={IMAGES.conferenceHall} alt="Conference hall set for a summit, rows of seats and a lit stage" aspect="wide" rounded={false} tint={false} sizes="(max-width: 1024px) 100vw, 50vw" />
          <div className="flex flex-1 flex-col p-6 sm:p-8">
            <p className="text-[13px] font-semibold uppercase tracking-wider text-amber-400">For businesses</p>
            <h3 className="mt-2 text-2xl font-semibold text-white sm:text-[28px]">Staff the event, not the phone.</h3>
            <p className="mt-3 text-sm leading-6 text-white/75">Hotels, venues, agencies and retailers use GigSyc to cover banquets, summits, activations and stock counts without keeping a bench on payroll.</p>
            <CheckList items={AUDIENCE_BENEFITS.business} onDark className="mt-6" />
            <div className="mt-8 flex flex-wrap gap-3 pt-2 lg:mt-auto">
              <Button variant="accent" size="lg" asChild>
                <Link href="/business">How it works for business <ArrowRight /></Link>
              </Button>
            </div>
          </div>
        </article>

        <article className="flex flex-col overflow-hidden rounded-lg border-t-4 border-amber-500 bg-surface shadow-card">
          <Photo src={IMAGES.catering} alt="Server plating dishes at a catering station" aspect="wide" rounded={false} sizes="(max-width: 1024px) 100vw, 50vw" />
          <div className="flex flex-1 flex-col p-6 sm:p-8">
            <p className="text-[13px] font-semibold uppercase tracking-wider text-amber-700">For professionals</p>
            <h3 className="mt-2 text-2xl font-semibold sm:text-[28px]">Work when it suits you. Get paid fast.</h3>
            <p className="mt-3 text-sm leading-6 text-fg-muted">Students, graduates and experienced hospitality and event staff pick up shifts across Kigali and build a record that follows them.</p>
            <CheckList items={AUDIENCE_BENEFITS.workers} className="mt-6" />
            <div className="mt-8 flex flex-wrap gap-3 pt-2 lg:mt-auto">
              <Button size="lg" asChild>
                <Link href="/workers">How it works for professionals <ArrowRight /></Link>
              </Button>
            </div>
          </div>
        </article>
      </div>
    </Section>
  );
}
