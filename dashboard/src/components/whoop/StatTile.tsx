import { cn } from "@/lib/utils";

export function StatTile({
  label,
  value,
  unit,
  delta,
  hint,
  className,
}: {
  label: string;
  value: string | number | null;
  unit?: string;
  delta?: string | null;
  hint?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card px-4 py-3 flex flex-col",
        className
      )}
    >
      <div className="text-[10px] uppercase tracking-widest text-muted">{label}</div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-2xl font-semibold text-fg tabular-nums">
          {value ?? "—"}
        </span>
        {unit && <span className="text-sm text-muted">{unit}</span>}
      </div>
      {(delta || hint) && (
        <div className="text-xs text-muted mt-0.5 tabular-nums">
          {delta ?? hint}
        </div>
      )}
    </div>
  );
}
