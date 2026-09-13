"use client";

import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Third-party sign-in marks and buttons.
 *
 * Both marks are the providers' official assets, reproduced exactly. Never redraw,
 * recolour or restyle them, and never place them on a button that collects credentials.
 */

/** Google's official four-colour "G". */
export function GoogleMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 18 18" className={cn("size-[18px]", className)} aria-hidden focusable="false">
      <path fill="#4285F4" d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9087c1.7018-1.5668 2.6836-3.874 2.6836-6.615z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.4673-.806 5.9564-2.1805l-2.9087-2.2581c-.8059.54-1.8368.859-3.0477.859-2.344 0-4.3282-1.5831-5.036-3.7104H.9574v2.3318C2.4382 15.9832 5.4818 18 9 18z" />
      <path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.2822-1.1168-.2822-1.71s.1023-1.17.2822-1.71V4.9582H.9573A8.9965 8.9965 0 0 0 0 9c0 1.4523.3477 2.8268.9573 4.0418L3.964 10.71z" />
      <path fill="#EA4335" d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5813-2.5814C13.4632.8918 11.426 0 9 0 5.4818 0 2.4382 2.0168.9573 4.9582L3.964 7.29C4.6718 5.1627 6.656 3.5795 9 3.5795z" />
    </svg>
  );
}

/** Apple's official mark. Single colour, inherits currentColor per Apple's guidance. */
export function AppleMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-[19px]", className)} fill="currentColor" aria-hidden focusable="false">
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.08zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

interface SocialButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  label?: string;
}

/** Google's prescribed light button: white surface, hairline border, mark on the left. */
export const GoogleButton = forwardRef<HTMLButtonElement, SocialButtonProps>(
  ({ className, loading, label = "Continue with Google", disabled, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex h-11 w-full items-center justify-center gap-3 rounded-md border border-border-strong bg-white px-4 text-sm font-medium text-ink-800 transition-colors hover:bg-ink-50 focus-visible:outline-none focus-visible:shadow-focus disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    >
      {loading ? <Loader2 className="size-[18px] animate-spin text-ink-500" aria-hidden /> : <GoogleMark />}
      {label}
    </button>
  ),
);
GoogleButton.displayName = "GoogleButton";

/** Apple's prescribed black button: white mark and label, same height as the Google one. */
export const AppleButton = forwardRef<HTMLButtonElement, SocialButtonProps>(
  ({ className, loading, label = "Continue with Apple", disabled, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex h-11 w-full items-center justify-center gap-2.5 rounded-md bg-[#000000] px-4 text-sm font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:shadow-focus disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    >
      {loading ? <Loader2 className="size-[18px] animate-spin" aria-hidden /> : <AppleMark className="-mt-0.5" />}
      {label}
    </button>
  ),
);
AppleButton.displayName = "AppleButton";

interface AuthDividerProps {
  label?: string;
  /** Id put on the label itself, so what follows can be named by it with `aria-labelledby`. */
  labelId?: string;
  className?: string;
}

/** "──── OR ────" separator between the provider buttons and the email form. */
export function AuthDivider({ label = "or", labelId, className }: AuthDividerProps) {
  return (
    <div className={cn("flex items-center gap-3", className)} role="separator" aria-orientation="horizontal">
      <span className="h-px flex-1 bg-border" />
      <span id={labelId} className="text-xs font-medium uppercase tracking-wider text-fg-subtle">{label}</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}
