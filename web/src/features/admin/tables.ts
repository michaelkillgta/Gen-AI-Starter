import type { AdminData } from "@/lib/api-types/AdminData";

/** The admin sections: each is one table, at /admin/<key>. */
export type TableKey = "waitlist" | "suggestions" | "subscribers" | "contacts";

export type Column = {
  key: string;
  label: string;
  /** Long free text: wraps and gets more room. */
  long?: boolean;
  /** Shown as a date (the CSV keeps the full timestamp). */
  date?: boolean;
  /** Sorts as a number. */
  numeric?: boolean;
  /** Shown as a mailto: or WhatsApp link in the details. */
  contact?: "email" | "phone" | "auto";
};

export type TableDef = {
  key: TableKey;
  title: string;
  /** One row, in words: "sign-up", "suggestion"… */
  single: string;
  empty: string;
  columns: Column[];
  /** The two columns that describe a row in lists (Overview, details title). */
  titleKey: string;
  subKey: string;
};

export const TABLES: TableDef[] = [
  {
    key: "waitlist",
    title: "Challenge waitlist",
    single: "sign-up",
    empty: "No sign-ups yet.",
    titleKey: "name",
    subKey: "email",
    columns: [
      { key: "position", label: "#", numeric: true },
      { key: "name", label: "Name" },
      { key: "phone", label: "WhatsApp", contact: "phone" },
      { key: "email", label: "Email", contact: "email" },
      { key: "created_at", label: "Joined", date: true },
    ],
  },
  {
    key: "suggestions",
    title: "Suggestions",
    single: "suggestion",
    empty: "No suggestions yet.",
    titleKey: "title",
    subKey: "about",
    columns: [
      { key: "about", label: "About" },
      { key: "title", label: "Title" },
      { key: "details", label: "Details", long: true },
      { key: "link", label: "Link" },
      { key: "contact", label: "Contact", contact: "auto" },
      { key: "created_at", label: "Sent", date: true },
    ],
  },
  {
    key: "subscribers",
    title: "Weekly subscribers",
    single: "subscriber",
    empty: "No subscribers yet.",
    titleKey: "value",
    subKey: "source",
    columns: [
      { key: "kind", label: "Type" },
      { key: "value", label: "WhatsApp or email", contact: "auto" },
      { key: "source", label: "Signed up on" },
      { key: "created_at", label: "Subscribed", date: true },
    ],
  },
  {
    key: "contacts",
    title: "Contact messages",
    single: "message",
    empty: "No messages yet.",
    titleKey: "name",
    subKey: "message",
    columns: [
      { key: "name", label: "Name" },
      { key: "email", label: "Email", contact: "email" },
      { key: "college", label: "College" },
      { key: "message", label: "Message", long: true },
      { key: "created_at", label: "Sent", date: true },
    ],
  },
];

export const isTableKey = (v: string): v is TableKey => TABLES.some((t) => t.key === v);
export const tableDef = (key: TableKey) => TABLES.find((t) => t.key === key)!;

export type Row = Record<string, string | number>;

export function rowsOf(data: AdminData, key: TableKey): Row[] {
  return data[key] as unknown as Row[];
}

/** A row's id in links (?open=…): its timestamp, unique in practice. */
export const rowId = (row: Row) => String(row.created_at);

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
export const isThisWeek = (iso: string, now = Date.now()) => now - new Date(iso).getTime() < WEEK_MS;

/** "27 Sep 2026, 11:31" in India time. */
export function formatWhen(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/** "5 min ago", "3 h ago", "2 days ago", then the date. */
export function timeAgo(iso: string, now = Date.now()): string {
  const mins = Math.round((now - new Date(iso).getTime()) / 60000);
  if (Number.isNaN(mins)) return iso;
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} ${days === 1 ? "day" : "days"} ago`;
  return formatWhen(iso);
}

/** A mailto: or WhatsApp link for a contact value, if it looks like one. */
export function contactHref(value: string, kind: Column["contact"]): string | null {
  const v = value.trim();
  if (!v) return null;
  const isEmail = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);
  const digits = v.replace(/[^\d]/g, "");
  if ((kind === "email" || kind === "auto") && isEmail) return `mailto:${v}`;
  if ((kind === "phone" || kind === "auto") && !isEmail && digits.length >= 10) return `https://wa.me/${digits}`;
  return null;
}

/**
 * RFC 4180 CSV. Cells that a spreadsheet would run as a formula (=, +, -, @, tab,
 * carriage return) get a leading apostrophe, so a sign-up can't smuggle one in.
 */
export function toCsv(columns: Column[], rows: Row[]): string {
  const cell = (v: unknown) => {
    let s = v === null || v === undefined ? "" : String(v);
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
    return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [columns.map((c) => cell(c.label)).join(",")];
  for (const r of rows) lines.push(columns.map((c) => cell(r[c.key])).join(","));
  return lines.join("\r\n") + "\r\n";
}
