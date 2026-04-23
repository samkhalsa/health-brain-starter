import Link from "next/link";
import { notFound } from "next/navigation";
import { getBiomarkerHistory } from "@/lib/biomarkers/data";
import { BIOMARKER_META, CATEGORY_LABEL } from "@/lib/biomarkers/ranges";
import { RangeBar } from "@/components/bevel/RangeBar";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const SEVERITY_CLASSES = {
  optimal: "bg-recovery-green/15 text-recovery-green border-recovery-green/30",
  monitor: "bg-recovery-yellow/15 text-recovery-yellow border-recovery-yellow/30",
  high: "bg-recovery-yellow/15 text-recovery-yellow border-recovery-yellow/30",
  critical: "bg-recovery-red/15 text-recovery-red border-recovery-red/30",
} as const;

function fmtValue(v: number): string {
  if (Math.abs(v) >= 100) return v.toFixed(0);
  if (Math.abs(v) >= 10) return v.toFixed(1);
  return v.toFixed(2);
}

export default async function BiomarkerDetailPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  const history = await getBiomarkerHistory(key);
  const meta = BIOMARKER_META[key];

  if (history.length === 0 || !meta) notFound();

  const latest = history[history.length - 1];
  const prev = history.length > 1 ? history[history.length - 2] : null;
  const delta = prev ? latest.value - prev.value : null;

  return (
    <div className="space-y-6">
      <Link
        href="/biomarkers"
        className="text-sm text-muted hover:text-fg inline-flex items-center gap-1"
      >
        ← Biomarkers
      </Link>

      <div>
        <div className="text-xs uppercase tracking-widest text-muted">
          {CATEGORY_LABEL[meta.category]}
        </div>
        <h1 className="text-3xl font-semibold mt-1">{meta.name}</h1>
        {meta.why && <p className="text-sm text-muted mt-2 max-w-prose">{meta.why}</p>}
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="text-xs text-muted">Latest · {latest.drawnAt}</div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-5xl font-semibold tabular-nums">
                {fmtValue(latest.value)}
              </span>
              {latest.unit && <span className="text-lg text-muted">{latest.unit}</span>}
            </div>
            {delta !== null && (
              <div className="text-xs text-muted mt-1">
                {delta > 0 ? "▲" : delta < 0 ? "▼" : "·"} {Math.abs(delta).toFixed(2)}{" "}
                vs previous panel
              </div>
            )}
          </div>
          <span
            className={cn(
              "shrink-0 px-3 py-1 text-[10px] font-semibold tracking-widest uppercase rounded-full border",
              SEVERITY_CLASSES[latest.severity]
            )}
          >
            {latest.severity}
          </span>
        </div>

        <RangeBar
          value={latest.value}
          optimal={[latest.optimalLow, latest.optimalHigh]}
          standard={[latest.standardLow, latest.standardHigh]}
          unit={latest.unit ?? undefined}
          severity={latest.severity}
        />
      </div>

      {(latest.notes || meta.lever) && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          {latest.notes && (
            <div>
              <div className="text-xs uppercase tracking-widest text-muted mb-1">
                Panel notes
              </div>
              <div className="text-sm text-fg">{latest.notes}</div>
            </div>
          )}
          {meta.lever && (
            <div>
              <div className="text-xs uppercase tracking-widest text-muted mb-1">
                Lever
              </div>
              <div className="text-sm text-fg">{meta.lever}</div>
            </div>
          )}
        </div>
      )}

      {history.length > 1 && (
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="text-[10px] uppercase tracking-widest text-muted mb-3">
            History ({history.length} panels)
          </div>
          <ul className="divide-y divide-border/50">
            {[...history].reverse().map((h) => (
              <li
                key={h.panelId}
                className="flex items-baseline gap-3 py-2 text-sm"
              >
                <span className="text-xs text-muted w-24 shrink-0">{h.drawnAt}</span>
                <span className="tabular-nums text-fg">{fmtValue(h.value)}</span>
                <span className="text-xs text-muted">{h.unit}</span>
                <span
                  className={cn(
                    "ml-auto shrink-0 px-2 py-0.5 text-[10px] font-semibold tracking-widest uppercase rounded-full border",
                    SEVERITY_CLASSES[h.severity]
                  )}
                >
                  {h.severity}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
