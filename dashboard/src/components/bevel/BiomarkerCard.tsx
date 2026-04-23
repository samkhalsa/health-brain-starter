import Link from "next/link";
import { cn } from "@/lib/utils";
import { RangeBar } from "./RangeBar";
import { BIOMARKER_META } from "@/lib/biomarkers/ranges";

export type BiomarkerCardProps = {
  markerKey: string;
  value: number;
  unit: string | null;
  optimalLow: number | null;
  optimalHigh: number | null;
  standardLow: number | null;
  standardHigh: number | null;
  severity: "optimal" | "monitor" | "high" | "critical";
  notes: string | null;
  trendArrow?: "up-good" | "up-bad" | "down-good" | "down-bad" | "flat" | null;
};

const SEVERITY_RIBBON: Record<BiomarkerCardProps["severity"], string> = {
  optimal: "bg-recovery-green/15 text-recovery-green border-recovery-green/30",
  monitor: "bg-recovery-yellow/15 text-recovery-yellow border-recovery-yellow/30",
  high: "bg-recovery-yellow/15 text-recovery-yellow border-recovery-yellow/30",
  critical: "bg-recovery-red/15 text-recovery-red border-recovery-red/30",
};

const SEVERITY_LABEL: Record<BiomarkerCardProps["severity"], string> = {
  optimal: "OPTIMAL",
  monitor: "MONITOR",
  high: "HIGH",
  critical: "CRITICAL",
};

function fmtValue(v: number): string {
  if (Math.abs(v) >= 100) return v.toFixed(0);
  if (Math.abs(v) >= 10) return v.toFixed(1);
  return v.toFixed(2);
}

export function BiomarkerCard(props: BiomarkerCardProps) {
  const meta = BIOMARKER_META[props.markerKey];
  const name = meta?.name ?? props.markerKey;

  return (
    <Link
      href={`/biomarkers/${props.markerKey}`}
      className="block rounded-xl border border-border bg-card p-4 hover:border-muted transition-colors"
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="min-w-0 flex-1">
          <div className="text-sm text-muted mb-0.5">{name}</div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-fg tabular-nums">
              {fmtValue(props.value)}
            </span>
            {props.unit && <span className="text-sm text-muted">{props.unit}</span>}
          </div>
        </div>
        <span
          className={cn(
            "shrink-0 px-2 py-0.5 text-[10px] font-semibold tracking-widest uppercase rounded-full border",
            SEVERITY_RIBBON[props.severity]
          )}
        >
          {SEVERITY_LABEL[props.severity]}
        </span>
      </div>

      <RangeBar
        value={props.value}
        optimal={[props.optimalLow, props.optimalHigh]}
        standard={[props.standardLow, props.standardHigh]}
        unit={props.unit ?? undefined}
        severity={props.severity}
      />

      {(meta?.why || props.notes) && (
        <div className="mt-3 text-xs text-muted leading-relaxed">
          {meta?.why}
          {props.notes && (
            <span className="block mt-1 text-fg/80">{props.notes}</span>
          )}
        </div>
      )}
    </Link>
  );
}
