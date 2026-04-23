import { getLatestBiomarkers } from "@/lib/biomarkers/data";
import {
  BIOMARKER_META,
  CATEGORY_LABEL,
  type BiomarkerCategory,
} from "@/lib/biomarkers/ranges";
import { BiomarkerCard } from "@/components/bevel/BiomarkerCard";
import { CategoryPills } from "@/components/bevel/CategoryPills";

export const dynamic = "force-dynamic";

export default async function BiomarkersPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat } = await searchParams;
  const rows = await getLatestBiomarkers();

  if (rows.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Biomarkers</h1>
        <p className="text-muted">
          No biomarker panels yet. Run <code>npm run seed:biomarkers</code> to
          import from <code>data/biomarkers.seed.json</code>.
        </p>
      </div>
    );
  }

  const filtered =
    cat && cat !== "all"
      ? rows.filter((r) => BIOMARKER_META[r.markerKey]?.category === cat)
      : rows;

  const drawnAt = rows[0].drawnAt;
  const lab = rows[0].lab;

  // Group by category for section headers when "All"
  const grouped: Record<string, typeof filtered> = {};
  for (const r of filtered) {
    const c = BIOMARKER_META[r.markerKey]?.category ?? "other";
    (grouped[c] = grouped[c] || []).push(r);
  }

  const criticalCount = rows.filter((r) => r.severity === "critical").length;
  const highCount = rows.filter((r) => r.severity === "high").length;
  const optimalCount = rows.filter((r) => r.severity === "optimal").length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Biomarkers</h1>
        <p className="text-xs text-muted mt-1">
          Latest panel: {drawnAt}
          {lab && ` · ${lab}`} · {rows.length} markers
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:max-w-md">
        <Stat label="Critical" value={criticalCount} tone="critical" />
        <Stat label="High/Monitor" value={highCount} tone="high" />
        <Stat label="Optimal" value={optimalCount} tone="optimal" />
      </div>

      <div className="sticky top-[57px] sm:top-[61px] -mx-4 sm:-mx-6 px-4 sm:px-6 py-2 bg-bg/90 backdrop-blur z-[5] border-b border-border">
        <CategoryPills />
      </div>

      {Object.entries(grouped).map(([category, items]) => (
        <section key={category} className="space-y-3">
          {(!cat || cat === "all") && (
            <h2 className="text-[10px] uppercase tracking-widest text-muted pt-2">
              {CATEGORY_LABEL[category as BiomarkerCategory] ?? category}
            </h2>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {items.map((r) => (
              <BiomarkerCard key={r.markerKey} {...r} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "critical" | "high" | "optimal";
}) {
  const colors = {
    critical: "text-recovery-red border-recovery-red/30 bg-recovery-red/5",
    high: "text-recovery-yellow border-recovery-yellow/30 bg-recovery-yellow/5",
    optimal: "text-recovery-green border-recovery-green/30 bg-recovery-green/5",
  };
  return (
    <div className={`rounded-lg border px-3 py-2 ${colors[tone]}`}>
      <div className="text-[10px] uppercase tracking-widest opacity-80">{label}</div>
      <div className="text-xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}
