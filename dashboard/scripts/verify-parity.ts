/**
 * Parity check: compare a sample record between the TS port (Postgres) and the
 * Python CLI output (whoop/whoop_raw.json, withings/withings_raw.json).
 * Catches the `value * 10^unit` formula or HRV math bugs early.
 *
 *   npm run verify:parity
 */

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { desc, sql } from "drizzle-orm";
import { db } from "../src/lib/db/client";
import { whoopRecovery, withingsMeasurement } from "../src/lib/db/schema";

const REPO_ROOT = resolve(__dirname, "..", "..");
const WHOOP_RAW = resolve(REPO_ROOT, "whoop", "whoop_raw.json");
const WITHINGS_RAW = resolve(REPO_ROOT, "withings", "withings_raw.json");

function nearlyEqual(a: number, b: number, eps = 0.01) {
  return Math.abs(a - b) < eps;
}

async function checkWhoop() {
  const raw = JSON.parse(readFileSync(WHOOP_RAW, "utf-8"));
  const recs = raw.recovery ?? [];
  if (!recs.length) {
    console.log("WHOOP raw JSON has no recovery records — skipping parity check.");
    return;
  }
  const sample = recs[recs.length - 1];
  const expectedHrv = sample.score?.hrv_rmssd_milli;
  const cycleId = String(sample.cycle_id);
  const row = await db
    .select()
    .from(whoopRecovery)
    .where(sql`${whoopRecovery.cycleId} = ${cycleId}`)
    .limit(1);
  if (!row[0]) {
    console.log(`✗ WHOOP cycle ${cycleId} missing from Postgres`);
    return;
  }
  const actualHrv = row[0].hrvRmssdMilli;
  if (typeof expectedHrv === "number" && typeof actualHrv === "number" && nearlyEqual(expectedHrv, actualHrv)) {
    console.log(`✓ WHOOP parity OK (cycle ${cycleId}, HRV ${actualHrv})`);
  } else {
    console.log(`✗ WHOOP HRV mismatch: raw=${expectedHrv} vs db=${actualHrv}`);
    process.exitCode = 1;
  }
}

async function checkWithings() {
  const raw = JSON.parse(readFileSync(WITHINGS_RAW, "utf-8"));
  const ms = raw.measurements ?? [];
  if (!ms.length) {
    console.log("Withings raw JSON has no measurements — skipping parity check.");
    return;
  }
  const sample = ms[ms.length - 1];
  const expectedWeight = sample.weight_kg;
  const grpid = String(sample.grpid);
  const row = await db
    .select()
    .from(withingsMeasurement)
    .where(sql`${withingsMeasurement.grpid} = ${grpid}`)
    .limit(1);
  if (!row[0]) {
    console.log(`✗ Withings grpid ${grpid} missing from Postgres`);
    return;
  }
  const actualWeight = row[0].weightKg;
  if (typeof expectedWeight === "number" && typeof actualWeight === "number" && nearlyEqual(expectedWeight, actualWeight, 0.01)) {
    console.log(`✓ Withings parity OK (grpid ${grpid}, weight ${actualWeight} kg)`);
  } else {
    console.log(`✗ Withings weight mismatch: raw=${expectedWeight} vs db=${actualWeight}`);
    process.exitCode = 1;
  }
}

async function main() {
  await checkWhoop();
  await checkWithings();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
