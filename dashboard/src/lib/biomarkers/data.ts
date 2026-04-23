import { desc, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { biomarker, biomarkerPanel } from "@/lib/db/schema";
import { BIOMARKER_META } from "./ranges";

export type BiomarkerRow = {
  markerKey: string;
  value: number;
  unit: string | null;
  optimalLow: number | null;
  optimalHigh: number | null;
  standardLow: number | null;
  standardHigh: number | null;
  severity: "optimal" | "monitor" | "high" | "critical";
  notes: string | null;
  panelId: number;
  drawnAt: string; // ISO date
  lab: string | null;
};

export async function getLatestBiomarkers(): Promise<BiomarkerRow[]> {
  const latestPanel = await db
    .select()
    .from(biomarkerPanel)
    .orderBy(desc(biomarkerPanel.drawnAt))
    .limit(1);
  if (!latestPanel[0]) return [];
  const pid = latestPanel[0].id;
  const rows = await db
    .select()
    .from(biomarker)
    .where(sql`${biomarker.panelId} = ${pid}`);

  // Sort by category then by severity (critical → optimal)
  const sevOrder = { critical: 0, high: 1, monitor: 2, optimal: 3 };
  const sorted = rows.sort((a, b) => {
    const metaA = BIOMARKER_META[a.markerKey];
    const metaB = BIOMARKER_META[b.markerKey];
    const catCmp = (metaA?.category ?? "zzz").localeCompare(metaB?.category ?? "zzz");
    if (catCmp !== 0) return catCmp;
    return (
      (sevOrder[a.severity ?? "optimal"] ?? 9) -
      (sevOrder[b.severity ?? "optimal"] ?? 9)
    );
  });

  return sorted.map((r) => ({
    markerKey: r.markerKey,
    value: Number(r.value),
    unit: r.unit,
    optimalLow: r.optimalLow !== null ? Number(r.optimalLow) : null,
    optimalHigh: r.optimalHigh !== null ? Number(r.optimalHigh) : null,
    standardLow: r.standardLow !== null ? Number(r.standardLow) : null,
    standardHigh: r.standardHigh !== null ? Number(r.standardHigh) : null,
    severity: (r.severity ?? "optimal") as BiomarkerRow["severity"],
    notes: r.notes,
    panelId: r.panelId,
    drawnAt: String(latestPanel[0].drawnAt),
    lab: latestPanel[0].lab,
  }));
}

export async function getBiomarkerHistory(markerKey: string): Promise<BiomarkerRow[]> {
  const rows = await db
    .select({
      markerKey: biomarker.markerKey,
      value: biomarker.value,
      unit: biomarker.unit,
      optimalLow: biomarker.optimalLow,
      optimalHigh: biomarker.optimalHigh,
      standardLow: biomarker.standardLow,
      standardHigh: biomarker.standardHigh,
      severity: biomarker.severity,
      notes: biomarker.notes,
      panelId: biomarker.panelId,
      drawnAt: biomarkerPanel.drawnAt,
      lab: biomarkerPanel.lab,
    })
    .from(biomarker)
    .innerJoin(biomarkerPanel, sql`${biomarker.panelId} = ${biomarkerPanel.id}`)
    .where(sql`${biomarker.markerKey} = ${markerKey}`)
    .orderBy(biomarkerPanel.drawnAt);

  return rows.map((r) => ({
    markerKey: r.markerKey,
    value: Number(r.value),
    unit: r.unit,
    optimalLow: r.optimalLow !== null ? Number(r.optimalLow) : null,
    optimalHigh: r.optimalHigh !== null ? Number(r.optimalHigh) : null,
    standardLow: r.standardLow !== null ? Number(r.standardLow) : null,
    standardHigh: r.standardHigh !== null ? Number(r.standardHigh) : null,
    severity: (r.severity ?? "optimal") as BiomarkerRow["severity"],
    notes: r.notes,
    panelId: r.panelId,
    drawnAt: String(r.drawnAt),
    lab: r.lab,
  }));
}
