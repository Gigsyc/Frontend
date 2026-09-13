"use client";

import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-[background-color,color,border-color,box-shadow,transform] duration-150 ease-out select-none disabled:pointer-events-none disabled:opacity-50 active:scale-[0.985] [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-navy-900 text-white hover:bg-navy-800 shadow-[inset_0_-1px_0_rgb(0_0_0/0.15)]",
        accent: "bg-amber-500 text-navy-900 hover:bg-amber-400 shadow-[inset_0_-1px_0_rgb(0_0_0/0.08)]",
        secondary: "bg-navy-50 text-navy-900 hover:bg-navy-100",
        outline: "border border-border-strong bg-surface text-fg hover:bg-ink-50 hover:border-ink-400",
        ghost: "text-fg hover:bg-ink-100",
        danger: "bg-danger-500 text-white hover:bg-danger-600",
        "danger-soft": "bg-danger-50 text-danger-700 hover:bg-danger-100",
        link: "text-navy-700 underline-offset-4 hover:underline h-auto px-0",
        "on-dark": "bg-white/10 text-white hover:bg-white/15 border border-white/15",
      },
      size: {
        sm: "h-8 px-3 text-[13px] [&_svg]:size-3.5",
        md: "h-10 px-4 text-sm [&_svg]:size-4",
        lg: "h-12 px-5 text-[15px] [&_svg]:size-[18px]",
        icon: "size-10 [&_svg]:size-[18px]",
        "icon-sm": "size-8 [&_svg]:size-4",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, loading, disabled, children, type, ...props }, ref) => {
    const classes = cn(buttonVariants({ variant, size }), className);
    if (asChild) {
      // Slot requires exactly one child; loading spinners are not supported in asChild mode.
      return (
        <Slot.Root ref={ref} className={classes} aria-disabled={disabled || undefined} {...props}>
          {children}
        </Slot.Root>
      );
    }
    return (
      <button ref={ref} type={type ?? "button"} className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
        {loading ? <Loader2 className="animate-spin" aria-hidden /> : null}
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";
