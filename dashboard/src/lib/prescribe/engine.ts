import { workoutForDay, type WorkoutDay } from "./workouts";
import { userNow } from "@/lib/timezone";

export type Intensity = "REST" | "RED" | "YELLOW" | "GREEN";

export type PrescribeInput = {
  date: Date;
  recoveryScore: number | null; // 0-100
  hrv7dAvg: number | null;
  hrv30dAvg: number | null;
  sleepHours: number | null; // last night
  weight7dAvgKg: number | null;
  weight30dAvgKg: number | null;
  latestWeightKg: number | null;
  daysSinceLastWeighIn: number | null;
  twelveMonthMinWeightKg: number | null;
  illnessFlag: boolean;
};

export type Prescription = {
  intensity: Intensity;
  scheduled: WorkoutDay;
  primaryBlock: string; // headline of what to do
  modifications: string[];
  warnings: string[];
  affirmations: string[];
  rulesFired: string[];
};

function recoveryBucket(score: number | null): Intensity {
  if (score === null) return "YELLOW";
  if (score < 34) return "RED";
  if (score < 67) return "YELLOW";
  return "GREEN";
}

export function prescribe(input: PrescribeInput): Prescription {
  // Use the user's local day-of-week regardless of server TZ
  const userDow = userNow().getUTCDay();
  const scheduled = workoutForDay(userDow);
  const modifications: string[] = [];
  const warnings: string[] = [];
  const affirmations: string[] = [];
  const rulesFired: string[] = [];

  let intensity: Intensity = recoveryBucket(input.recoveryScore);
  rulesFired.push(
    `Recovery ${input.recoveryScore ?? "?"}% → ${intensity.toLowerCase()}`
  );

  // --- Illness overrides everything ---
  if (input.illnessFlag) {
    intensity = "REST";
    rulesFired.push("Illness flag within 48h → REST");
    warnings.push("You flagged illness. Skip training. Hydrate. Sleep.");
  }

  // --- Red recovery: downgrade strength days ---
  if (intensity === "RED" && scheduled.type === "STRENGTH") {
    modifications.push(
      "Strength → mobility + 20 min easy Z2. Don't touch heavy weight today."
    );
    rulesFired.push("Red recovery on strength day → downgrade to mobility+Z2");
  }
  if (intensity === "RED" && scheduled.type === "CARDIO + MOBILITY") {
    modifications.push("Halve Z2 duration (15 min). Keep mobility.");
    rulesFired.push("Red recovery on cardio day → half duration");
  }
  if (intensity === "RED") {
    warnings.push("Deep deload day. Nervous system needs it.");
  }

  // --- Yellow recovery: reduce volume ---
  if (intensity === "YELLOW" && scheduled.type === "STRENGTH") {
    modifications.push("Drop top sets by 1. RPE cap 7.");
    rulesFired.push("Yellow recovery → -1 top set");
  }
  if (intensity === "YELLOW" && scheduled.type === "CARDIO + MOBILITY") {
    modifications.push("Cap Z2 HR at 130 bpm.");
    rulesFired.push("Yellow recovery → Z2 HR cap");
  }

  // --- Sleep debt adds a nap ---
  if (
    input.sleepHours !== null &&
    input.sleepHours < 6 &&
    (input.recoveryScore ?? 100) < 50
  ) {
    modifications.push("30-min nap before 3 pm. Don't skip it.");
    rulesFired.push("Sleep <6h + recovery <50% → nap prescribed");
  }

  // --- HRV trend warning ---
  if (input.hrv7dAvg !== null && input.hrv30dAvg !== null && input.hrv30dAvg > 0) {
    const dropPct = (input.hrv30dAvg - input.hrv7dAvg) / input.hrv30dAvg;
    if (dropPct > 0.15) {
      warnings.push(
        `HRV 7d avg is ${Math.round(dropPct * 100)}% below 30d baseline — suspect overreaching.`
      );
      rulesFired.push("HRV 7d trend ▼ >15% vs 30d → overreaching warning");
    }
  }

  // --- Weight / body-comp cues ---
  if (input.daysSinceLastWeighIn !== null && input.daysSinceLastWeighIn >= 2) {
    modifications.push("Weigh in when you wake (missed 2+ days).");
    rulesFired.push("No weigh-in in 48h+");
  }
  if (input.weight7dAvgKg !== null && input.weight30dAvgKg !== null) {
    const delta = input.weight7dAvgKg - input.weight30dAvgKg;
    if (delta > 0.3) {
      warnings.push("Weight 7d avg trending ABOVE 30d avg — tighten nutrition today.");
      rulesFired.push("Weight 7d > 30d → nutrition tighten");
    } else if (delta < -0.3) {
      affirmations.push("Weight 7d avg trending DOWN — stay the course.");
      rulesFired.push("Weight 7d < 30d → on track");
    }
  }
  if (
    input.latestWeightKg !== null &&
    input.twelveMonthMinWeightKg !== null &&
    input.latestWeightKg < input.twelveMonthMinWeightKg
  ) {
    affirmations.push(
      "You just set a new 12-month low. New territory — keep pressing."
    );
    rulesFired.push("New 12-month low weight");
  }

  rulesFired.push(`${dayLabel(userDow)} → ${scheduled.name}`);

  const primaryBlock =
    intensity === "REST"
      ? "REST — mobility only"
      : intensity === "RED"
      ? `RED DAY — modified ${scheduled.name}`
      : intensity === "YELLOW"
      ? `YELLOW DAY — ${scheduled.name} (reduced)`
      : `GREEN DAY — ${scheduled.name}`;

  return {
    intensity,
    scheduled,
    primaryBlock,
    modifications,
    warnings,
    affirmations,
    rulesFired,
  };
}

function dayLabel(dow: number): string {
  const names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return names[dow];
}
