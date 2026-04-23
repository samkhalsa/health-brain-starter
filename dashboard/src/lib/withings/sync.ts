import { sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { withingsMeasurement } from "@/lib/db/schema";
import type { WithingsRecord } from "./client";

function sqlExcluded(col: string) {
  return sql.raw(`excluded."${col}"`);
}

export async function upsertWithings(records: WithingsRecord[]): Promise<number> {
  if (!records.length) return 0;

  const rows = records.map((r) => ({
    grpid: r.grpid,
    measuredAt: new Date(r.timestamp * 1000),
    date: r.date,
    weightKg: r.weight_kg ?? null,
    fatFreeMassKg: r.fat_free_mass_kg ?? null,
    fatRatioPct: r.fat_ratio_pct ?? null,
    fatMassKg: r.fat_mass_kg ?? null,
    muscleMassKg: r.muscle_mass_kg ?? null,
    boneMassKg: r.bone_mass_kg ?? null,
    hydrationKg: r.hydration_kg ?? null,
    heartPulseBpm: r.heart_pulse_bpm ?? null,
    pulseWaveVelocity: r.pulse_wave_velocity ?? null,
    vascularAge: r.vascular_age ?? null,
    visceralFat: r.visceral_fat ?? null,
    raw: r,
    updatedAt: new Date(),
  }));

  await db
    .insert(withingsMeasurement)
    .values(rows)
    .onConflictDoUpdate({
      target: withingsMeasurement.grpid,
      set: {
        measuredAt: sqlExcluded("measured_at"),
        date: sqlExcluded("date"),
        weightKg: sqlExcluded("weight_kg"),
        fatFreeMassKg: sqlExcluded("fat_free_mass_kg"),
        fatRatioPct: sqlExcluded("fat_ratio_pct"),
        fatMassKg: sqlExcluded("fat_mass_kg"),
        muscleMassKg: sqlExcluded("muscle_mass_kg"),
        boneMassKg: sqlExcluded("bone_mass_kg"),
        hydrationKg: sqlExcluded("hydration_kg"),
        heartPulseBpm: sqlExcluded("heart_pulse_bpm"),
        pulseWaveVelocity: sqlExcluded("pulse_wave_velocity"),
        vascularAge: sqlExcluded("vascular_age"),
        visceralFat: sqlExcluded("visceral_fat"),
        raw: sqlExcluded("raw"),
        updatedAt: sqlExcluded("updated_at"),
      },
    });

  return rows.length;
}
