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

// Customize to match YOUR weekly split (see sections/04_strength.md).
// This must stay in sync with telegram_bot/shared/config.py if you use the bot.
export const WORKOUTS: Record<number, WorkoutDay> = {
  0: {
    name: "UPPER PUSH + CORE",
    type: "STRENGTH",
    duration: "55 min",
    exercises: [
      "Warmup / Mobility (10 min)",
      "[Exercise 1] — [sets × reps]",
      "[Exercise 2] — [sets × reps]",
      "[Exercise 3] — [sets × reps]",
      "Zone 2 finisher — 10 min",
    ],
    focus: "Chest, shoulders, triceps, core",
  },
  1: {
    name: "ZONE 2 + MOBILITY",
    type: "CARDIO + MOBILITY",
    duration: "45 min",
    exercises: [
      "Zone 2 cardio — 30 min",
      "[Mobility drill 1]",
      "[Mobility drill 2]",
    ],
    focus: "Base aerobic capacity, mobility",
  },
  2: {
    name: "LOWER BODY",
    type: "STRENGTH",
    duration: "55 min",
    exercises: [
      "Warmup / Mobility (10 min)",
      "[Exercise 1] — [sets × reps]",
      "[Exercise 2] — [sets × reps]",
      "[Exercise 3] — [sets × reps]",
    ],
    focus: "Legs, glutes, posterior chain",
  },
  3: {
    name: "ZONE 2 + MOBILITY",
    type: "CARDIO + MOBILITY",
    duration: "45 min",
    exercises: [
      "Zone 2 cardio — 30 min",
      "[Mobility drill 1]",
      "[Mobility drill 2]",
    ],
    focus: "Base aerobic capacity, mobility",
  },
  4: {
    name: "UPPER PULL + CORE",
    type: "STRENGTH",
    duration: "55 min",
    exercises: [
      "Warmup / Mobility (10 min)",
      "[Exercise 1] — [sets × reps]",
      "[Exercise 2] — [sets × reps]",
      "[Exercise 3] — [sets × reps]",
    ],
    focus: "Back, biceps, scapular stability",
  },
  5: {
    name: "LONG ZONE 2 / ACTIVE",
    type: "ACTIVE RECOVERY",
    duration: "45–60 min",
    exercises: [
      "Pick one: walk, hike, bike, swim, row",
      "Keep HR conversational (110–140)",
    ],
    focus: "Extended aerobic, enjoyment",
  },
  6: {
    name: "REST + MOBILITY FLOW",
    type: "REST DAY",
    duration: "20 min",
    exercises: [
      "Ankle CARs — 5 each direction",
      "Hip CARs — 5 each direction",
      "T-spine rotation — 10 each side",
      "Deep squat hold — 2 min",
    ],
    focus: "Joint maintenance, reset for next week",
  },
};

/** JS Date.getDay(): 0=Sun..6=Sat → Python dow: 0=Mon..6=Sun. */
export function toPyDow(jsDow: number): number {
  return (jsDow + 6) % 7;
}

/**
 * Pick the workout for a given day-of-week (0=Sun..6=Sat).
 * Callers should pass the user's local day-of-week — see `userDayOfWeek()`
 * in `lib/timezone.ts`. Passing `Date.getDay()` directly is a bug on servers
 * whose TZ isn't the user's timezone.
 */
export function workoutForDay(jsDow: number): WorkoutDay {
  return WORKOUTS[toPyDow(jsDow)];
}

/** @deprecated use `workoutForDay(userDayOfWeek())` instead. */
export function workoutFor(date: Date): WorkoutDay {
  return WORKOUTS[toPyDow(date.getDay())];
}
