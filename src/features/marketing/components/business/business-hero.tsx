import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Photo } from "@/components/ui/photo";
import { IMAGES } from "@/data/images";
import { Eyebrow, Section } from "../section";

export function BusinessHero() {
  return (
    <Section size="lg">
      <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <div className="max-w-xl">
          <Eyebrow>GigSyc for Business</Eyebrow>
          <h1 className="mt-5 text-[38px] font-semibold leading-[1.06] sm:text-[46px] lg:text-[50px]">
            Staff the banquet, the summit and the stock count. <span className="text-navy-500">Without the phone tree.</span>
          </h1>
          <p className="mt-6 max-w-lg text-[17px] leading-7 text-fg-muted">
            Post a shift with the role, venue, date and pay. Verified professionals nearby are notified within minutes, you confirm from a ranked list, and attendance, ratings and payment are handled on one page.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/login?as=employer">Post a shift <ArrowRight /></Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#pricing">See pricing</Link>
            </Button>
          </div>
          <p className="mt-5 text-[13px] text-fg-subtle">No subscription. Pay only for completed shifts, invoiced fortnightly.</p>
        </div>
        <Photo
          src={IMAGES.conferenceHall}
          alt="Conference hall in Kigali set with rows of chairs before delegates arrive"
          aspect="auto"
          priority
          className="aspect-[4/3] lg:aspect-[5/4]"
          sizes="(max-width: 1024px) 100vw, 45vw"
        />
      </div>
    </Section>
  );
}
