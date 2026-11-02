import { describe, expect, it } from "vitest";

import { email, name, phone, url } from "@/server/validate";

// The same cases the Rust API's form checks were tested with.
describe("form checks", () => {
  it("normalises Indian numbers", () => {
    for (const input of ["98765 43210", "+91 98765-43210", "919876543210", "09876543210", "(987) 654-3210"]) {
      expect(phone(input), input).toBe("+919876543210");
    }
  });

  it("rejects bad numbers", () => {
    for (const input of ["", "12345", "5876543210", "+91 12345 67890", "98765abc10", "+91"]) {
      expect(() => phone(input), input).toThrow();
    }
  });

  it("needs a + for other countries", () => {
    expect(phone("+44 7700 900123")).toBe("+447700900123");
  });

  it("checks emails", () => {
    expect(email(" Uma@Example.COM ")).toBe("uma@example.com");
    for (const bad of ["", "uma", "uma@", "@x.com", "uma@x", "a b@x.com", "uma@x..com"]) {
      expect(() => email(bad), bad).toThrow();
    }
  });

  it("checks names", () => {
    expect(name("  Uma   K ")).toBe("Uma K");
    expect(() => name("U")).toThrow();
    expect(() => name("<script>")).toThrow();
  });

  it("checks links", () => {
    expect(url("github.com/x/y")).toBe("https://github.com/x/y");
    expect(() => url("not a link")).toThrow();
    expect(url("")).toBe("");
  });
});
