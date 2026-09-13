"use client";

import { DropdownMenu as Rx } from "radix-ui";
import { Check } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export const DropdownMenu = Rx.Root;
export const DropdownMenuTrigger = Rx.Trigger;
export const DropdownMenuGroup = Rx.Group;
export const DropdownMenuRadioGroup = Rx.RadioGroup;

export function DropdownMenuContent({ className, sideOffset = 6, ...props }: ComponentProps<typeof Rx.Content>) {
  return (
    <Rx.Portal>
      <Rx.Content
        sideOffset={sideOffset}
        className={cn("z-50 min-w-48 rounded-lg bg-surface p-1 shadow-pop data-[state=open]:animate-fade-up", className)}
        {...props}
      />
    </Rx.Portal>
  );
}

const itemClass =
  "relative flex cursor-pointer select-none items-center gap-2 rounded-md px-2.5 py-2 text-sm text-fg outline-none transition-colors data-[highlighted]:bg-ink-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:size-4 [&_svg]:text-fg-muted";

export function DropdownMenuItem({ className, destructive, ...props }: ComponentProps<typeof Rx.Item> & { destructive?: boolean }) {
  return <Rx.Item className={cn(itemClass, destructive && "text-danger-600 data-[highlighted]:bg-danger-50 [&_svg]:text-danger-600", className)} {...props} />;
}

export function DropdownMenuCheckboxItem({ className, children, ...props }: ComponentProps<typeof Rx.CheckboxItem>) {
  return (
    <Rx.CheckboxItem className={cn(itemClass, "pl-8", className)} {...props}>
      <span className="absolute left-2.5 inline-flex size-4 items-center justify-center">
        <Rx.ItemIndicator><Check className="size-3.5 text-navy-900" strokeWidth={3} /></Rx.ItemIndicator>
      </span>
      {children}
    </Rx.CheckboxItem>
  );
}

export function DropdownMenuRadioItem({ className, children, ...props }: ComponentProps<typeof Rx.RadioItem>) {
  return (
    <Rx.RadioItem className={cn(itemClass, "pl-8", className)} {...props}>
      <span className="absolute left-2.5 inline-flex size-4 items-center justify-center">
        <Rx.ItemIndicator><Check className="size-3.5 text-navy-900" strokeWidth={3} /></Rx.ItemIndicator>
      </span>
      {children}
    </Rx.RadioItem>
  );
}

export function DropdownMenuLabel({ className, ...props }: ComponentProps<typeof Rx.Label>) {
  return <Rx.Label className={cn("px-2.5 py-1.5 text-xs font-medium text-fg-muted", className)} {...props} />;
}
export function DropdownMenuSeparator({ className, ...props }: ComponentProps<typeof Rx.Separator>) {
  return <Rx.Separator className={cn("-mx-1 my-1 h-px bg-border", className)} {...props} />;
}
