import { describe, expect, it } from "vitest";

import { toCsv, type Column } from "@/features/admin/tables";

const cols: Column[] = [
  { key: "name", label: "Name" },
  { key: "note", label: "Note" },
];

describe("admin CSV", () => {
  it("quotes commas, quotes and new lines", () => {
    const csv = toCsv(cols, [{ name: "Asha, K", note: 'said "hi"\nthen left' }]);
    expect(csv).toBe('Name,Note\r\n"Asha, K","said ""hi""\nthen left"\r\n');
  });

  it("defuses spreadsheet formulas", () => {
    const csv = toCsv(cols, [{ name: "=HYPERLINK(\"x\")", note: "+91 98765" }]);
    expect(csv.split("\r\n")[1]).toBe(`"'=HYPERLINK(""x"")",'+91 98765`);
  });
});
