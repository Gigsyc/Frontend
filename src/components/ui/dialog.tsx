"use client";

import { Dialog as Rx } from "radix-ui";
import { X } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

export const Dialog = Rx.Root;
export const DialogTrigger = Rx.Trigger;
export const DialogClose = Rx.Close;

interface ContentProps extends ComponentProps<typeof Rx.Content> {
  size?: "sm" | "md" | "lg";
  hideClose?: boolean;
}

const SIZE = { sm: "sm:max-w-sm", md: "sm:max-w-lg", lg: "sm:max-w-2xl" };

/** Centered modal on desktop, bottom sheet on small screens. */
export function DialogContent({ className, children, size = "md", hideClose, ...props }: ContentProps) {
  return (
    <Rx.Portal>
      <Rx.Overlay className="fixed inset-0 z-50 bg-navy-950/40 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 motion-safe:transition-opacity" />
      <Rx.Content
        className={cn(
          "fixed z-50 flex max-h-[92dvh] w-full flex-col bg-surface shadow-pop focus:outline-none",
          "inset-x-0 bottom-0 rounded-t-2xl sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-lg",
          "data-[state=open]:animate-fade-up",
          SIZE[size],
          className,
        )}
        {...props}
      >
        {children}
        {!hideClose ? (
          <Rx.Close className="absolute right-3 top-3 inline-flex size-8 items-center justify-center rounded-md text-fg-muted transition-colors hover:bg-ink-100 hover:text-fg" aria-label="Close">
            <X className="size-4" />
          </Rx.Close>
        ) : null}
      </Rx.Content>
    </Rx.Portal>
  );
}

export function DialogHeader({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-1 px-6 pt-6 pr-12", className)} {...props} />;
}
export function DialogTitle({ className, ...props }: ComponentProps<typeof Rx.Title>) {
  return <Rx.Title className={cn("text-lg font-semibold", className)} {...props} />;
}
export function DialogDescription({ className, ...props }: ComponentProps<typeof Rx.Description>) {
  return <Rx.Description className={cn("text-sm text-fg-muted", className)} {...props} />;
}
export function DialogBody({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("min-h-0 flex-1 overflow-y-auto px-6 py-5", className)} {...props} />;
}
export function DialogFooter({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("flex flex-col-reverse gap-2 border-t border-border px-6 py-4 sm:flex-row sm:justify-end", className)} {...props} />;
}

/** Side drawer, used for filters, detail peeks and mobile navigation. */
export function SheetContent({ className, children, side = "right", hideClose, title, description, ...props }: Omit<ComponentProps<typeof Rx.Content>, "title"> & { side?: "left" | "right"; hideClose?: boolean; title: ReactNode; description?: ReactNode }) {
  return (
    <Rx.Portal>
      <Rx.Overlay className="fixed inset-0 z-50 bg-navy-950/40 backdrop-blur-[2px]" />
      <Rx.Content
        className={cn(
          "fixed inset-y-0 z-50 flex w-full max-w-sm flex-col bg-surface shadow-pop focus:outline-none",
          side === "right" ? "right-0 motion-safe:animate-[slide-in-right_0.3s_var(--ease-out-soft)]" : "left-0 motion-safe:animate-[slide-in-left_0.3s_var(--ease-out-soft)]",
          className,
        )}
        {...props}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div>
            <Rx.Title className="text-base font-semibold">{title}</Rx.Title>
            {description ? <Rx.Description className="mt-0.5 text-sm text-fg-muted">{description}</Rx.Description> : <Rx.Description className="sr-only">{title}</Rx.Description>}
          </div>
          {!hideClose ? (
            <Rx.Close className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-fg-muted hover:bg-ink-100 hover:text-fg" aria-label="Close">
              <X className="size-4" />
            </Rx.Close>
          ) : null}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </Rx.Content>
    </Rx.Portal>
  );
}
