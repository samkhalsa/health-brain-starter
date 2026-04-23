/**
 * Backfill historical WHOOP data into Postgres.
 *
 *   npm run backfill:whoop          # default 180 days
 *   npm run backfill:whoop -- 30    # last 30 days
 *   npm run backfill:whoop -- 2026-01-01 2026-04-21
 */

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { WhoopClient } from "../src/lib/whoop/client";
import { upsertWhoop } from "../src/lib/whoop/sync";

async function main() {
  const args = process.argv.slice(2);
  const client = await WhoopClient.create();

  let pull;
  if (args.length === 0) {
    pull = await client.pullLastNDays(180);
  } else if (args.length === 1) {
    pull = await client.pullLastNDays(parseInt(args[0], 10));
  } else if (args.length === 2) {
    pull = await client.pullRange(new Date(args[0]), new Date(args[1]));
  } else {
    console.error("Usage: backfill-whoop.ts [days | start end]");
    process.exit(1);
  }

  console.log(
    `Fetched: ${pull.recovery.length} recovery / ${pull.sleep.length} sleep / ` +
      `${pull.cycles.length} cycles / ${pull.workouts.length} workouts`
  );
  const upserted = await upsertWhoop(pull);
  console.log(`Upserted ${upserted} records into Postgres.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
