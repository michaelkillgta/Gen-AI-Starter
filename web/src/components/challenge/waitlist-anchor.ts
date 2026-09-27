/** The waitlist form's anchor: /challenge#waitlist. */
export const WAITLIST_ID = "waitlist";

/**
 * Scrolls to the waitlist form and puts the cursor in the name field.
 * Returns false when the form isn't on this page.
 */
export function focusWaitlist(): boolean {
  const form = document.getElementById(WAITLIST_ID);
  if (!form) return false;
  const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  form.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
  form.querySelector<HTMLInputElement>("input:not([type=hidden]):not([tabindex='-1'])")?.focus({ preventScroll: true });
  if (window.location.hash !== `#${WAITLIST_ID}`) history.replaceState(history.state, "", `#${WAITLIST_ID}`);
  return true;
}
