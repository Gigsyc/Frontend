import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Photo } from "@/components/ui/photo";
import { IMAGES } from "@/data/images";
import { Eyebrow, Section } from "../section";

export function WorkersHero() {
  return (
    <Section size="lg">
      <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <div className="max-w-xl">
          <Eyebrow>GigSyc for Professionals</Eyebrow>
          <h1 className="mt-5 text-[38px] font-semibold leading-[1.06] sm:text-[46px] lg:text-[50px]">
            Your skills. More opportunities. <span className="text-navy-500">Your professional reputation.</span>
          </h1>
          <p className="mt-6 max-w-lg text-[17px] leading-7 text-fg-muted">
            Pick up banquet, conference, activation and retail shifts across Kigali that fit around study, family and other work. Pay, hours and dress code are fixed before you say yes, and the money lands on MoMo within 48 hours.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/login?as=worker">Find shifts <ArrowRight /></Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#pay">What you earn</Link>
            </Button>
          </div>
          <p className="mt-5 text-[13px] text-fg-subtle">Free for professionals. The pay shown on a shift is what you receive.</p>
        </div>
        <Photo
          src={IMAGES.catering}
          alt="Server carefully plating dishes at a catering station before service"
          aspect="auto"
          priority
          className="aspect-[4/3] lg:aspect-[5/4]"
          sizes="(max-width: 1024px) 100vw, 45vw"
        />
      </div>
    </Section>
  );
}
