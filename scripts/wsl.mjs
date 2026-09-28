// Runs a script from scripts/wsl/ inside Ubuntu (WSL), from this repo folder.
// On this Windows laptop the API is built and run in Ubuntu, because Smart App
// Control blocks freshly compiled Windows programs (see docs/decisions.md).
// Usage: node scripts/wsl.mjs <db|cargo> [args…]   e.g. node scripts/wsl.mjs cargo run
// FT_WSL_DISTRO picks the distribution (default Ubuntu-24.04).
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const [name, ...args] = process.argv.slice(2);
if (!["db", "cargo"].includes(name)) {
  console.error("usage: node scripts/wsl.mjs <db|cargo> [args…]");
  process.exit(2);
}
const distro = process.env.FT_WSL_DISTRO ?? "Ubuntu-24.04";

// wsl.exe starts in the matching /mnt/c/… folder when given a Windows cwd.
const res = spawnSync("wsl.exe", ["-d", distro, "--", "bash", `scripts/wsl/${name}.sh`, ...args], {
  cwd: root,
  stdio: "inherit",
});
if (res.error) {
  console.error(`Couldn't start WSL (${distro}). Is Ubuntu installed? wsl --install -d Ubuntu-24.04`);
  process.exit(1);
}
process.exit(res.status ?? 1);
