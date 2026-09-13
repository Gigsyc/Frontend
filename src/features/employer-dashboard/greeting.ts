/** Time-aware salutation for the overview header. */
export function greetingFor(date: Date) {
  const h = date.getHours();
  if (h < 5) return "Still up";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function firstNameOf(fullName: string | undefined) {
  return fullName?.split(" ")[0] ?? "there";
}
