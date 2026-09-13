import Link from "next/link";
import { Logo } from "@/components/brand";

const COLS = [
  { title: "Product", links: [["Events", "/events"], ["For business", "/business"], ["For workers", "/workers"], ["How it works", "/how-it-works"], ["Log in", "/login"]] },
  { title: "Sectors", links: [["Hospitality", "/business#sectors"], ["Events & MICE", "/business#sectors"], ["Marketing & activations", "/business#sectors"], ["Retail & logistics", "/business#sectors"]] },
  { title: "Company", links: [["About GigSyc", "/how-it-works#about"], ["Trust & verification", "/how-it-works#trust"], ["Contact", "mailto:hello@gigsyc.rw"]] },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-canvas">
      <div className="container-x py-12 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="max-w-xs">
            <Logo size="md" />
            <p className="mt-4 text-sm leading-6 text-fg-muted">
              Powering flexible work. GigSyc connects Kigali businesses with verified professionals for short-term, event and project work.
            </p>
            <p className="mt-4 text-xs text-fg-subtle">KG 7 Ave, Kimihurura · Kigali, Rwanda</p>
          </div>
          {COLS.map((c) => (
            <div key={c.title}>
              <h3 className="font-sans text-xs font-semibold uppercase tracking-wider text-fg-muted">{c.title}</h3>
              <ul className="mt-4 flex flex-col gap-2.5">
                {c.links.map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} className="text-sm text-fg hover:text-navy-700">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-border pt-6 text-xs text-fg-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} GigSyc Ltd. All rights reserved.</p>
          <p>Interactive prototype · No real accounts or payments.</p>
        </div>
      </div>
    </footer>
  );
}
