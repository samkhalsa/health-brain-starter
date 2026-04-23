import { cn } from "@/lib/utils";
import type { Prescription } from "@/lib/prescribe/engine";

const BADGE: Record<Prescription["intensity"], string> = {
  GREEN: "bg-recovery-green/15 text-recovery-green border-recovery-green/30",
  YELLOW: "bg-recovery-yellow/15 text-recovery-yellow border-recovery-yellow/30",
  RED: "bg-recovery-red/15 text-recovery-red border-recovery-red/30",
  REST: "bg-muted/15 text-muted border-border",
};

export function PrescriptionCard({ rx }: { rx: Prescription }) {
  const { scheduled, intensity, primaryBlock, modifications, warnings, affirmations } = rx;
  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-4">
        <span
          className={cn(
            "px-2.5 py-1 text-[10px] font-semibold tracking-widest uppercase rounded-full border",
            BADGE[intensity]
          )}
        >
          {intensity}
        </span>
        <div className="text-sm text-muted">Today's Prescription</div>
        <div className="ml-auto text-xs text-muted">{scheduled.duration}</div>
      </div>
      <h2 className="text-lg sm:text-xl font-semibold text-fg mb-1 leading-snug">{primaryBlock}</h2>
      <p className="text-sm text-muted mb-4">Focus: {scheduled.focus}</p>

      {intensity !== "REST" && (
        <ul className="space-y-2 mb-4">
          {scheduled.exercises.map((ex) => (
            <li
              key={ex}
              className="flex items-start gap-3 text-sm text-fg border-b border-border/50 last:border-0 pb-2 last:pb-0"
            >
              <span className="mt-1 block h-4 w-4 rounded border border-border bg-bg shrink-0" />
              <span>{ex}</span>
            </li>
          ))}
        </ul>
      )}

      {warnings.length > 0 && (
        <div className="space-y-1 mb-3">
          {warnings.map((w) => (
            <div
              key={w}
              className="rounded-lg border border-recovery-red/30 bg-recovery-red/5 px-3 py-2 text-sm text-recovery-red"
            >
              ⚠ {w}
            </div>
          ))}
        </div>
      )}
      {modifications.length > 0 && (
        <div className="space-y-1 mb-3">
          {modifications.map((m) => (
            <div
              key={m}
              className="rounded-lg border border-recovery-yellow/30 bg-recovery-yellow/5 px-3 py-2 text-sm text-fg"
            >
              ⇢ {m}
            </div>
          ))}
        </div>
      )}
      {affirmations.length > 0 && (
        <div className="space-y-1">
          {affirmations.map((a) => (
            <div
              key={a}
              className="rounded-lg border border-recovery-green/30 bg-recovery-green/5 px-3 py-2 text-sm text-recovery-green"
            >
              ✓ {a}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
