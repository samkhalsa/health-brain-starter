import { sql, desc, and, gte } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  whoopRecovery,
  whoopSleep,
  whoopCycle,
  whoopWorkout,
  withingsMeasurement,
  syncRuns,
  journalEntry,
  supplementLog,
} from "@/lib/db/schema";
import { prescribe, type Prescription } from "@/lib/prescribe/engine";
import { average } from "@/lib/db/queries";
import { userToday } from "@/lib/timezone";

function daysAgo(n: number): Date {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d;
}

export type TodayData = {
  recovery: {
    score: number | null;
    hrv: number | null;
    hrv30dAvg: number | null;
    hrv7dAvg: number | null;
    rhr: number | null;
    rhr30dAvg: number | null;
    spo2: number | null;
    skinTemp: number | null;
    updatedAt: Date | null;
  };
  sleep: {
    hours: number | null;
    efficiencyPct: number | null;
    deepMs: number | null;
    remMs: number | null;
    lightMs: number | null;
    awakeMs: number | null;
  };
  strain: {
    today: number | null;
    weekAvg: number | null;
  };
  workouts: Array<{ sport: string | null; strain: number | null; start: Date | null }>;
  weight: {
    latestKg: number | null;
    latestLb: number | null;
    fatRatioPct: number | null;
    leanMassKg: number | null;
    muscleMassKg: number | null;
    measuredAt: Date | null;
    avg7dKg: number | null;
    avg30dKg: number | null;
    twelveMonthMinKg: number | null;
    daysSinceWeighIn: number | null;
    sparkline14d: Array<{ date: string; weightLb: number }>;
  };
  lastSync: {
    whoop: Date | null;
    withings: Date | null;
  };
  supplementsTakenKeys: string[];
  prescription: Prescription;
};

export async function getTodayData(now = new Date()): Promise<TodayData> {
  const [latestRec, rec30d, latestSleepRow, latestCycle, cycle7d, recentWorkouts,
    latestWithings, withings30d, withings7d, withings365d, lastWhoopSync, lastWithingsSync,
    recentJournal, todaySupplements] = await Promise.all([
    db.select().from(whoopRecovery)
      .where(sql`${whoopRecovery.scoreState} = 'SCORED'`)
      .orderBy(desc(whoopRecovery.createdAt)).limit(1),
    db.select().from(whoopRecovery)
      .where(and(sql`${whoopRecovery.scoreState} = 'SCORED'`, gte(whoopRecovery.createdAt, daysAgo(30))))
      .orderBy(whoopRecovery.createdAt),
    db.select().from(whoopSleep)
      .where(and(sql`${whoopSleep.scoreState} = 'SCORED'`, sql`${whoopSleep.nap} = false`))
      .orderBy(desc(whoopSleep.start)).limit(1),
    db.select().from(whoopCycle).orderBy(desc(whoopCycle.start)).limit(1),
    db.select().from(whoopCycle)
      .where(gte(whoopCycle.start, daysAgo(7)))
      .orderBy(whoopCycle.start),
    db.select().from(whoopWorkout)
      .where(gte(whoopWorkout.start, daysAgo(2)))
      .orderBy(desc(whoopWorkout.start)).limit(5),
    db.select().from(withingsMeasurement).orderBy(desc(withingsMeasurement.measuredAt)).limit(1),
    db.select().from(withingsMeasurement)
      .where(gte(withingsMeasurement.measuredAt, daysAgo(30)))
      .orderBy(withingsMeasurement.measuredAt),
    db.select().from(withingsMeasurement)
      .where(gte(withingsMeasurement.measuredAt, daysAgo(7)))
      .orderBy(withingsMeasurement.measuredAt),
    db.select().from(withingsMeasurement)
      .where(gte(withingsMeasurement.measuredAt, daysAgo(365)))
      .orderBy(withingsMeasurement.measuredAt),
    db.select().from(syncRuns)
      .where(sql`${syncRuns.kind} = 'whoop' AND ${syncRuns.error} IS NULL`)
      .orderBy(desc(syncRuns.endedAt)).limit(1),
    db.select().from(syncRuns)
      .where(sql`${syncRuns.kind} = 'withings' AND ${syncRuns.error} IS NULL`)
      .orderBy(desc(syncRuns.endedAt)).limit(1),
    db.select().from(journalEntry).orderBy(desc(journalEntry.entryDate)).limit(1),
    db
      .select({ key: supplementLog.supplementKey })
      .from(supplementLog)
      .where(sql`${supplementLog.date} = ${userToday()}`),
  ]);

  const rec = latestRec[0];
  const sleep = latestSleepRow[0];
  const cyc = latestCycle[0];
  const withings = latestWithings[0];
  const hrv30d = rec30d.map((r) => r.hrvRmssdMilli).filter((v): v is number => v !== null);
  const rhr30d = rec30d.map((r) => r.restingHeartRate).filter((v): v is number => v !== null);
  const hrv7d = rec30d.filter((r) => r.createdAt && r.createdAt >= daysAgo(7))
    .map((r) => r.hrvRmssdMilli).filter((v): v is number => v !== null);

  const totalSleepMs =
    (sleep?.totalLightMs ?? 0) + (sleep?.totalDeepMs ?? 0) + (sleep?.totalRemMs ?? 0);

  const weekAvgStrain = average(cycle7d.map((c) => c.strain));

  const latestWeightKg = withings?.weightKg ?? null;
  const weight7dAvg = average(withings7d.map((w) => w.weightKg));
  const weight30dAvg = average(withings30d.map((w) => w.weightKg));
  const twelveMonthMin =
    withings365d.length > 0
      ? Math.min(...withings365d.map((w) => w.weightKg ?? Infinity).filter((v) => v !== Infinity))
      : null;
  const daysSinceWeighIn = withings?.measuredAt
    ? Math.floor((now.getTime() - withings.measuredAt.getTime()) / 86_400_000)
    : null;

  // Only include days where a real weigh-in happened — skip missing/null
  // values so the chart doesn't plunge to zero on un-weighed days.
  const spark14 = withings30d
    .filter((w) => w.weightKg != null)
    .slice(-14)
    .map((w) => ({
      date: String(w.date ?? ""),
      weightLb: Math.round((w.weightKg as number) * 2.20462 * 10) / 10,
    }));

  const illnessFlag = Boolean(
    recentJournal[0]?.illness &&
      recentJournal[0].entryDate &&
      (now.getTime() - new Date(recentJournal[0].entryDate).getTime()) / 86_400_000 <= 2
  );

  const prescription = prescribe({
    date: now,
    recoveryScore: rec?.recoveryScore ?? null,
    hrv7dAvg: hrv7d.length ? hrv7d.reduce((a, b) => a + b) / hrv7d.length : null,
    hrv30dAvg: hrv30d.length ? hrv30d.reduce((a, b) => a + b) / hrv30d.length : null,
    sleepHours: totalSleepMs ? totalSleepMs / 3_600_000 : null,
    weight7dAvgKg: weight7dAvg,
    weight30dAvgKg: weight30dAvg,
    latestWeightKg,
    daysSinceLastWeighIn: daysSinceWeighIn,
    twelveMonthMinWeightKg: twelveMonthMin === Infinity ? null : twelveMonthMin,
    illnessFlag,
  });

  return {
    recovery: {
      score: rec?.recoveryScore ?? null,
      hrv: rec?.hrvRmssdMilli ?? null,
      hrv30dAvg: hrv30d.length ? hrv30d.reduce((a, b) => a + b) / hrv30d.length : null,
      hrv7dAvg: hrv7d.length ? hrv7d.reduce((a, b) => a + b) / hrv7d.length : null,
      rhr: rec?.restingHeartRate ?? null,
      rhr30dAvg: rhr30d.length ? rhr30d.reduce((a, b) => a + b) / rhr30d.length : null,
      spo2: rec?.spo2Percentage ?? null,
      skinTemp: rec?.skinTempCelsius ?? null,
      updatedAt: rec?.createdAt ?? null,
    },
    sleep: {
      hours: totalSleepMs ? totalSleepMs / 3_600_000 : null,
      efficiencyPct: sleep?.sleepEfficiencyPct ?? null,
      deepMs: sleep?.totalDeepMs ?? null,
      remMs: sleep?.totalRemMs ?? null,
      lightMs: sleep?.totalLightMs ?? null,
      awakeMs: sleep?.totalAwakeMs ?? null,
    },
    strain: {
      today: cyc?.strain ?? null,
      weekAvg: weekAvgStrain,
    },
    workouts: recentWorkouts.map((w) => ({
      sport: w.sportName,
      strain: w.strain,
      start: w.start,
    })),
    weight: {
      latestKg: latestWeightKg,
      latestLb: latestWeightKg ? Math.round(latestWeightKg * 2.20462 * 10) / 10 : null,
      fatRatioPct: withings?.fatRatioPct ?? null,
      leanMassKg: withings?.fatFreeMassKg ?? null,
      muscleMassKg: withings?.muscleMassKg ?? null,
      measuredAt: withings?.measuredAt ?? null,
      avg7dKg: weight7dAvg,
      avg30dKg: weight30dAvg,
      twelveMonthMinKg: twelveMonthMin === Infinity ? null : twelveMonthMin,
      daysSinceWeighIn,
      sparkline14d: spark14,
    },
    lastSync: {
      whoop: lastWhoopSync[0]?.endedAt ?? null,
      withings: lastWithingsSync[0]?.endedAt ?? null,
    },
    supplementsTakenKeys: todaySupplements.map((r) => r.key),
    prescription,
  };
}
