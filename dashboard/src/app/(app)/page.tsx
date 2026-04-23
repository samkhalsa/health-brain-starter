import { getTodayData } from "@/lib/dashboard-data";
import { getDemoData } from "@/lib/demo-data";
import { RecoveryRing } from "@/components/whoop/RecoveryRing";
import { StatTile } from "@/components/whoop/StatTile";
import { SleepStagesBar } from "@/components/whoop/SleepStagesBar";
import { StrainCompare } from "@/components/whoop/StrainCompare";
import { WeightSparkline } from "@/components/body/WeightSparkline";
import { PrescriptionCard } from "@/components/prescribe/PrescriptionCard";
import { RulesChips } from "@/components/prescribe/RulesChips";
import { SupplementChecklist } from "@/components/prescribe/SupplementChecklist";
import { RefreshButton } from "@/components/RefreshButton";
import { displaySportName } from "@/lib/whoop/labels";
import { fmtDelta, kgToLb, relativeTime } from "@/lib/utils";
import { formatTorontoDate } from "@/lib/timezone";

export const dynamic = "force-dynamic";

export default async function TodayPage() {
  let data;
  let isDemo = false;
  try {
    data = await getTodayData();
    // Empty DB = also show demo so first-time UX isn't blank
    if (data.recovery.score === null && data.weight.latestLb === null) {
      data = getDemoData();
      isDemo = true;
    }
  } catch {
    data = getDemoData();
    isDemo = true;
  }
  const { recovery, sleep, strain, weight, workouts, lastSync, prescription, supplementsTakenKeys } = data;

  const hrvDelta =
    recovery.hrv !== null && recovery.hrv30dAvg
      ? ((recovery.hrv - recovery.hrv30dAvg) / recovery.hrv30dAvg) * 100
      : null;
  const rhrDelta =
    recovery.rhr !== null && recovery.rhr30dAvg
      ? recovery.rhr - recovery.rhr30dAvg
      : null;
  const weight7dDelta =
    weight.avg7dKg !== null && weight.avg30dKg !== null
      ? kgToLb(weight.avg7dKg - weight.avg30dKg)
      : null;

  const oldest = Math.max(
    lastSync.whoop ? Date.now() - lastSync.whoop.getTime() : 0,
    lastSync.withings ? Date.now() - lastSync.withings.getTime() : 0
  );
  const stale = oldest > 26 * 3600 * 1000;

  return (
    <div className="space-y-6">
      {isDemo && (
        <div className="rounded-lg border border-recovery-yellow/40 bg-recovery-yellow/10 px-3 sm:px-4 py-2 text-xs text-recovery-yellow">
          <strong>DEMO MODE</strong>
          <span className="hidden sm:inline">
            {" "}— showing synthesized data that mirrors your 30-day averages.
            Connect Vercel Postgres + seed tokens to see live data.
          </span>
          <span className="sm:hidden">
            {" "}— connect Postgres for live data.
          </span>
        </div>
      )}
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs text-muted">
        <div className="shrink-0">{formatTorontoDate()}</div>
        <div className="flex items-center gap-3">
          <div className={(stale ? "text-recovery-red " : "") + "shrink-0"}>
            <span className="hidden sm:inline">
              WHOOP {relativeTime(lastSync.whoop)} · Withings {relativeTime(lastSync.withings)}
            </span>
            <span className="sm:hidden">
              ⬤ {relativeTime(lastSync.whoop)} · {relativeTime(lastSync.withings)}
            </span>
          </div>
          <RefreshButton />
        </div>
      </div>

      {/* Hero: Recovery ring + stat tiles */}
      <section className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-4 sm:gap-6 items-center">
        <div className="flex justify-center md:justify-start">
          <RecoveryRing score={recovery.score} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
          <StatTile
            label="HRV (rMSSD)"
            value={recovery.hrv?.toFixed(1) ?? null}
            unit="ms"
            delta={hrvDelta !== null ? fmtDelta(hrvDelta, "% vs 30d") : null}
          />
          <StatTile
            label="Resting HR"
            value={recovery.rhr?.toFixed(0) ?? null}
            unit="bpm"
            delta={rhrDelta !== null ? fmtDelta(rhrDelta, " bpm vs 30d") : null}
          />
          <StatTile
            label="Sleep"
            value={sleep.hours?.toFixed(1) ?? null}
            unit="hrs"
            hint={sleep.efficiencyPct ? `${sleep.efficiencyPct.toFixed(0)}% efficient` : undefined}
          />
          <StatTile
            label="Weight"
            value={weight.latestLb?.toFixed(1) ?? null}
            unit="lbs"
            delta={weight7dDelta !== null ? fmtDelta(weight7dDelta, " lbs vs 30d") : null}
          />
          <StatTile
            label="Body Fat"
            value={weight.fatRatioPct?.toFixed(1) ?? null}
            unit="%"
            hint="BIA — noisy"
          />
          <StatTile
            label="SpO₂"
            value={recovery.spo2?.toFixed(1) ?? null}
            unit="%"
            hint={
              recovery.skinTemp !== null
                ? `Skin ${recovery.skinTemp.toFixed(1)}°C`
                : undefined
            }
          />
        </div>
      </section>

      {/* Prescription */}
      <section>
        <PrescriptionCard rx={prescription} />
        <div className="mt-3">
          <RulesChips rules={prescription.rulesFired} />
        </div>
      </section>

      {/* Daily supplements */}
      <section>
        <SupplementChecklist takenKeys={supplementsTakenKeys} />
      </section>

      {/* Lower strip: sleep, strain, weight sparkline */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        <SleepStagesBar
          deepMs={sleep.deepMs}
          remMs={sleep.remMs}
          lightMs={sleep.lightMs}
          awakeMs={sleep.awakeMs}
          efficiencyPct={sleep.efficiencyPct}
        />
        <StrainCompare todayStrain={strain.today} weekAvg={strain.weekAvg} />
        <WeightSparkline data={weight.sparkline14d} goalLb={200} />
      </section>

      {/* Recent workouts */}
      {workouts.length > 0 && (
        <section className="rounded-xl border border-border bg-card p-4">
          <div className="text-[10px] uppercase tracking-widest text-muted mb-3">
            Recent Workouts
          </div>
          <ul className="divide-y divide-border/50">
            {workouts.map((w, i) => (
              <li key={i} className="flex items-center gap-3 py-2 text-sm">
                <span className="text-fg">{displaySportName(w.sport)}</span>
                <span className="ml-auto text-muted tabular-nums">
                  strain {w.strain?.toFixed(1) ?? "—"}
                </span>
                <span className="text-xs text-muted w-20 text-right">
                  {w.start ? relativeTime(w.start) : "—"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
