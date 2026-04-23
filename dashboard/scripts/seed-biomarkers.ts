/**
 * Seed biomarker_panel + biomarker tables from data/biomarkers.seed.json.
 * Idempotent: existing panels (by drawn_at + lab) are updated, not duplicated.
 *
 *   npm run seed:biomarkers
 */

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { sql } from "drizzle-orm";
import { db } from "../src/lib/db/client";
import { biomarkerPanel, biomarker } from "../src/lib/db/schema";

type Marker = {
  key: string;
  value: number;
  unit: string;
  optimal: [number | null, number | null];
  standard?: [number | null, number | null];
  severity: "optimal" | "monitor" | "high" | "critical";
  notes?: string;
};

type Panel = {
  drawn_at: string;
  lab?: string;
  notes?: string;
  markers: Marker[];
};

type SeedFile = { panels: Panel[] };

async function main() {
  const path = resolve(__dirname, "..", "data", "biomarkers.seed.json");
  const data = JSON.parse(readFileSync(path, "utf-8")) as SeedFile;

  for (const panel of data.panels) {
    // Is this panel already in the DB?
    const existing = await db
      .select({ id: biomarkerPanel.id })
      .from(biomarkerPanel)
      .where(
        sql`${biomarkerPanel.drawnAt} = ${panel.drawn_at} AND COALESCE(${biomarkerPanel.lab}, '') = COALESCE(${panel.lab ?? null}, '')`
      )
      .limit(1);

    let panelId: number;
    if (existing.length > 0) {
      panelId = existing[0].id;
      console.log(`→ Panel ${panel.drawn_at} exists (id=${panelId}), replacing markers`);
      await db.delete(biomarker).where(sql`${biomarker.panelId} = ${panelId}`);
    } else {
      const [inserted] = await db
        .insert(biomarkerPanel)
        .values({
          drawnAt: panel.drawn_at,
          lab: panel.lab ?? null,
          notes: panel.notes ?? null,
        })
        .returning({ id: biomarkerPanel.id });
      panelId = inserted.id;
      console.log(`→ New panel ${panel.drawn_at} (id=${panelId})`);
    }

    const rows = panel.markers.map((m) => ({
      panelId,
      markerKey: m.key,
      value: m.value,
      unit: m.unit,
      optimalLow: m.optimal[0] ?? null,
      optimalHigh: m.optimal[1] ?? null,
      standardLow: m.standard?.[0] ?? null,
      standardHigh: m.standard?.[1] ?? null,
      severity: m.severity,
      notes: m.notes ?? null,
    }));
    await db.insert(biomarker).values(rows);
    console.log(`  ✓ inserted ${rows.length} markers`);
  }

  console.log("\nDone.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
