export function StrainCompare({
  todayStrain,
  weekAvg,
}: {
  todayStrain: number | null;
  weekAvg: number | null;
}) {
  const t = todayStrain ?? 0;
  const pct = Math.min(100, (t / 21) * 100);
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[10px] uppercase tracking-widest text-muted">Strain</div>
        <div className="text-xs text-muted tabular-nums">
          7d avg {weekAvg?.toFixed(1) ?? "—"}
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-semibold tabular-nums">
          {todayStrain?.toFixed(1) ?? "—"}
        </span>
        <span className="text-xs text-muted">/ 21</span>
      </div>
      <div className="mt-3 h-2 w-full rounded-full bg-bg overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-sky-500 to-emerald-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
