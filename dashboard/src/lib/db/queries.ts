import { desc, gte, and, sql } from "drizzle-orm";
import { db } from "./client";
import {
  whoopRecovery,
  whoopSleep,
  whoopCycle,
  whoopWorkout,
  withingsMeasurement,
  syncRuns,
} from "./schema";

const daysAgo = (n: number) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d;
};

export async function getLatestRecovery() {
  const rows = await db
    .select()
    .from(whoopRecovery)
    .where(sql`${whoopRecovery.scoreState} = 'SCORED'`)
    .orderBy(desc(whoopRecovery.createdAt))
    .limit(1);
  return rows[0] ?? null;
}

export async function getLatestSleep() {
  const rows = await db
    .select()
    .from(whoopSleep)
    .where(
      and(
        sql`${whoopSleep.scoreState} = 'SCORED'`,
        sql`${whoopSleep.nap} = false`
      )
    )
    .orderBy(desc(whoopSleep.start))
    .limit(1);
  return rows[0] ?? null;
}

export async function getLatestCycle() {
  const rows = await db
    .select()
    .from(whoopCycle)
    .orderBy(desc(whoopCycle.start))
    .limit(1);
  return rows[0] ?? null;
}

export async function getRecentWorkouts(limit = 10) {
  return db
    .select()
    .from(whoopWorkout)
    .orderBy(desc(whoopWorkout.start))
    .limit(limit);
}

export async function getRecoveryWindow(days = 30) {
  return db
    .select()
    .from(whoopRecovery)
    .where(
      and(
        sql`${whoopRecovery.scoreState} = 'SCORED'`,
        gte(whoopRecovery.createdAt, daysAgo(days))
      )
    )
    .orderBy(whoopRecovery.createdAt);
}

export async function getSleepWindow(days = 30) {
  return db
    .select()
    .from(whoopSleep)
    .where(
      and(
        sql`${whoopSleep.scoreState} = 'SCORED'`,
        sql`${whoopSleep.nap} = false`,
        gte(whoopSleep.start, daysAgo(days))
      )
    )
    .orderBy(whoopSleep.start);
}

export async function getWithingsWindow(days = 30) {
  return db
    .select()
    .from(withingsMeasurement)
    .where(gte(withingsMeasurement.measuredAt, daysAgo(days)))
    .orderBy(withingsMeasurement.measuredAt);
}

export async function getLatestWithings() {
  const rows = await db
    .select()
    .from(withingsMeasurement)
    .orderBy(desc(withingsMeasurement.measuredAt))
    .limit(1);
  return rows[0] ?? null;
}

export async function getLatestSyncRun(kind: "whoop" | "withings") {
  const rows = await db
    .select()
    .from(syncRuns)
    .where(sql`${syncRuns.kind} = ${kind} AND ${syncRuns.error} IS NULL`)
    .orderBy(desc(syncRuns.endedAt))
    .limit(1);
  return rows[0] ?? null;
}

export function average(nums: Array<number | null | undefined>): number | null {
  const vals = nums.filter((n): n is number => typeof n === "number" && !Number.isNaN(n));
  if (vals.length === 0) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}
