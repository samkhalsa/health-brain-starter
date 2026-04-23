import type { TodayData } from "./dashboard-data";
import { prescribe } from "./prescribe/engine";

/**
 * Generic demo data used as a fallback when the Postgres connection isn't
 * available (e.g. viewing the UI locally before provisioning Neon).
 *
 * Replace these with your own baselines once you've been wearing your wearable
 * for 30+ days. Numbers here are illustrative placeholders only.
 */
export function getDemoData(now = new Date()): TodayData {
  const hrv = 65;
  const hrv30 = 64;
  const hrv7 = 66;
  const rhr = 62;
  const rhr30 = 62;
  const recoveryScore = 70;
  const latestWeightKg = 80.0;

  const twoHoursAgo = new Date(now.getTime() - 2 * 3600 * 1000);
  const sixHoursAgo = new Date(now.getTime() - 6 * 3600 * 1000);

  // 14-day weight sparkline — flat placeholder
  const sparkline14d = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (13 - i));
    const base = 176.4 - i * 0.1;
    const noise = (Math.sin(i * 1.7) + Math.cos(i * 0.9)) * 0.4;
    return {
      date: d.toISOString().slice(0, 10),
      weightLb: Math.round((base + noise) * 10) / 10,
    };
  });

  const prescription = prescribe({
    date: now,
    recoveryScore,
    hrv7dAvg: hrv7,
    hrv30dAvg: hrv30,
    sleepHours: 7.5,
    weight7dAvgKg: 80.0,
    weight30dAvgKg: 80.2,
    latestWeightKg,
    daysSinceLastWeighIn: 0,
    twelveMonthMinWeightKg: 79.0,
    illnessFlag: false,
  });

  return {
    recovery: {
      score: recoveryScore,
      hrv,
      hrv30dAvg: hrv30,
      hrv7dAvg: hrv7,
      rhr,
      rhr30dAvg: rhr30,
      spo2: 96.0,
      skinTemp: 33.2,
      updatedAt: twoHoursAgo,
    },
    sleep: {
      hours: 7.5,
      efficiencyPct: 91,
      deepMs: 4_500_000,
      remMs: 6_300_000,
      lightMs: 15_800_000,
      awakeMs: 1_500_000,
    },
    strain: {
      today: 11.0,
      weekAvg: 10.5,
    },
    workouts: [
      { sport: "Strength", strain: 12.0, start: sixHoursAgo },
    ],
    weight: {
      latestKg: latestWeightKg,
      latestLb: 176.4,
      fatRatioPct: 20.0,
      leanMassKg: 64.0,
      muscleMassKg: 60.5,
      measuredAt: sixHoursAgo,
      avg7dKg: 80.0,
      avg30dKg: 80.2,
      twelveMonthMinKg: 79.0,
      daysSinceWeighIn: 0,
      sparkline14d,
    },
    lastSync: {
      whoop: twoHoursAgo,
      withings: sixHoursAgo,
    },
    supplementsTakenKeys: [],
    prescription,
  };
}
