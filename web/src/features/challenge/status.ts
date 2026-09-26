/** Short line next to the waitlist counter. */
export function waitlistStatus(count: number, goal: number): string {
  if (count >= goal) return "Goal reached, date coming soon";
  if (count === 0) return "Be one of the first";
  return `${goal - count} more to announce the date`;
}
