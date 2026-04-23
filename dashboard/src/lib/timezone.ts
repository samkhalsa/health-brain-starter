/**
 * Timezone helpers — everything user-facing runs on the user's wall-clock time.
 *
 * Set USER_TZ via env var (USER_TIMEZONE) or edit the default below.
 * Independent of process.env.TZ: uses Intl.DateTimeFormat with an explicit
 * timeZone so it keeps working even if the server runtime is UTC.
 */

export const USER_TZ = process.env.USER_TIMEZONE || "America/New_York";

/**
 * Returns a Date whose *UTC fields* match the current local wall-clock time.
 * That sounds backwards, but it's the trick that makes `.getUTCDay()`,
 * `.getUTCHours()`, etc. return local values regardless of server TZ.
 */
export function userNow(): Date {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: USER_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  // "24" for midnight in some locales — normalise
  const hour = get("hour") === 24 ? 0 : get("hour");
  return new Date(
    Date.UTC(
      get("year"),
      get("month") - 1,
      get("day"),
      hour,
      get("minute"),
      get("second")
    )
  );
}

/** 0 = Sunday … 6 = Saturday, in the user's timezone. */
export function userDayOfWeek(): number {
  return userNow().getUTCDay();
}

/** Formatted date for display, e.g. "Tuesday, April 21". */
export function formatUserDate(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: USER_TZ,
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(now);
}

/** Current date in the user's timezone as ISO "YYYY-MM-DD". Useful as a natural key for logs. */
export function userToday(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: USER_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

// Backwards-compatible aliases — existing call sites can migrate incrementally.
export const torontoNow = userNow;
export const torontoDayOfWeek = userDayOfWeek;
export const formatTorontoDate = formatUserDate;
export const torontoToday = userToday;
