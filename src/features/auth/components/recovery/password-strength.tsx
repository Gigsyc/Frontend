import { MIN_PASSWORD_LENGTH } from "@/data/auth";
import { cn } from "@/lib/utils";

/**
 * The same meter /signup shows, to the pixel: three segments, warning then success, and
 * nothing a screen reader has to listen to. It is deliberately decorative — the only rule
 * that decides anything is the field's own "At least 8 characters", so a password the form
 * will accept is never painted as an error.
 *
 * Kept beside the recovery form rather than shared: if the two ever have to move together,
 * promote one copy to `@/components/ui/password-strength.tsx` and import it in both.
 */

const SEGMENTS = [0, 1, 2];
const TONE = ["bg-warning-500", "bg-warning-500", "bg-success-500"] as const;

/** Length first, then variety. Three is as high as it goes. */
export function passwordStrength(value: string): number {
  if (!value) return 0;
  const variety = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((rule) => rule.test(value)).length;
  let score = 0;
  if (value.length >= MIN_PASSWORD_LENGTH) score += 1;
  if (value.length >= 12) score += 1;
  if (variety >= 3) score += 1;
  return Math.min(score, 3);
}

export function PasswordStrength({ value, className }: { value: string; className?: string }) {
  const score = passwordStrength(value);
  return (
    <div className={cn("flex gap-1.5", className)} aria-hidden>
      {SEGMENTS.map((i) => (
        <span
          key={i}
          className={cn(
            "h-1 flex-1 rounded-full transition-colors duration-200",
            i < score ? TONE[score - 1] : "bg-ink-200",
          )}
        />
      ))}
    </div>
  );
}
