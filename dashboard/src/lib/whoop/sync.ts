import { db } from "@/lib/db/client";
import {
  whoopRecovery,
  whoopSleep,
  whoopCycle,
  whoopWorkout,
} from "@/lib/db/schema";
import type { WhoopPull, WhoopRecord } from "./client";

function pickNum(obj: Record<string, unknown> | undefined, key: string): number | null {
  if (!obj) return null;
  const v = obj[key];
  return typeof v === "number" ? v : null;
}

function toDate(s: unknown): Date | null {
  if (typeof s !== "string") return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

function toIsoDate(s: unknown): string | null {
  const d = toDate(s);
  return d ? d.toISOString().slice(0, 10) : null;
}

export async function upsertWhoop(pull: WhoopPull): Promise<number> {
  let count = 0;
  count += await upsertRecovery(pull.recovery);
  count += await upsertSleep(pull.sleep);
  count += await upsertCycles(pull.cycles);
  count += await upsertWorkouts(pull.workouts);
  return count;
}

async function upsertRecovery(records: WhoopRecord[]): Promise<number> {
  if (!records.length) return 0;
  const rows = records.map((r) => {
    const score = (r.score as Record<string, unknown>) ?? {};
    return {
      cycleId: String(r.cycle_id ?? ""),
      sleepId: r.sleep_id ? String(r.sleep_id) : null,
      userId: r.user_id ? String(r.user_id) : null,
      createdAt: toDate(r.created_at),
      date: toIsoDate(r.created_at),
      scoreState: (r.score_state as string | null) ?? null,
      recoveryScore: pickNum(score, "recovery_score"),
      hrvRmssdMilli: pickNum(score, "hrv_rmssd_milli"),
      restingHeartRate: pickNum(score, "resting_heart_rate"),
      spo2Percentage: pickNum(score, "spo2_percentage"),
      skinTempCelsius: pickNum(score, "skin_temp_celsius"),
      raw: r,
      updatedAt: new Date(),
    };
  });

  const validRows = rows.filter((r) => r.cycleId !== "");
  if (!validRows.length) return 0;

  await db
    .insert(whoopRecovery)
    .values(validRows)
    .onConflictDoUpdate({
      target: whoopRecovery.cycleId,
      set: {
        sleepId: sqlExcluded("sleep_id"),
        userId: sqlExcluded("user_id"),
        createdAt: sqlExcluded("created_at"),
        date: sqlExcluded("date"),
        scoreState: sqlExcluded("score_state"),
        recoveryScore: sqlExcluded("recovery_score"),
        hrvRmssdMilli: sqlExcluded("hrv_rmssd_milli"),
        restingHeartRate: sqlExcluded("resting_heart_rate"),
        spo2Percentage: sqlExcluded("spo2_percentage"),
        skinTempCelsius: sqlExcluded("skin_temp_celsius"),
        raw: sqlExcluded("raw"),
        updatedAt: sqlExcluded("updated_at"),
      },
    });
  return validRows.length;
}

async function upsertSleep(records: WhoopRecord[]): Promise<number> {
  if (!records.length) return 0;
  const rows = records.map((r) => {
    const score = (r.score as Record<string, unknown>) ?? {};
    const stages = (score.stage_summary as Record<string, unknown>) ?? {};
    return {
      id: String(r.id ?? ""),
      cycleId: r.cycle_id ? String(r.cycle_id) : null,
      userId: r.user_id ? String(r.user_id) : null,
      start: toDate(r.start),
      end: toDate(r.end),
      nap: Boolean(r.nap),
      scoreState: (r.score_state as string | null) ?? null,
      totalInBedMs: pickNum(stages, "total_in_bed_time_milli") as number | null,
      totalLightMs: pickNum(stages, "total_light_sleep_time_milli") as number | null,
      totalDeepMs: pickNum(stages, "total_slow_wave_sleep_time_milli") as number | null,
      totalRemMs: pickNum(stages, "total_rem_sleep_time_milli") as number | null,
      totalAwakeMs: pickNum(stages, "total_awake_time_milli") as number | null,
      sleepEfficiencyPct: pickNum(score, "sleep_efficiency_percentage"),
      sleepPerformancePct: pickNum(score, "sleep_performance_percentage"),
      sleepConsistencyPct: pickNum(score, "sleep_consistency_percentage"),
      respiratoryRate: pickNum(score, "respiratory_rate"),
      raw: r,
      updatedAt: new Date(),
    };
  });

  const valid = rows.filter((r) => r.id !== "");
  if (!valid.length) return 0;

  await db
    .insert(whoopSleep)
    .values(valid)
    .onConflictDoUpdate({
      target: whoopSleep.id,
      set: {
        cycleId: sqlExcluded("cycle_id"),
        userId: sqlExcluded("user_id"),
        start: sqlExcluded("start"),
        end: sqlExcluded("end"),
        nap: sqlExcluded("nap"),
        scoreState: sqlExcluded("score_state"),
        totalInBedMs: sqlExcluded("total_in_bed_ms"),
        totalLightMs: sqlExcluded("total_light_ms"),
        totalDeepMs: sqlExcluded("total_deep_ms"),
        totalRemMs: sqlExcluded("total_rem_ms"),
        totalAwakeMs: sqlExcluded("total_awake_ms"),
        sleepEfficiencyPct: sqlExcluded("sleep_efficiency_pct"),
        sleepPerformancePct: sqlExcluded("sleep_performance_pct"),
        sleepConsistencyPct: sqlExcluded("sleep_consistency_pct"),
        respiratoryRate: sqlExcluded("respiratory_rate"),
        raw: sqlExcluded("raw"),
        updatedAt: sqlExcluded("updated_at"),
      },
    });
  return valid.length;
}

async function upsertCycles(records: WhoopRecord[]): Promise<number> {
  if (!records.length) return 0;
  const rows = records.map((r) => {
    const score = (r.score as Record<string, unknown>) ?? {};
    return {
      cycleId: String(r.id ?? ""),
      userId: r.user_id ? String(r.user_id) : null,
      start: toDate(r.start),
      end: toDate(r.end),
      scoreState: (r.score_state as string | null) ?? null,
      strain: pickNum(score, "strain"),
      averageHeartRate: pickNum(score, "average_heart_rate"),
      maxHeartRate: pickNum(score, "max_heart_rate"),
      kilojoule: pickNum(score, "kilojoule"),
      raw: r,
      updatedAt: new Date(),
    };
  });

  const valid = rows.filter((r) => r.cycleId !== "");
  if (!valid.length) return 0;

  await db
    .insert(whoopCycle)
    .values(valid)
    .onConflictDoUpdate({
      target: whoopCycle.cycleId,
      set: {
        userId: sqlExcluded("user_id"),
        start: sqlExcluded("start"),
        end: sqlExcluded("end"),
        scoreState: sqlExcluded("score_state"),
        strain: sqlExcluded("strain"),
        averageHeartRate: sqlExcluded("average_heart_rate"),
        maxHeartRate: sqlExcluded("max_heart_rate"),
        kilojoule: sqlExcluded("kilojoule"),
        raw: sqlExcluded("raw"),
        updatedAt: sqlExcluded("updated_at"),
      },
    });
  return valid.length;
}

async function upsertWorkouts(records: WhoopRecord[]): Promise<number> {
  if (!records.length) return 0;
  const rows = records.map((r) => {
    const score = (r.score as Record<string, unknown>) ?? {};
    const start = toDate(r.start);
    const end = toDate(r.end);
    const durationMin = start && end ? (end.getTime() - start.getTime()) / 60000 : null;
    return {
      id: String(r.id ?? ""),
      cycleId: r.cycle_id ? String(r.cycle_id) : null,
      userId: r.user_id ? String(r.user_id) : null,
      sportName: (r.sport_name as string | null) ?? null,
      start,
      end,
      scoreState: (r.score_state as string | null) ?? null,
      durationMin,
      strain: pickNum(score, "strain"),
      averageHeartRate: pickNum(score, "average_heart_rate"),
      maxHeartRate: pickNum(score, "max_heart_rate"),
      kilojoule: pickNum(score, "kilojoule"),
      distanceMeters: pickNum(score, "distance_meter"),
      raw: r,
      updatedAt: new Date(),
    };
  });

  const valid = rows.filter((r) => r.id !== "");
  if (!valid.length) return 0;

  await db
    .insert(whoopWorkout)
    .values(valid)
    .onConflictDoUpdate({
      target: whoopWorkout.id,
      set: {
        cycleId: sqlExcluded("cycle_id"),
        userId: sqlExcluded("user_id"),
        sportName: sqlExcluded("sport_name"),
        start: sqlExcluded("start"),
        end: sqlExcluded("end"),
        scoreState: sqlExcluded("score_state"),
        durationMin: sqlExcluded("duration_min"),
        strain: sqlExcluded("strain"),
        averageHeartRate: sqlExcluded("average_heart_rate"),
        maxHeartRate: sqlExcluded("max_heart_rate"),
        kilojoule: sqlExcluded("kilojoule"),
        distanceMeters: sqlExcluded("distance_meters"),
        raw: sqlExcluded("raw"),
        updatedAt: sqlExcluded("updated_at"),
      },
    });
  return valid.length;
}

// helper: generates sql`excluded.<col>` for upsert SET clauses
import { sql } from "drizzle-orm";
function sqlExcluded(col: string) {
  return sql.raw(`excluded."${col}"`);
}
