import { Briefcase, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { LOOP_STEPS } from "../../content";

/**
 * Vertical narrative with a hairline rail. Each step has an employer column and a
 * worker column so the same moment is readable from both seats.
 */
export function LoopNarrative() {
  return (
    <section className="bg-surface">
      <div className="container-x py-16 lg:py-24">
        <ol className="relative">
          <span className="absolute left-5 top-6 bottom-6 w-px bg-border lg:left-1/2" aria-hidden />
          {LOOP_STEPS.map((step, i) => {
            const Icon = step.icon;
            const last = i === LOOP_STEPS.length - 1;
            return (
              <li key={step.id} id={step.anchor ?? step.id} className={cn("relative scroll-mt-20 pl-14 lg:pl-0", !last && "pb-16 lg:pb-24")}>
                <span className="absolute left-0 top-0 z-10 inline-flex size-10 items-center justify-center rounded-full bg-navy-900 font-display text-sm font-semibold text-white ring-4 ring-surface tabular lg:left-1/2 lg:-translate-x-1/2">
                  {i + 1}
                </span>
                <header className="relative z-10 max-w-xl bg-surface lg:mx-auto lg:px-6 lg:pt-14 lg:text-center">
                  <h2 className="flex items-center gap-2.5 text-2xl font-semibold sm:text-[28px] lg:justify-center">
                    <Icon className="size-5 text-navy-600" aria-hidden />
                    {step.title}
                  </h2>
                  <p className="mt-2 text-[15px] leading-7 text-fg-muted">{step.summary}</p>
                </header>
                <div className="mt-6 grid gap-4 lg:mt-8 lg:grid-cols-2 lg:gap-10">
                  <Perspective icon={Briefcase} label="Employer" body={step.employer} tone="navy" />
                  <Perspective icon={UserRound} label="Professional" body={step.worker} tone="amber" />
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

function Perspective({ icon: Icon, label, body, tone }: { icon: typeof Briefcase; label: string; body: string; tone: "navy" | "amber" }) {
  return (
    <div className={cn("rounded-lg border-t-2 bg-canvas p-5", tone === "navy" ? "border-navy-900" : "border-amber-500")}>
      <p className={cn("flex items-center gap-2 text-xs font-semibold uppercase tracking-wider", tone === "navy" ? "text-navy-700" : "text-amber-700")}>
        <Icon className="size-3.5" aria-hidden /> {label}
      </p>
      <p className="mt-2.5 text-sm leading-6 text-fg">{body}</p>
    </div>
  );
}
