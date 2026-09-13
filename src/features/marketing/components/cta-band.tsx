import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section } from "./section";

interface Cta {
  label: string;
  href: string;
}

interface CtaBandProps {
  title: string;
  body: string;
  primary: Cta;
  secondary?: Cta;
}

/** Closing band on every marketing page: navy ground, amber primary action, brand line up top. */
export function CtaBand({ title, body, primary, secondary }: CtaBandProps) {
  return (
    <Section tone="navy" size="md">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
        <div className="max-w-2xl">
          <p className="text-[13px] font-semibold uppercase tracking-wider text-amber-400">Powering Flexible Work</p>
          <h2 className="mt-3 text-[28px] font-semibold leading-[1.12] text-white sm:text-[36px]">{title}</h2>
          <p className="mt-4 text-base leading-7 text-white/75 sm:text-[17px]">{body}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0">
          <Button size="lg" variant="accent" asChild>
            <Link href={primary.href}>{primary.label} <ArrowRight /></Link>
          </Button>
          {secondary ? (
            <Button size="lg" variant="on-dark" asChild>
              <Link href={secondary.href}>{secondary.label}</Link>
            </Button>
          ) : null}
        </div>
      </div>
    </Section>
  );
}
