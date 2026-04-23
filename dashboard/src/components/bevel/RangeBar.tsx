import { cn } from "@/lib/utils";

/**
 * Horizontal range visualisation (Bevel-style).
 *
 * Three zones:
 *   - grey:  overall "standard/measurable" range
 *   - green: longevity-optimal band
 *   - dot:   your measured value
 *
 * When an optimal bound is null (e.g. "lower is better, no floor"),
 * the green band extends to the matching grey edge.
 */

type Props = {
  value: number;
  optimal: [number | null, number | null];
  standard?: [number | null, number | null];
  unit?: string;
  severity: "optimal" | "monitor" | "high" | "critical";
};

function niceMinMax(
  value: number,
  optimal: [number | null, number | null],
  standard?: [number | null, number | null]
): [number, number] {
  const candidates = [
    value,
    optimal[0],
    optimal[1],
    standard?.[0],
    standard?.[1],
  ].filter((n): n is number => n !== null && n !== undefined);
  let min = Math.min(...candidates);
  let max = Math.max(...candidates);
  // 10% padding
  const pad = (max - min) * 0.15 || Math.max(1, Math.abs(max) * 0.15);
  min -= pad;
  max += pad;
  return [min, max];
}

const DOT_COLOR: Record<Props["severity"], string> = {
  optimal: "bg-recovery-green",
  monitor: "bg-recovery-yellow",
  high: "bg-recovery-yellow",
  critical: "bg-recovery-red",
};

export function RangeBar({ value, optimal, standard, unit, severity }: Props) {
  const [min, max] = niceMinMax(value, optimal, standard);
  const span = max - min;
  const pct = (n: number) => Math.max(0, Math.min(100, ((n - min) / span) * 100));

  const stdLo = standard?.[0] ?? min;
  const stdHi = standard?.[1] ?? max;
  const optLo = optimal[0] ?? stdLo;
  const optHi = optimal[1] ?? stdHi;

  const dotColor = DOT_COLOR[severity];

  return (
    <div className="w-full">
      <div className="relative h-2.5 rounded-full bg-bg overflow-hidden">
        {/* standard band */}
        <div
          className="absolute top-0 bottom-0 bg-border"
          style={{ left: `${pct(stdLo)}%`, width: `${pct(stdHi) - pct(stdLo)}%` }}
        />
        {/* optimal band */}
        <div
          className="absolute top-0 bottom-0 bg-recovery-green/50"
          style={{ left: `${pct(optLo)}%`, width: `${pct(optHi) - pct(optLo)}%` }}
        />
        {/* your value dot */}
        <div
          className={cn(
            "absolute top-1/2 -translate-y-1/2 h-4 w-4 rounded-full ring-2 ring-bg",
            dotColor
          )}
          style={{ left: `calc(${pct(value)}% - 8px)` }}
        />
      </div>
      <div className="flex items-center justify-between mt-1 text-[10px] text-muted tabular-nums">
        <span>{min.toFixed(fmtPrecision(value))}{unit ? ` ${unit}` : ""}</span>
        <span className="text-recovery-green">
          opt {optLo === stdLo ? "↓" : optLo.toFixed(fmtPrecision(optLo))}
          {"–"}
          {optHi === stdHi ? "↑" : optHi.toFixed(fmtPrecision(optHi))}
        </span>
        <span>{max.toFixed(fmtPrecision(value))}{unit ? ` ${unit}` : ""}</span>
      </div>
    </div>
  );
}

function fmtPrecision(v: number): number {
  if (Math.abs(v) >= 100) return 0;
  if (Math.abs(v) >= 10) return 1;
  return 2;
}
