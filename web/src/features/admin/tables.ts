import type { AdminData } from "@/lib/api-types/AdminData";

/** One admin table: which rows it shows and its columns, used on the page and in the CSV. */
export type TableKey = "waitlist" | "suggestions" | "subscribers" | "contacts";

export type Column = {
  key: string;
  label: string;
  /** Long free text: wraps and gets more room. */
  long?: boolean;
  /** Shown as a date (the CSV keeps the full timestamp). */
  date?: boolean;
};

export const TABLES: { key: TableKey; title: string; single: string; empty: string; columns: Column[] }[] = [
  {
    key: "waitlist",
    title: "Challenge waitlist",
    single: "sign-up",
    empty: "No sign-ups yet.",
    columns: [
      { key: "position", label: "#" },
      { key: "name", label: "Name" },
      { key: "phone", label: "WhatsApp" },
      { key: "email", label: "Email" },
      { key: "created_at", label: "Joined", date: true },
    ],
  },
  {
    key: "suggestions",
    title: "Suggestions",
    single: "suggestion",
    empty: "No suggestions yet.",
    columns: [
      { key: "about", label: "About" },
      { key: "title", label: "Title" },
      { key: "details", label: "Details", long: true },
      { key: "link", label: "Link" },
      { key: "contact", label: "Contact" },
      { key: "created_at", label: "Sent", date: true },
    ],
  },
  {
    key: "subscribers",
    title: "Weekly subscribers",
    single: "subscriber",
    empty: "No subscribers yet.",
    columns: [
      { key: "kind", label: "Type" },
      { key: "value", label: "WhatsApp or email" },
      { key: "source", label: "Signed up on" },
      { key: "created_at", label: "Subscribed", date: true },
    ],
  },
  {
    key: "contacts",
    title: "Contact messages",
    single: "message",
    empty: "No messages yet.",
    columns: [
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      { key: "college", label: "College" },
      { key: "message", label: "Message", long: true },
      { key: "created_at", label: "Sent", date: true },
    ],
  },
];

export const isTableKey = (v: string): v is TableKey => TABLES.some((t) => t.key === v);

export type Row = Record<string, string | number>;

export function rowsOf(data: AdminData, key: TableKey): Row[] {
  return data[key] as unknown as Row[];
}

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
