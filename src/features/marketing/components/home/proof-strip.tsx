import { PROOF_STATS } from "../../content";

/** Four quiet numbers with hairlines. Not KPI tiles — this is a sentence, not a dashboard. */
export function ProofStrip() {
  return (
    <section className="border-y border-border bg-canvas" aria-label="Platform figures">
      <div className="container-x py-8 lg:py-10">
        <dl className="grid grid-cols-2 gap-y-8 md:grid-cols-4 md:divide-x md:divide-border">
          {PROOF_STATS.map((s) => (
            <div key={s.label} className="flex flex-col gap-1 md:px-8 md:first:pl-0 md:last:pr-0">
              <dd className="font-display text-[28px] font-semibold leading-none tracking-tight text-navy-900 tabular sm:text-[32px]">{s.value}</dd>
              <dt className="text-[13px] text-fg-muted">{s.label}</dt>
            </div>
          ))}
        </dl>
        <p className="mt-6 text-xs text-fg-subtle">Prototype figures.</p>
      </div>
    </section>
  );
}
