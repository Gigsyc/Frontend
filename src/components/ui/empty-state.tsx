import type { LucideIcon } from "lucide-react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
  compact?: boolean;
}

export function EmptyState({ icon: Icon, title, description, action, className, compact }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center", compact ? "px-4 py-8" : "px-6 py-14", className)}>
      {Icon ? (
        <span className="mb-4 inline-flex size-11 items-center justify-center rounded-lg bg-navy-50 text-navy-700">
          <Icon className="size-5" aria-hidden />
        </span>
      ) : null}
      <h3 className="text-base font-semibold text-fg">{title}</h3>
      {description ? <p className="mt-1 max-w-sm text-sm text-fg-muted">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  error?: unknown;
  onRetry?: () => void;
  retrying?: boolean;
  className?: string;
  compact?: boolean;
}

export function ErrorState({ title = "Something went wrong", error, onRetry, retrying, className, compact }: ErrorStateProps) {
  const message = error instanceof Error ? error.message : "We couldn't load this right now.";
  return (
    <div role="alert" className={cn("flex flex-col items-center justify-center text-center", compact ? "px-4 py-8" : "px-6 py-14", className)}>
      <span className="mb-4 inline-flex size-11 items-center justify-center rounded-lg bg-danger-50 text-danger-600">
        <AlertTriangle className="size-5" aria-hidden />
      </span>
      <h3 className="text-base font-semibold text-fg">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-fg-muted">{message}</p>
      {onRetry ? (
        <Button variant="outline" size="sm" className="mt-5" onClick={onRetry} loading={retrying}>
          <RefreshCw /> Try again
        </Button>
      ) : null}
    </div>
  );
}
