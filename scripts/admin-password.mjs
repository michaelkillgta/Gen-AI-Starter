// Sets the admin password: `pnpm admin:password`.
// Asks for it twice without showing it, then writes only its argon2id hash
// (base64-encoded) to web/.env.local and prints it to paste into Vercel as
// ADMIN_PASSWORD_HASH.
import crypto from "node:crypto";
import fs from "node:fs";

import { webEnvFile } from "./env.mjs";

const MIN_LENGTH = 12;

/** Reads one line from the terminal without echoing it. */
function ask(prompt) {
  return new Promise((resolve) => {
    process.stdout.write(prompt);
    const stdin = process.stdin;
    if (!stdin.isTTY) {
      console.error("\nRun this in a terminal, so the password can be typed in privately.");
      process.exit(1);
    }
    stdin.setRawMode(true);
    stdin.resume();
    let value = "";
    const onData = (buf) => {
      for (const ch of buf.toString("utf8")) {
        if (ch === "\r" || ch === "\n") {
          stdin.setRawMode(false);
          stdin.pause();
          stdin.off("data", onData);
          process.stdout.write("\n");
          return resolve(value);
        }
        if (ch === "\u0003") process.exit(130); // Ctrl+C
        if (ch === "\u007f" || ch === "\b") value = value.slice(0, -1);
        else value += ch;
      }
    };
    stdin.on("data", onData);
  });
}

/** argon2id in PHC form, with the same settings the Rust API used (19 MiB, 2 passes). */
function hash(password) {
  const salt = crypto.randomBytes(16);
  const params = { memory: 19456, passes: 2, parallelism: 1 };
  const out = crypto.argon2Sync("argon2id", { message: password, nonce: salt, tagLength: 32, ...params });
  const b64 = (b) => b.toString("base64").replace(/=+$/, "");
  return `$argon2id$v=19$m=${params.memory},t=${params.passes},p=${params.parallelism}$${b64(salt)}$${b64(out)}`;
}

const password = await ask("New admin password: ");
if ([...password].length < MIN_LENGTH) {
  console.error(`Please use at least ${MIN_LENGTH} characters.`);
  process.exit(1);
}
if ((await ask("Type it again: ")) !== password) {
  console.error("The two didn't match. Nothing was changed.");
  process.exit(1);
}

// Base64, so the hash has no $ signs for Next.js to rewrite (see web/src/server/admin.ts).
const h = Buffer.from(hash(password)).toString("base64");
const line = `ADMIN_PASSWORD_HASH=${h}`;
const old = fs.existsSync(webEnvFile) ? fs.readFileSync(webEnvFile, "utf8") : "";
const kept = old.split(/\r?\n/).filter((l) => l && !l.startsWith("ADMIN_PASSWORD_HASH="));
fs.writeFileSync(webEnvFile, [...kept, line].join("\n") + "\n");

console.log("\nSaved to web/.env.local. Restart the site to use it.");
console.log("For Vercel, add this as the ADMIN_PASSWORD_HASH environment variable (exactly as shown):\n");
console.log(h);
