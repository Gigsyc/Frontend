"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEmployerTour } from "../../hooks/use-employer-tour";
import { Section, SectionIntro } from "../section";
import { TourAttendance } from "./tour-attendance";
import { TourCandidates } from "./tour-candidates";
import { TourJobs } from "./tour-jobs";

interface RowProps {
  step: string;
  title: string;
  body: string;
  cta: { label: string; href: string };
  flip?: boolean;
  children: ReactNode;
}

function TourRow({ step, title, body, cta, flip, children }: RowProps) {
  return (
    <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
      <div className={cn("max-w-md", flip && "lg:order-2")}>
        <p className="font-display text-sm font-semibold text-amber-700 tabular">{step}</p>
        <h3 className="mt-2 text-2xl font-semibold sm:text-[26px]">{title}</h3>
        <p className="mt-3 text-[15px] leading-7 text-fg-muted">{body}</p>
        <Button variant="link" className="mt-4" asChild>
          <Link href={cta.href}>{cta.label} <ArrowRight /></Link>
        </Button>
      </div>
      <div className={cn(flip && "lg:order-1")}>{children}</div>
    </div>
  );
}

/** Three screens from the employer portal, rendered with real primitives and live prototype data. */
export function ProductTour() {
  const tour = useEmployerTour();
  const shared = { isPending: tour.isPending, isError: tour.isError, error: tour.error, isRefetching: tour.isRefetching, onRetry: () => { void tour.refetch(); } };

  return (
    <Section>
      <SectionIntro
        eyebrow="The product"
        title="Three screens run the whole shift"
        lede="These are the real prototype screens with the demo employer's live data, not illustrations. Log in as Ikaze Hospitality Group to use them."
      />
      <div className="mt-14 flex flex-col gap-20 lg:gap-28">
        <TourRow
          step="01 · Jobs"
          title="Post once and watch it fill"
          body="Every job shows how many of the positions are confirmed. Urgent shifts are pushed to nearby professionals first; the rest fill overnight."
          cta={{ label: "Post a shift", href: "/login?as=employer" }}
        >
          <TourJobs shifts={tour.active} confirmedByShift={tour.confirmedByShift} {...shared} />
        </TourRow>

        <TourRow
          step="02 · Staffing"
          title="Confirm from a ranked list, not a group chat"
          body="Candidates are ranked by skills, distance, rating and reliability, with the reasons spelled out. People from your talent pool are confirmed automatically when they accept."
          cta={{ label: "See how matching works", href: "/how-it-works" }}
          flip
        >
          <TourCandidates shift={tour.featured} parentPending={tour.isPending} />
        </TourRow>

        <TourRow
          step="03 · Attendance"
          title="Know who is on site, live"
          body="Workers scan the QR code at the staff entrance. Check-in times are on the shift page as they happen, no-shows are recorded on the worker's profile, and you are not charged for them."
          cta={{ label: "Trust and verification", href: "/how-it-works#trust" }}
        >
          <TourAttendance shift={tour.live} parentPending={tour.isPending} />
        </TourRow>
      </div>
    </Section>
  );
}
