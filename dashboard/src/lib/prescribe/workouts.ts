/**
 * Mirror of WORKOUTS dict in telegram_bot/shared/config.py — keep in sync.
 * Indexed by day-of-week (Python convention: 0 = Monday, 6 = Sunday).
 * JS Date.getDay() returns 0=Sunday..6=Saturday — convert via toPyDow().
 */

export type WorkoutDay = {
  name: string;
  type: "STRENGTH" | "CARDIO + MOBILITY" | "ACTIVE RECOVERY" | "REST DAY";
  duration: string;
  exercises: string[];
  focus: string;
};

export const WORKOUTS: Record<number, WorkoutDay> = {
  0: {
    name: "UPPER PUSH + CORE",
    type: "STRENGTH",
    duration: "55 min",
    exercises: [
      "Warmup/Mobility Block (10 min)",
      "Dumbbell Bench Press — 4x10-12",
      "Standing Overhead Press (DB) — 3x8-10",
      "Incline DB Press — 3x10-12",
      "Lateral Raises — 3x12-15",
      "Tricep Rope Pushdowns — 3x12-15",
      "Dead Bug — 3x8 each side",
      "Pallof Press — 3x10 each side",
      "Zone 2 Finisher — 10 min",
    ],
    focus: "Chest, shoulders, triceps, core",
  },
  1: {
    name: "ZONE 2 CARDIO + HIP & ANKLE MOBILITY",
    type: "CARDIO + MOBILITY",
    duration: "45 min",
    exercises: [
      "Zone 2 Cardio — 30 min (bike, incline walk, or row)",
      "Banded ankle dorsiflexion — 2x30s each",
      "Half-kneeling hip flexor stretch — 60s each",
      "Pigeon pose — 90s each side",
      "Hip 90/90 PAILs/RAILs — 2 min each",
      "Single-leg balance — 3x30s each",
      "Glute bridges — 2x15",
    ],
    focus: "Fat burning, insulin sensitivity, ankle/hip rehab",
  },
  2: {
    name: "LOWER BODY",
    type: "STRENGTH",
    duration: "55 min",
    exercises: [
      "Warmup/Mobility Block (10 min)",
      "Goblet Squat (heel elevated) — 4x10-12",
      "Romanian Deadlift — 4x10-12",
      "Single-Leg Leg Press — 3x8-10 each",
      "Barbell Hip Thrust — 3x12-15",
      "Single-Leg Calf Raise (right only) — 3x15",
      "Farmer's Carry — 3x40m",
      "Zone 2 Finisher — 10 min",
    ],
    focus: "Legs, glutes, hip hinge, ankle rehab",
  },
  3: {
    name: "ZONE 2 CARDIO + T-SPINE & NECK MOBILITY",
    type: "CARDIO + MOBILITY",
    duration: "45 min",
    exercises: [
      "Zone 2 Cardio — 30 min (rowing is ideal today)",
      "Thoracic foam roller extension — 2 min",
      "Wall angels — 2x10",
      "Doorway pec stretch — 45s each side",
      "Deep neck flexor holds — 3x15s",
      "Chin tucks — 2x10 (5s hold)",
      "Prone Y-T-W raises — 2x8 each",
      "Band pull-aparts — 2x15",
    ],
    focus: "Cardio base, posture correction, tech neck fix",
  },
  4: {
    name: "UPPER PULL + CORE",
    type: "STRENGTH",
    duration: "55 min",
    exercises: [
      "Warmup/Mobility Block (10 min)",
      "Lat Pulldown — 4x8-10",
      "Seated Cable Row — 4x10-12",
      "Single-Arm DB Row — 3x10-12 each",
      "Face Pulls — 3x15-20",
      "Bicep Curls (DB) — 3x10-12",
      "Prone Y-T-W Raises — 2x8 each",
      "Plank — 3x30-45s",
      "Bird Dog — 3x8 each side",
      "Zone 2 Finisher — 10 min",
    ],
    focus: "Back, biceps, scapular stability, posture",
  },
  5: {
    name: "LONG ZONE 2 — ACTIVE DAY",
    type: "ACTIVE RECOVERY",
    duration: "45-60 min",
    exercises: [
      "Pick one: walk/hike, bike, swim, or row",
      "Keep it EASY — conversational pace, HR 110-140",
      "Get outside if possible — sunlight + vitamin D",
    ],
    focus: "Extended fat burning, mental health, enjoy movement",
  },
  6: {
    name: "REST + FULL MOBILITY FLOW",
    type: "REST DAY",
    duration: "20 min",
    exercises: [
      "Ankle CARs — 5 each direction, each ankle",
      "Hip CARs — 5 each direction, each hip",
      "90/90 hip switches — 10 reps",
      "Couch stretch — 60s each side",
      "Pigeon pose — 60s each side",
      "Deep squat hold — 2 min",
      "Thoracic rotation — 10 each side",
      "Foam roller extension — 2 min",
      "Chin tucks — 10x5s",
      "Wall angels — 10 reps",
    ],
    focus: "Recovery, joint maintenance, prepare for the week",
  },
};

/** JS Date.getDay(): 0=Sun..6=Sat → Python dow: 0=Mon..6=Sun. */
export function toPyDow(jsDow: number): number {
  return (jsDow + 6) % 7;
}

/**
 * Pick the workout for a given day-of-week (0=Sun..6=Sat).
 * Callers should pass the *Toronto-local* day-of-week — see `torontoDayOfWeek()`
 * in `lib/timezone.ts`. Passing `Date.getDay()` directly is a bug on servers
 * whose TZ isn't America/Toronto.
 */
export function workoutForDay(jsDow: number): WorkoutDay {
  return WORKOUTS[toPyDow(jsDow)];
}

/** @deprecated use `workoutForDay(torontoDayOfWeek())` instead. */
export function workoutFor(date: Date): WorkoutDay {
  return WORKOUTS[toPyDow(date.getDay())];
}
