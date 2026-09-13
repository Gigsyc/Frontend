import { ArrowRight } from "lucide-react";
import { HIRING_PROBLEMS } from "../../content";
import { Section, SectionIntro } from "../section";

/** Three rows, two columns, hairlines. Reads like a before/after table rather than a card grid. */
export function HiringProblems() {
  return (
    <Section tone="canvas">
      <SectionIntro
        eyebrow="Built for the way Kigali hires"
        title="The night-before scramble, replaced"
        lede="Most venues and agencies already have a bench of people they trust. The problem is reaching them, knowing who turned up, and paying everyone without a stack of envelopes."
      />
      <div className="mt-12 overflow-hidden rounded-lg border border-border bg-surface">
        <div className="hidden grid-cols-[1fr_auto_1fr] items-center gap-6 border-b border-border bg-canvas px-6 py-3 text-xs font-semibold uppercase tracking-wider text-fg-muted md:grid">
          <span>Today</span>
          <span className="w-4" aria-hidden />
          <span>With GigSyc</span>
        </div>
        <ol className="divide-y divide-border">
          {HIRING_PROBLEMS.map((row, i) => (
            <li key={row.problem} className="grid gap-4 px-5 py-6 md:grid-cols-[1fr_auto_1fr] md:items-start md:gap-6 md:px-6 md:py-7">
              <div className="flex gap-4">
                <span className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-ink-100 font-display text-xs font-semibold text-fg-muted tabular">{i + 1}</span>
                <p className="text-[15px] leading-6 text-fg-muted">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-fg-subtle md:hidden">Today</span>
                  {row.problem}
                </p>
              </div>
              <ArrowRight className="hidden size-4 shrink-0 text-amber-600 md:mt-1 md:block" aria-hidden />
              <p className="text-[15px] leading-6 text-fg md:pl-0 pl-11">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-navy-700 md:hidden">With GigSyc</span>
                {row.solution}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
