import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "surface" | "canvas" | "navy";
const TONE: Record<Tone, string> = { surface: "bg-surface", canvas: "bg-canvas", navy: "bg-navy-900 text-white" };

interface SectionProps extends HTMLAttributes<HTMLElement> {
  tone?: Tone;
  size?: "sm" | "md" | "lg";
}

const SIZE = { sm: "py-10 lg:py-14", md: "py-16 lg:py-24", lg: "py-16 sm:py-20 lg:py-28" };

/** Full-bleed marketing band with a centred container. Anchored sections clear the sticky header. */
export function Section({ tone = "surface", size = "md", className, children, id, ...props }: SectionProps) {
  return (
    <section id={id} className={cn(TONE[tone], id && "scroll-mt-16", className)} {...props}>
      <div className={cn("container-x", SIZE[size])}>{children}</div>
    </section>
  );
}

/** Small label above a heading. A short amber rule carries the accent so the text can stay navy. */
export function Eyebrow({ children, onDark, className }: { children: ReactNode; onDark?: boolean; className?: string }) {
  return (
    <p className={cn("inline-flex items-center gap-2.5 text-[13px] font-semibold", onDark ? "text-amber-400" : "text-navy-700", className)}>
      <span className={cn("h-px w-6", onDark ? "bg-amber-400" : "bg-amber-500")} aria-hidden />
      {children}
    </p>
  );
}

interface SectionIntroProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  lede?: ReactNode;
  onDark?: boolean;
  align?: "left" | "center";
  as?: "h1" | "h2";
  className?: string;
}

export function SectionIntro({ eyebrow, title, lede, onDark, align = "left", as: Tag = "h2", className }: SectionIntroProps) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow ? <Eyebrow onDark={onDark} className={cn(align === "center" && "justify-center")}>{eyebrow}</Eyebrow> : null}
      <Tag className={cn("mt-3 font-semibold leading-[1.12]", Tag === "h1" ? "text-[36px] sm:text-[44px]" : "text-[28px] sm:text-[34px]", onDark && "text-white")}>{title}</Tag>
      {lede ? <p className={cn("mt-4 text-base leading-7 sm:text-[17px]", onDark ? "text-white/75" : "text-fg-muted")}>{lede}</p> : null}
    </div>
  );
}
