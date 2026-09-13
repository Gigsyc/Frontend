import { MIN_PASSWORD_LENGTH } from "@/data/auth";
import { cn } from "@/lib/utils";

const SEGMENTS = [0, 1, 2];
const TONE = ["bg-warning-500", "bg-warning-500", "bg-success-500"] as const;

/**
 * Length first, then variety. Three is as high as it goes — a meter with five steps
 * invites people to chase the last one, and the service only ever asks for eight
 * characters.
 */
export function passwordScore(value: string): number {
  if (!value) return 0;
  const variety = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((rule) => rule.test(value)).length;
  let score = 0;
  if (value.length >= MIN_PASSWORD_LENGTH) score += 1;
  if (value.length >= 12) score += 1;
  if (variety >= 3) score += 1;
  return Math.min(score, 3);
}

/**
 * Three quiet segments under the field. Deliberately decorative: the one rule that
 * actually decides anything is the field's own "At least 8 characters", so colour is
 * never the only thing carrying a requirement.
 */
export function PasswordStrength({ value, className }: { value: string; className?: string }) {
  const score = passwordScore(value);
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
