import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const controlClass =
  "w-full rounded-md border border-border-strong bg-surface px-3 text-sm text-fg placeholder:text-fg-subtle transition-[border-color,box-shadow] duration-150 hover:border-ink-400 focus:border-cyan-500 focus:outline-none focus:shadow-focus disabled:cursor-not-allowed disabled:bg-ink-50 disabled:text-fg-muted aria-invalid:border-danger-500 aria-invalid:focus:shadow-[0_0_0_3px_rgb(215_65_47/0.25)]";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, leading, trailing, ...props }, ref) => {
  if (!leading && !trailing) return <input ref={ref} className={cn(controlClass, "h-10", className)} {...props} />;
  return (
    <div className="relative">
      {leading ? <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-fg-subtle [&_svg]:size-4">{leading}</span> : null}
      <input ref={ref} className={cn(controlClass, "h-10", leading && "pl-9", trailing && "pr-9", className)} {...props} />
      {trailing ? <span className="absolute inset-y-0 right-2 flex items-center [&_svg]:size-4">{trailing}</span> : null}
    </div>
  );
});
Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn(controlClass, "min-h-24 py-2.5 leading-6", className)} {...props} />
));
Textarea.displayName = "Textarea";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(({ className, children, ...props }, ref) => (
  <div className="relative">
    <select ref={ref} className={cn(controlClass, "h-10 appearance-none pr-9", className)} {...props}>
      {children}
    </select>
    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-fg-subtle" aria-hidden />
  </div>
));
Select.displayName = "Select";
