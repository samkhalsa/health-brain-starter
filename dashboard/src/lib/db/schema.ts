import {
  pgTable,
  text,
  integer,
  real,
  doublePrecision,
  timestamp,
  boolean,
  jsonb,
  serial,
  pgEnum,
  date,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const syncKindEnum = pgEnum("sync_kind", ["whoop", "withings", "biomarkers"]);
export const severityEnum = pgEnum("severity", ["optimal", "monitor", "high", "critical"]);
export const bodyScanSourceEnum = pgEnum("body_scan_source", ["dexa", "inbody"]);

export const whoopRecovery = pgTable("whoop_recovery", {
  cycleId: text("cycle_id").primaryKey(),
  sleepId: text("sleep_id"),
  userId: text("user_id"),
  createdAt: timestamp("created_at", { withTimezone: true }),
  date: date("date"),
  scoreState: text("score_state"),
  recoveryScore: real("recovery_score"),
  hrvRmssdMilli: real("hrv_rmssd_milli"),
  restingHeartRate: real("resting_heart_rate"),
  spo2Percentage: real("spo2_percentage"),
  skinTempCelsius: real("skin_temp_celsius"),
  raw: jsonb("raw"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .default(sql`now()`)
    .notNull(),
});

export const whoopSleep = pgTable("whoop_sleep", {
  id: text("id").primaryKey(),
  cycleId: text("cycle_id"),
  userId: text("user_id"),
  start: timestamp("start", { withTimezone: true }),
  end: timestamp("end", { withTimezone: true }),
  nap: boolean("nap").default(false),
  scoreState: text("score_state"),
  totalInBedMs: integer("total_in_bed_ms"),
  totalLightMs: integer("total_light_ms"),
  totalDeepMs: integer("total_deep_ms"),
  totalRemMs: integer("total_rem_ms"),
  totalAwakeMs: integer("total_awake_ms"),
  sleepEfficiencyPct: real("sleep_efficiency_pct"),
  sleepPerformancePct: real("sleep_performance_pct"),
  sleepConsistencyPct: real("sleep_consistency_pct"),
  respiratoryRate: real("respiratory_rate"),
  raw: jsonb("raw"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .default(sql`now()`)
    .notNull(),
});

export const whoopCycle = pgTable("whoop_cycle", {
  cycleId: text("cycle_id").primaryKey(),
  userId: text("user_id"),
  start: timestamp("start", { withTimezone: true }),
  end: timestamp("end", { withTimezone: true }),
  scoreState: text("score_state"),
  strain: real("strain"),
  averageHeartRate: real("average_heart_rate"),
  maxHeartRate: real("max_heart_rate"),
  kilojoule: real("kilojoule"),
  raw: jsonb("raw"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .default(sql`now()`)
    .notNull(),
});

export const whoopWorkout = pgTable("whoop_workout", {
  id: text("id").primaryKey(),
  cycleId: text("cycle_id"),
  userId: text("user_id"),
  sportName: text("sport_name"),
  start: timestamp("start", { withTimezone: true }),
  end: timestamp("end", { withTimezone: true }),
  scoreState: text("score_state"),
  durationMin: real("duration_min"),
  strain: real("strain"),
  averageHeartRate: real("average_heart_rate"),
  maxHeartRate: real("max_heart_rate"),
  kilojoule: real("kilojoule"),
  distanceMeters: real("distance_meters"),
  raw: jsonb("raw"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .default(sql`now()`)
    .notNull(),
});

export const withingsMeasurement = pgTable("withings_measurement", {
  grpid: text("grpid").primaryKey(),
  measuredAt: timestamp("measured_at", { withTimezone: true }).notNull(),
  date: date("date").notNull(),
  weightKg: doublePrecision("weight_kg"),
  fatFreeMassKg: doublePrecision("fat_free_mass_kg"),
  fatRatioPct: doublePrecision("fat_ratio_pct"),
  fatMassKg: doublePrecision("fat_mass_kg"),
  muscleMassKg: doublePrecision("muscle_mass_kg"),
  boneMassKg: doublePrecision("bone_mass_kg"),
  hydrationKg: doublePrecision("hydration_kg"),
  heartPulseBpm: doublePrecision("heart_pulse_bpm"),
  pulseWaveVelocity: doublePrecision("pulse_wave_velocity"),
  vascularAge: doublePrecision("vascular_age"),
  visceralFat: doublePrecision("visceral_fat"),
  raw: jsonb("raw"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .default(sql`now()`)
    .notNull(),
});

export const syncRuns = pgTable("sync_runs", {
  id: serial("id").primaryKey(),
  kind: syncKindEnum("kind").notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
  endedAt: timestamp("ended_at", { withTimezone: true }),
  recordsUpserted: integer("records_upserted").default(0),
  error: text("error"),
});

export const biomarkerPanel = pgTable("biomarker_panel", {
  id: serial("id").primaryKey(),
  drawnAt: date("drawn_at").notNull(),
  lab: text("lab"),
  notes: text("notes"),
});

export const biomarker = pgTable("biomarker", {
  id: serial("id").primaryKey(),
  panelId: integer("panel_id")
    .references(() => biomarkerPanel.id, { onDelete: "cascade" })
    .notNull(),
  markerKey: text("marker_key").notNull(),
  value: doublePrecision("value"),
  unit: text("unit"),
  optimalLow: doublePrecision("optimal_low"),
  optimalHigh: doublePrecision("optimal_high"),
  standardLow: doublePrecision("standard_low"),
  standardHigh: doublePrecision("standard_high"),
  severity: severityEnum("severity"),
  notes: text("notes"),
});

export const bodyCompositionScan = pgTable("body_composition_scan", {
  id: serial("id").primaryKey(),
  measuredAt: date("measured_at").notNull(),
  source: bodyScanSourceEnum("source").notNull(),
  totalBodyFatPct: doublePrecision("total_body_fat_pct"),
  leanMassKg: doublePrecision("lean_mass_kg"),
  almi: doublePrecision("almi"),
  visceralFat: doublePrecision("visceral_fat"),
  bmdT: doublePrecision("bmd_t"),
  bmdZ: doublePrecision("bmd_z"),
  notes: text("notes"),
});

export const oauthTokens = pgTable("oauth_tokens", {
  kind: text("kind").primaryKey(), // 'whoop' | 'withings'
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  scope: text("scope"),
  raw: jsonb("raw"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .default(sql`now()`)
    .notNull(),
});

export const supplementLog = pgTable(
  "supplement_log",
  {
    id: serial("id").primaryKey(),
    date: date("date").notNull(),
    supplementKey: text("supplement_key").notNull(),
    takenAt: timestamp("taken_at", { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
  },
  (t) => ({
    uniq: uniqueIndex("supplement_log_date_key_unique").on(t.date, t.supplementKey),
  })
);

export const journalEntry = pgTable(
  "journal_entry",
  {
    id: serial("id").primaryKey(),
    entryDate: date("entry_date").notNull(),
    mood: integer("mood_1_10"),
    energy: integer("energy_1_10"),
    soreness: integer("soreness_1_10"),
    illness: boolean("illness").default(false),
    notes: text("notes"),
    tags: text("tags").array(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
  },
  (t) => ({
    entryDateUnique: uniqueIndex("journal_entry_date_unique").on(t.entryDate),
  })
);
