import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const { databaseTarget } = await import("@/server/db");

const pooler = "aws-0-eu-west-1.pooler.supabase.com";

describe("DATABASE_URL", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("reads a Supabase pooler link", () => {
    vi.stubEnv("DATABASE_URL", `postgresql://postgres.abc:secret123@${pooler}:6543/postgres`);
    expect(databaseTarget()).toEqual({ host: pooler, port: 6543, user: "postgres.abc", password: "secret123", database: "postgres" });
  });

  it("copes with @ # / ? in the password, quotes and spaces", () => {
    vi.stubEnv("DATABASE_URL", ` "postgresql://postgres.abc:p@ss#w/rd?x@${pooler}:6543/postgres" `);
    expect(databaseTarget()).toMatchObject({ host: pooler, password: "p@ss#w/rd?x" });
  });

  it("decodes an encoded password", () => {
    vi.stubEnv("DATABASE_URL", `postgresql://postgres.abc:p%40ss@${pooler}:6543/postgres`);
    expect(databaseTarget()?.password).toBe("p@ss");
  });

  it("takes DATABASE_PASSWORD over the link", () => {
    vi.stubEnv("DATABASE_URL", `postgresql://postgres.abc:[YOUR-PASSWORD]@${pooler}:6543/postgres`);
    vi.stubEnv("DATABASE_PASSWORD", "real one");
    expect(databaseTarget()).toMatchObject({ host: pooler, password: "real one" });
  });

  it("is null when unset or not a postgres link", () => {
    vi.stubEnv("DATABASE_URL", "");
    expect(databaseTarget()).toBeNull();
    vi.stubEnv("DATABASE_URL", "https://abc.supabase.co");
    expect(databaseTarget()).toBeNull();
  });
});
