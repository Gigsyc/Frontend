import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  /** Small text above the title (e.g. "Jobs", employer name). */
  eyebrow?: ReactNode;
  backHref?: string;
  backLabel?: string;
  className?: string;
  children?: ReactNode;
}

export function PageHeader({ title, description, actions, eyebrow, backHref, backLabel = "Back", className, children }: PageHeaderProps) {
  return (
    <header className={cn("flex flex-col gap-4", className)}>
      {backHref ? (
        <Link href={backHref} className="inline-flex w-fit items-center gap-1 text-sm font-medium text-fg-muted transition-colors hover:text-fg [&_svg]:size-4">
          <ChevronLeft aria-hidden /> {backLabel}
        </Link>
      ) : null}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          {eyebrow ? <div className="mb-1 text-[13px] font-medium text-fg-muted">{eyebrow}</div> : null}
          <h1 className="text-2xl font-semibold leading-tight sm:text-[28px]">{title}</h1>
          {description ? <p className="mt-1.5 max-w-2xl text-sm text-fg-muted sm:text-[15px]">{description}</p> : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      {children}
    </header>
  );
}

export function SectionHeading({ title, description, action, className, as: Tag = "h2" }: { title: ReactNode; description?: ReactNode; action?: ReactNode; className?: string; as?: "h2" | "h3" }) {
  return (
    <div className={cn("flex items-end justify-between gap-4", className)}>
      <div>
        <Tag className={cn("font-semibold", Tag === "h2" ? "text-lg" : "text-base")}>{title}</Tag>
        {description ? <p className="mt-0.5 text-sm text-fg-muted">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
