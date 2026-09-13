import { LOOP_STEPS } from "../../content";
import { Section, SectionIntro } from "../section";

/** Anchored as #about so the footer's "About GigSyc" lands on the one-paragraph explanation. */
export function HowHero() {
  return (
    <Section id="about" size="lg" tone="canvas">
      <SectionIntro
        as="h1"
        eyebrow="How it works"
        title="One loop, six steps, both sides"
        lede="GigSyc is a Kigali workforce platform. Businesses post short-term shifts, verified professionals accept them, check in by QR, get rated and are paid to mobile money. This page walks the loop once from the employer's seat and once from the worker's."
      />
      <nav aria-label="Steps" className="mt-10">
        <ol className="flex flex-wrap gap-2">
          {LOOP_STEPS.map((s, i) => (
            <li key={s.id}>
              <a href={`#${s.anchor ?? s.id}`} className="inline-flex h-9 items-center gap-2 rounded-full border border-border-strong bg-surface px-3.5 text-[13px] font-medium text-fg transition-colors hover:border-navy-900 hover:bg-navy-50 hover:text-navy-900">
                <span className="font-display text-xs text-fg-muted tabular">{String(i + 1).padStart(2, "0")}</span>
                {s.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </Section>
  );
}
