"use client";

import { Accordion } from "radix-ui";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FaqItem } from "../content";

/** Minimal accordion: hairlines, no boxes. One open at a time. */
export function Faq({ items, className }: { items: FaqItem[]; className?: string }) {
  return (
    <Accordion.Root type="single" collapsible className={cn("divide-y divide-border border-y border-border", className)}>
      {items.map((item, i) => (
        <Accordion.Item key={item.q} value={`faq-${i}`}>
          <Accordion.Header asChild>
            <h3 className="text-base font-medium tracking-normal text-fg">
              <Accordion.Trigger className="group flex min-h-14 w-full items-center justify-between gap-4 py-4 text-left transition-colors hover:text-navy-800 focus-visible:outline-none focus-visible:shadow-focus rounded-sm">
                <span>{item.q}</span>
                <ChevronDown className="size-4 shrink-0 text-fg-subtle transition-transform duration-200 ease-out-soft group-data-[state=open]:rotate-180" aria-hidden />
              </Accordion.Trigger>
            </h3>
          </Accordion.Header>
          <Accordion.Content className="overflow-hidden">
            <p className="max-w-2xl pb-5 text-sm leading-6 text-fg-muted">{item.a}</p>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
