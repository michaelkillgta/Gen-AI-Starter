/**
 * Input checks for the forms. Each returns the cleaned value, or throws a
 * FieldError with a friendly message.
 */

export class FieldError extends Error {}

const collapseSpaces = (s: string) => s.split(/\s+/).filter(Boolean).join(" ");
const CONTROL = /[\u0000-\u001f\u007f-\u009f]/;

export function name(raw: string): string {
  const v = collapseSpaces(raw);
  const n = [...v].length;
  if (n === 0) throw new FieldError("Please enter your name.");
  if (n === 1) throw new FieldError("Please enter your full name.");
  if (n > 80) throw new FieldError("That name is too long.");
  if (CONTROL.test(v) || /[<>{}]/.test(v)) throw new FieldError("Please use letters only.");
  return v;
}

/** Indian mobile numbers become +91XXXXXXXXXX. Other countries need a leading +. */
export function phone(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) throw new FieldError("Please enter your WhatsApp number.");
  if (/[^0-9 +\-().]/.test(trimmed)) throw new FieldError("Use digits only, for example +91 98765 43210.");
  const plus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");

  const indian = (d: string) => d.length === 10 && /^[6-9]/.test(d);
  let local = "";
  if (!plus && digits.length === 11 && digits.startsWith("0")) local = digits.slice(1);
  else if (digits.length === 12 && digits.startsWith("91")) local = digits.slice(2);
  else if (!plus) local = digits;
  if (indian(local)) return `+91${local}`;
  if (plus && digits.length >= 8 && digits.length <= 15 && !digits.startsWith("91")) return `+${digits}`;
  throw new FieldError("Enter a 10-digit mobile number, for example 98765 43210.");
}

export function email(raw: string): string {
  const v = raw.trim().toLowerCase();
  if (!v) throw new FieldError("Please enter your email.");
  const at = v.indexOf("@");
  if (at < 0) throw new FieldError("That email doesn't look right.");
  const local = v.slice(0, at);
  const domain = v.slice(at + 1);
  const ok =
    new TextEncoder().encode(v).length <= 254 &&
    local.length > 0 &&
    new TextEncoder().encode(local).length <= 64 &&
    !domain.includes("@") &&
    domain.includes(".") &&
    !domain.startsWith(".") &&
    !domain.endsWith(".") &&
    !domain.includes("..") &&
    !/\s/.test(v) &&
    !CONTROL.test(v);
  if (!ok) throw new FieldError("That email doesn't look right.");
  return v;
}

/** Optional free text: trimmed, capped in length. */
export function text(raw: string, max: number, what: string): string {
  const v = raw.trim();
  if ([...v].length > max) throw new FieldError(what);
  return v;
}

export function url(raw: string): string {
  const v = raw.trim();
  if (!v) return "";
  const withScheme = v.startsWith("http://") || v.startsWith("https://") ? v : `https://${v}`;
  if (withScheme.length > 500 || /\s/.test(withScheme) || !withScheme.slice(8).includes(".")) {
    throw new FieldError("That link doesn't look right.");
  }
  return withScheme;
}
