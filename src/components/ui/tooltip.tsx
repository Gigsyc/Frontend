"use client";

import { Tooltip as Rx } from "radix-ui";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

export const TooltipProvider = Rx.Provider;

export function Tooltip({ content, children, side = "top", className, ...props }: { content: ReactNode; children: ReactNode; side?: ComponentProps<typeof Rx.Content>["side"]; className?: string } & ComponentProps<typeof Rx.Root>) {
  return (
    <Rx.Root delayDuration={250} {...props}>
      <Rx.Trigger asChild>{children}</Rx.Trigger>
      <Rx.Portal>
        <Rx.Content side={side} sideOffset={6} className={cn("z-50 max-w-64 rounded-md bg-navy-900 px-2.5 py-1.5 text-xs leading-5 text-white shadow-pop data-[state=delayed-open]:animate-fade-up", className)}>
          {content}
          <Rx.Arrow className="fill-navy-900" />
        </Rx.Content>
      </Rx.Portal>
    </Rx.Root>
  );
}
