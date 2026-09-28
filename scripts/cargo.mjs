// Runs cargo in api/ even when Rust isn't on this terminal's PATH (common on
// Windows after rustup): adds ~/.cargo/bin and, if installed, the WinLibs
// MinGW toolchain (the linker for the GNU Rust toolchain) to PATH first.
// Usage: node scripts/cargo.mjs <cargo args…>   e.g. node scripts/cargo.mjs run -q -- admin-password
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const extra = [path.join(os.homedir(), ".cargo", "bin")];

if (process.platform === "win32" && process.env.LOCALAPPDATA) {
  const pkgs = path.join(process.env.LOCALAPPDATA, "Microsoft", "WinGet", "Packages");
  if (existsSync(pkgs)) {
    for (const d of readdirSync(pkgs)) {
      const bin = path.join(pkgs, d, "mingw64", "bin");
      if (d.startsWith("BrechtSanders.WinLibs") && existsSync(bin)) extra.push(bin);
    }
  }
}

const key = Object.keys(process.env).find((k) => k.toLowerCase() === "path") ?? "PATH";
const env = { ...process.env, [key]: [...extra, process.env[key] ?? ""].join(path.delimiter) };

// stdio "inherit" keeps the terminal attached, so password prompts work.
const res = spawnSync("cargo", process.argv.slice(2), {
  cwd: path.join(root, "api"),
  env,
  stdio: "inherit",
  shell: process.platform === "win32",
});
if (res.error) {
  console.error("Couldn't start cargo. Is Rust installed? https://rustup.rs");
  process.exit(1);
}
process.exit(res.status ?? 1);
