import { cn } from "@/lib/utils";

function colorFor(score: number): { stroke: string; text: string; label: string } {
  if (score >= 67) return { stroke: "#22c55e", text: "text-recovery-green", label: "GREEN" };
  if (score >= 34) return { stroke: "#f59e0b", text: "text-recovery-yellow", label: "YELLOW" };
  return { stroke: "#ef4444", text: "text-recovery-red", label: "RED" };
}

export function RecoveryRing({
  score,
  size = 200,
  stroke = 14,
}: {
  score: number | null;
  size?: number;
  stroke?: number;
}) {
  const s = score ?? 0;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const { stroke: ringColor, text, label } = colorFor(s);
  const offset = circumference - (s / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#232832"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 600ms ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className={cn("text-5xl font-semibold tabular-nums", text)}>
          {score === null ? "—" : Math.round(s)}
          {score !== null && <span className="text-2xl opacity-60">%</span>}
        </div>
        <div className={cn("text-xs tracking-widest mt-1", text)}>{label}</div>
        <div className="text-[10px] text-muted uppercase tracking-widest mt-0.5">
          Recovery
        </div>
      </div>
    </div>
  );
}
