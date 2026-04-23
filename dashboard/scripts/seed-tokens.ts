/**
 * One-shot: copy existing tokens from whoop/whoop_tokens.json and
 * withings/withings_tokens.json into the Postgres oauth_tokens table.
 *
 * Run:   npm run seed:tokens
 */

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { setTokens } from "../src/lib/tokens";

const REPO_ROOT = resolve(__dirname, "..", "..");
const WHOOP_TOKENS = resolve(REPO_ROOT, "whoop", "whoop_tokens.json");
const WITHINGS_TOKENS = resolve(REPO_ROOT, "withings", "withings_tokens.json");

async function seed(kind: "whoop" | "withings", path: string) {
  try {
    const raw = readFileSync(path, "utf-8");
    const tokens = JSON.parse(raw);
    await setTokens(kind, {
      ...tokens,
      expires_at: Date.now() + (tokens.expires_in ?? 3600) * 1000,
    });
    console.log(`✓ ${kind.toUpperCase()} tokens → oauth_tokens (kind='${kind}')`);
  } catch (err) {
    console.error(`✗ Failed to seed ${kind}:`, err);
    process.exitCode = 1;
  }
}

async function main() {
  console.log(`Reading tokens from:\n  ${WHOOP_TOKENS}\n  ${WITHINGS_TOKENS}\n`);
  await seed("whoop", WHOOP_TOKENS);
  await seed("withings", WITHINGS_TOKENS);
  console.log("\nDone. Verify with:  npm run backfill:whoop -- 7");
}

main();
