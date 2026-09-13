import { Photo } from "@/components/ui/photo";
import { IMAGES } from "@/data/images";
import { ROLE_LIST, SECTORS } from "@/data/roles";
import type { Sector } from "@/types";
import { SECTOR_IMAGES } from "../../content";
import { Section, SectionIntro } from "../section";

const ORDER: Sector[] = ["hospitality", "events", "marketing", "corporate", "retail_logistics"];

/** Anchored from the footer and the home sector chips. One row per sector with the roles we actually staff. */
export function SectorsSection() {
  return (
    <Section id="sectors">
      <SectionIntro
        eyebrow="Sectors"
        title="Five sectors, fourteen roles"
        lede="Every role has a typical pay range and a skills check behind it. If a role you need isn't here, post it as the closest match and describe the work — the description is what workers read."
      />
      <ul className="mt-12 divide-y divide-border border-y border-border">
        {ORDER.map((key) => {
          const sector = SECTORS[key];
          const roles = ROLE_LIST.filter((r) => r.sector === key);
          return (
            <li key={key} className="grid gap-5 py-6 sm:grid-cols-[112px_1fr] sm:gap-8 lg:grid-cols-[112px_1fr_1.2fr]">
              <Photo src={IMAGES[SECTOR_IMAGES[key]]} alt="" aspect="square" className="w-28 sm:w-full" sizes="112px" />
              <div>
                <h3 className="text-lg font-semibold">{sector.label}</h3>
                <p className="mt-1 text-sm leading-6 text-fg-muted">{sector.description}</p>
              </div>
              <ul className="flex flex-wrap gap-2 self-start lg:justify-end">
                {roles.map((r) => (
                  <li key={r.id} className="inline-flex h-8 items-center rounded-sm border border-border bg-canvas px-2.5 text-[13px] font-medium text-fg" title={r.description}>
                    {r.label}
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
