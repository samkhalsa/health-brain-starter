/**
 * Display-name translation for WHOOP sport_name values.
 *
 * WHOOP's sport_name field is coarse. If you label sessions loosely in WHOOP
 * (e.g. "Functional-Fitness" for all strength work, "Running" for Z2 walks),
 * map them to friendlier display names here.
 *
 * Apply this everywhere a WHOOP workout label is shown to the user.
 */
export function displaySportName(raw: string | null | undefined): string {
  if (!raw) return "Unknown";
  const key = raw.toLowerCase().replace(/[_\s]+/g, "-");
  const map: Record<string, string> = {
    "functional-fitness": "Strength",
    running: "Z2 Walk",
    walking: "Walk",
    weightlifting: "Strength",
    cycling: "Cycling",
    rowing: "Rowing",
    swimming: "Swim",
    yoga: "Yoga",
    "pilates": "Pilates",
    "hiit": "HIIT",
  };
  if (map[key]) return map[key];
  return raw.replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function isStrengthSession(raw: string | null | undefined): boolean {
  if (!raw) return false;
  const key = raw.toLowerCase();
  return (
    key.includes("functional") ||
    key.includes("weightlift") ||
    key.includes("strength")
  );
}

export function isZone2Session(raw: string | null | undefined): boolean {
  if (!raw) return false;
  const key = raw.toLowerCase();
  return (
    key === "running" || key === "walking" || key.includes("cycling") || key === "rowing"
  );
}
