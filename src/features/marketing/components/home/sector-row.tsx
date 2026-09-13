import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SECTORS } from "@/data/roles";
import type { Sector } from "@/types";

const ORDER: Sector[] = ["hospitality", "events", "marketing", "corporate", "retail_logistics"];

/** Compact sector navigation. Chips are the one fully-round shape we allow. */
export function SectorRow() {
  return (
    <section className="border-b border-border bg-surface" aria-labelledby="sectors-heading">
      <div className="container-x flex flex-col gap-4 py-8 lg:flex-row lg:items-center lg:gap-8">
        <h2 id="sectors-heading" className="shrink-0 font-sans text-sm font-semibold tracking-normal text-fg-muted">Sectors we staff</h2>
        <ul className="flex flex-wrap gap-2">
          {ORDER.map((key) => (
            <li key={key}>
              <Link
                href="/business#sectors"
                title={SECTORS[key].description}
                className="group inline-flex h-10 items-center gap-2 rounded-full border border-border-strong bg-surface px-4 text-sm font-medium text-fg transition-colors hover:border-navy-900 hover:bg-navy-50 hover:text-navy-900"
              >
                {SECTORS[key].label}
                <ArrowRight className="size-3.5 text-fg-subtle transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-navy-900" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
