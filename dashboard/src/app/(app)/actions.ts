"use server";

import { revalidatePath } from "next/cache";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { supplementLog, syncRuns } from "@/lib/db/schema";
import { torontoToday } from "@/lib/timezone";
import { auth } from "@/lib/auth";
import { WhoopClient } from "@/lib/whoop/client";
import { upsertWhoop } from "@/lib/whoop/sync";
import { WithingsClient } from "@/lib/withings/client";
import { upsertWithings } from "@/lib/withings/sync";

/**
 * Toggle a supplement as taken/not-taken for today (Toronto time).
 * Idempotent: re-submits flip the state.
 */
export async function toggleSupplement(supplementKey: string): Promise<void> {
  if (!supplementKey || typeof supplementKey !== "string") return;

  const date = torontoToday();
  const existing = await db
    .select({ id: supplementLog.id })
    .from(supplementLog)
    .where(
      sql`${supplementLog.date} = ${date} AND ${supplementLog.supplementKey} = ${supplementKey}`
    )
    .limit(1);

  if (existing.length > 0) {
    await db
      .delete(supplementLog)
      .where(
        sql`${supplementLog.date} = ${date} AND ${supplementLog.supplementKey} = ${supplementKey}`
      );
  } else {
    await db.insert(supplementLog).values({ date, supplementKey });
  }

  revalidatePath("/");
}

export type RefreshResult = {
  ok: boolean;
  whoopRecords: number;
  withingsRecords: number;
  errors: string[];
};

/**
 * Manually pull the last 3 days of WHOOP + Withings data on demand.
 * Session-gated — only the logged-in dashboard owner can trigger.
 */
export async function refreshData(): Promise<RefreshResult> {
  const session = await auth();
  if (!session) {
    return {
      ok: false,
      whoopRecords: 0,
      withingsRecords: 0,
      errors: ["Not authenticated"],
    };
  }

  const errors: string[] = [];
  let whoopRecords = 0;
  let withingsRecords = 0;

  // WHOOP
  const whoopStart = new Date();
  try {
    const client = await WhoopClient.create();
    const pull = await client.pullLastNDays(3);
    whoopRecords = await upsertWhoop(pull);
    await db.insert(syncRuns).values({
      kind: "whoop",
      startedAt: whoopStart,
      endedAt: new Date(),
      recordsUpserted: whoopRecords,
      error: null,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    errors.push(`WHOOP: ${msg}`);
    await db.insert(syncRuns).values({
      kind: "whoop",
      startedAt: whoopStart,
      endedAt: new Date(),
      recordsUpserted: 0,
      error: msg,
    });
  }

  // Withings
  const withingsStart = new Date();
  try {
    const client = await WithingsClient.create();
    const records = await client.pullLastNDays(3);
    withingsRecords = await upsertWithings(records);
    await db.insert(syncRuns).values({
      kind: "withings",
      startedAt: withingsStart,
      endedAt: new Date(),
      recordsUpserted: withingsRecords,
      error: null,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    errors.push(`Withings: ${msg}`);
    await db.insert(syncRuns).values({
      kind: "withings",
      startedAt: withingsStart,
      endedAt: new Date(),
      recordsUpserted: 0,
      error: msg,
    });
  }

  revalidatePath("/");
  revalidatePath("/trends");

  return {
    ok: errors.length === 0,
    whoopRecords,
    withingsRecords,
    errors,
  };
}
