CREATE TYPE "public"."body_scan_source" AS ENUM('dexa', 'inbody');--> statement-breakpoint
CREATE TYPE "public"."severity" AS ENUM('optimal', 'monitor', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."sync_kind" AS ENUM('whoop', 'withings', 'biomarkers');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "biomarker" (
	"id" serial PRIMARY KEY NOT NULL,
	"panel_id" integer NOT NULL,
	"marker_key" text NOT NULL,
	"value" double precision,
	"unit" text,
	"optimal_low" double precision,
	"optimal_high" double precision,
	"standard_low" double precision,
	"standard_high" double precision,
	"severity" "severity",
	"notes" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "biomarker_panel" (
	"id" serial PRIMARY KEY NOT NULL,
	"drawn_at" date NOT NULL,
	"lab" text,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "body_composition_scan" (
	"id" serial PRIMARY KEY NOT NULL,
	"measured_at" date NOT NULL,
	"source" "body_scan_source" NOT NULL,
	"total_body_fat_pct" double precision,
	"lean_mass_kg" double precision,
	"almi" double precision,
	"visceral_fat" double precision,
	"bmd_t" double precision,
	"bmd_z" double precision,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "journal_entry" (
	"id" serial PRIMARY KEY NOT NULL,
	"entry_date" date NOT NULL,
	"mood_1_10" integer,
	"energy_1_10" integer,
	"soreness_1_10" integer,
	"illness" boolean DEFAULT false,
	"notes" text,
	"tags" text[],
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sync_runs" (
	"id" serial PRIMARY KEY NOT NULL,
	"kind" "sync_kind" NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"ended_at" timestamp with time zone,
	"records_upserted" integer DEFAULT 0,
	"error" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "whoop_cycle" (
	"cycle_id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"start" timestamp with time zone,
	"end" timestamp with time zone,
	"score_state" text,
	"strain" real,
	"average_heart_rate" real,
	"max_heart_rate" real,
	"kilojoule" real,
	"raw" jsonb,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "whoop_recovery" (
	"cycle_id" text PRIMARY KEY NOT NULL,
	"sleep_id" text,
	"user_id" text,
	"created_at" timestamp with time zone,
	"date" date,
	"score_state" text,
	"recovery_score" real,
	"hrv_rmssd_milli" real,
	"resting_heart_rate" real,
	"spo2_percentage" real,
	"skin_temp_celsius" real,
	"raw" jsonb,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "whoop_sleep" (
	"id" text PRIMARY KEY NOT NULL,
	"cycle_id" text,
	"user_id" text,
	"start" timestamp with time zone,
	"end" timestamp with time zone,
	"nap" boolean DEFAULT false,
	"score_state" text,
	"total_in_bed_ms" integer,
	"total_light_ms" integer,
	"total_deep_ms" integer,
	"total_rem_ms" integer,
	"total_awake_ms" integer,
	"sleep_efficiency_pct" real,
	"sleep_performance_pct" real,
	"sleep_consistency_pct" real,
	"respiratory_rate" real,
	"raw" jsonb,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "whoop_workout" (
	"id" text PRIMARY KEY NOT NULL,
	"cycle_id" text,
	"user_id" text,
	"sport_name" text,
	"start" timestamp with time zone,
	"end" timestamp with time zone,
	"score_state" text,
	"duration_min" real,
	"strain" real,
	"average_heart_rate" real,
	"max_heart_rate" real,
	"kilojoule" real,
	"distance_meters" real,
	"raw" jsonb,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "withings_measurement" (
	"grpid" text PRIMARY KEY NOT NULL,
	"measured_at" timestamp with time zone NOT NULL,
	"date" date NOT NULL,
	"weight_kg" double precision,
	"fat_free_mass_kg" double precision,
	"fat_ratio_pct" double precision,
	"fat_mass_kg" double precision,
	"muscle_mass_kg" double precision,
	"bone_mass_kg" double precision,
	"hydration_kg" double precision,
	"heart_pulse_bpm" double precision,
	"pulse_wave_velocity" double precision,
	"vascular_age" double precision,
	"visceral_fat" double precision,
	"raw" jsonb,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "biomarker" ADD CONSTRAINT "biomarker_panel_id_biomarker_panel_id_fk" FOREIGN KEY ("panel_id") REFERENCES "public"."biomarker_panel"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "journal_entry_date_unique" ON "journal_entry" USING btree ("entry_date");