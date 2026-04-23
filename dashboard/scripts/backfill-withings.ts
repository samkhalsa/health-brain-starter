/**
 * Backfill historical Withings data into Postgres.
 *
 *   npm run backfill:withings           # default 365 days
 *   npm run backfill:withings -- 30
 *   npm run backfill:withings -- 2025-05-01 2026-04-21
 */

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { WithingsClient } from "../src/lib/withings/client";
import { upsertWithings } from "../src/lib/withings/sync";

async function main() {
  const args = process.argv.slice(2);
  const client = await WithingsClient.create();

  let records;
  if (args.length === 0) {
    records = await client.pullLastNDays(365);
  } else if (args.length === 1) {
    records = await client.pullLastNDays(parseInt(args[0], 10));
  } else if (args.length === 2) {
    records = await client.pullRange(new Date(args[0]), new Date(args[1]));
  } else {
    console.error("Usage: backfill-withings.ts [days | start end]");
    process.exit(1);
  }

  console.log(`Fetched ${records.length} weigh-ins.`);
  const upserted = await upsertWithings(records);
  console.log(`Upserted ${upserted} records into Postgres.`);
  if (records.length > 0) {
    console.log(`  First: ${records[0].date}  weight=${records[0].weight_kg} kg`);
    console.log(`  Last:  ${records[records.length - 1].date}  weight=${records[records.length - 1].weight_kg} kg`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
