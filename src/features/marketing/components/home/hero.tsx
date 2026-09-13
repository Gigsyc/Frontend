import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Photo } from "@/components/ui/photo";
import { IMAGES } from "@/data/images";
import { Eyebrow, Section } from "../section";
import { LiveShiftCard } from "./live-shift-card";

export function HomeHero() {
  return (
    <Section size="lg" className="overflow-hidden">
      <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <div className="max-w-xl">
          <Eyebrow>Kigali · Hospitality, events, retail</Eyebrow>
          <h1 className="mt-5 text-[40px] font-semibold leading-[1.04] sm:text-[48px] lg:text-[52px]">
            The talent you need. <span className="text-navy-500">When you need it.</span>
          </h1>
          <p className="mt-6 max-w-lg text-[17px] leading-7 text-fg-muted">
            Post a shift, confirm verified professionals, check them in by QR and pay one invoice. Banquets, conferences, activations and stock counts — staffed in hours, not weeks.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/login?as=employer">Post a shift <ArrowRight /></Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login?as=worker">Find shifts</Link>
            </Button>
          </div>
          <p className="mt-5 text-[13px] text-fg-subtle">Interactive prototype. Explore both sides with the demo accounts — nothing is billed or sent.</p>
        </div>

        <div className="relative mx-auto w-full max-w-md lg:max-w-none lg:pb-10">
          <Photo
            src={IMAGES.eventStaff}
            alt="Event staff in uniform setting a banquet hall before guests arrive"
            aspect="auto"
            priority
            className="aspect-[4/3] lg:aspect-[4/5]"
            sizes="(max-width: 1024px) 100vw, 45vw"
          />
          <div className="relative -mt-16 mx-4 lg:absolute lg:bottom-0 lg:left-auto lg:right-0 lg:mx-0 lg:mt-0 lg:w-[360px] lg:translate-x-6">
            <LiveShiftCard />
          </div>
        </div>
      </div>
    </Section>
  );
}
