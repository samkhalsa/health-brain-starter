import { sql, asc, and, gte } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  whoopRecovery,
  whoopSleep,
  whoopCycle,
  withingsMeasurement,
} from "@/lib/db/schema";

export type RangeKey = "7d" | "30d" | "90d" | "180d" | "12mo" | "all";

const RANGE_DAYS: Record<RangeKey, number | null> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
  "180d": 180,
  "12mo": 365,
  all: null,
};

export const RANGE_LABELS: Record<RangeKey, string> = {
  "7d": "7d",
  "30d": "30d",
  "90d": "90d",
  "180d": "180d",
  "12mo": "12mo",
  all: "All",
};

export function parseRange(s: string | undefined): RangeKey {
  if (s && s in RANGE_DAYS) return s as RangeKey;
  return "30d";
}

function windowStart(range: RangeKey): Date | null {
  const days = RANGE_DAYS[range];
  if (days === null) return null;
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d;
}

export type Point = { date: string; value: number | null };

export type TrendSeries = {
  key: string;
  label: string;
  unit: string;
  data: Point[];
  rolling7?: Point[];
  optimalMin?: number | null;
  optimalMax?: number | null;
  goalLines?: Array<{ value: number; label: string }>;
  direction: "higher" | "lower" | "middle"; // what's "good"
  precision: number; // decimal places
};

function rolling7(points: Point[]): Point[] {
  const out: Point[] = [];
  for (let i = 0; i < points.length; i++) {
    const windowPts = points
      .slice(Math.max(0, i - 6), i + 1)
      .filter((p) => p.value !== null) as Array<{ date: string; value: number }>;
    if (windowPts.length < 3) {
      out.push({ date: points[i].date, value: null });
    } else {
      const avg = windowPts.reduce((a, b) => a + b.value, 0) / windowPts.length;
      out.push({ date: points[i].date, value: Math.round(avg * 100) / 100 });
    }
  }
  return out;
}

export async function getTrends(range: RangeKey): Promise<TrendSeries[]> {
  const start = windowStart(range);
  const recCond = start
    ? and(sql`${whoopRecovery.scoreState} = 'SCORED'`, gte(whoopRecovery.createdAt, start))
    : sql`${whoopRecovery.scoreState} = 'SCORED'`;
  const sleepCond = start
    ? and(
        sql`${whoopSleep.scoreState} = 'SCORED'`,
        sql`${whoopSleep.nap} = false`,
        gte(whoopSleep.start, start)
      )
    : and(sql`${whoopSleep.scoreState} = 'SCORED'`, sql`${whoopSleep.nap} = false`);
  const cycleCond = start ? gte(whoopCycle.start, start) : sql`1 = 1`;
  const withingsCond = start ? gte(withingsMeasurement.measuredAt, start) : sql`1 = 1`;

  const [recs, sleeps, cycles, weighIns] = await Promise.all([
    db.select().from(whoopRecovery).where(recCond).orderBy(asc(whoopRecovery.createdAt)),
    db.select().from(whoopSleep).where(sleepCond).orderBy(asc(whoopSleep.start)),
    db.select().from(whoopCycle).where(cycleCond).orderBy(asc(whoopCycle.start)),
    db
      .select()
      .from(withingsMeasurement)
      .where(withingsCond)
      .orderBy(asc(withingsMeasurement.measuredAt)),
  ]);

  const iso = (d: Date | null | undefined) => (d ? d.toISOString().slice(0, 10) : "");

  const recoveryPts: Point[] = recs.map((r) => ({
    date: iso(r.createdAt),
    value: r.recoveryScore,
  }));
  const hrvPts: Point[] = recs.map((r) => ({
    date: iso(r.createdAt),
    value: r.hrvRmssdMilli,
  }));
  const rhrPts: Point[] = recs.map((r) => ({
    date: iso(r.createdAt),
    value: r.restingHeartRate,
  }));

  const sleepHoursPts: Point[] = sleeps.map((s) => ({
    date: iso(s.start),
    value:
      s.totalLightMs !== null && s.totalDeepMs !== null && s.totalRemMs !== null
        ? Math.round(
            ((s.totalLightMs + s.totalDeepMs + s.totalRemMs) / 3_600_000) * 100
          ) / 100
        : null,
  }));

  const strainPts: Point[] = cycles.map((c) => ({
    date: iso(c.start),
    value: c.strain !== null ? Math.round(c.strain * 10) / 10 : null,
  }));

  const weightPts: Point[] = weighIns
    .filter((w) => w.weightKg != null)
    .map((w) => ({
      date: iso(w.measuredAt),
      value: Math.round((w.weightKg as number) * 2.20462 * 10) / 10,
    }));

  const bfPts: Point[] = weighIns
    .filter((w) => w.fatRatioPct != null)
    .map((w) => ({
      date: iso(w.measuredAt),
      value: Math.round((w.fatRatioPct as number) * 10) / 10,
    }));

  const leanPts: Point[] = weighIns
    .filter((w) => w.fatFreeMassKg != null)
    .map((w) => ({
      date: iso(w.measuredAt),
      value: Math.round((w.fatFreeMassKg as number) * 2.20462 * 10) / 10,
    }));

  return [
    {
      key: "recovery",
      label: "Recovery",
      unit: "%",
      data: recoveryPts,
      rolling7: rolling7(recoveryPts),
      optimalMin: 67,
      optimalMax: 100,
      direction: "higher",
      precision: 0,
    },
    {
      key: "hrv",
      label: "HRV (rMSSD)",
      unit: "ms",
      data: hrvPts,
      rolling7: rolling7(hrvPts),
      direction: "higher",
      precision: 1,
    },
    {
      key: "rhr",
      label: "Resting HR",
      unit: "bpm",
      data: rhrPts,
      rolling7: rolling7(rhrPts),
      optimalMax: 60,
      direction: "lower",
      precision: 0,
    },
    {
      key: "sleep",
      label: "Sleep",
      unit: "hrs",
      data: sleepHoursPts,
      rolling7: rolling7(sleepHoursPts),
      optimalMin: 7.5,
      optimalMax: 9,
      direction: "higher",
      precision: 1,
    },
    {
      key: "strain",
      label: "Strain",
      unit: "",
      data: strainPts,
      rolling7: rolling7(strainPts),
      direction: "middle",
      precision: 1,
    },
    {
      key: "weight",
      label: "Weight",
      unit: "lbs",
      data: weightPts,
      rolling7: rolling7(weightPts),
      goalLines: [
        { value: 225, label: "225" },
        { value: 215, label: "215" },
        { value: 205, label: "205" },
        { value: 200, label: "Goal · 200" },
      ],
      direction: "lower",
      precision: 1,
    },
    {
      key: "body_fat",
      label: "Body Fat %",
      unit: "%",
      data: bfPts,
      rolling7: rolling7(bfPts),
      optimalMax: 18,
      direction: "lower",
      precision: 1,
    },
    {
      key: "lean_mass",
      label: "Lean Mass",
      unit: "lbs",
      data: leanPts,
      rolling7: rolling7(leanPts),
      direction: "higher",
      precision: 1,
    },
  ];
}

export function summarize(points: Point[], precision: number) {
  const vals = points.map((p) => p.value).filter((v): v is number => v !== null);
  if (vals.length === 0) {
    return { latest: null, avg: null, min: null, max: null, delta: null };
  }
  const latest = vals[vals.length - 1];
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  const first = vals[0];
  return {
    latest,
    avg: Math.round(avg * 10 ** precision) / 10 ** precision,
    min: Math.min(...vals),
    max: Math.max(...vals),
    delta: Math.round((latest - first) * 10 ** precision) / 10 ** precision,
  };
}
