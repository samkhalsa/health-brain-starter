import { msToHours } from "@/lib/utils";

type Stages = {
  deep: number | null;
  rem: number | null;
  light: number | null;
  awake: number | null;
};

export function SleepStagesBar({
  deepMs,
  remMs,
  lightMs,
  awakeMs,
  efficiencyPct,
}: {
  deepMs: number | null;
  remMs: number | null;
  lightMs: number | null;
  awakeMs: number | null;
  efficiencyPct: number | null;
}) {
  const deep = deepMs ?? 0;
  const rem = remMs ?? 0;
  const light = lightMs ?? 0;
  const awake = awakeMs ?? 0;
  const total = deep + rem + light + awake || 1;
  const pct = (ms: number) => (ms / total) * 100;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[10px] uppercase tracking-widest text-muted">Sleep</div>
        <div className="text-xs text-muted tabular-nums">
          {msToHours(deep + rem + light)} hrs · {efficiencyPct?.toFixed(0) ?? "—"}% eff
        </div>
      </div>
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-bg">
        <div className="bg-indigo-500" style={{ width: `${pct(deep)}%` }} title={`Deep ${msToHours(deep)}h`} />
        <div className="bg-violet-400" style={{ width: `${pct(rem)}%` }} title={`REM ${msToHours(rem)}h`} />
        <div className="bg-sky-500" style={{ width: `${pct(light)}%` }} title={`Light ${msToHours(light)}h`} />
        <div className="bg-zinc-600" style={{ width: `${pct(awake)}%` }} title={`Awake ${msToHours(awake)}h`} />
      </div>
      <div className="mt-3 grid grid-cols-4 gap-2 text-xs">
        <Stage label="Deep" color="bg-indigo-500" hrs={msToHours(deep)} />
        <Stage label="REM" color="bg-violet-400" hrs={msToHours(rem)} />
        <Stage label="Light" color="bg-sky-500" hrs={msToHours(light)} />
        <Stage label="Awake" color="bg-zinc-600" hrs={msToHours(awake)} />
      </div>
    </div>
  );
}

function Stage({ label, color, hrs }: { label: string; color: string; hrs: number | null }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`inline-block h-2 w-2 rounded-full ${color}`} />
      <span className="text-muted">{label}</span>
      <span className="ml-auto text-fg tabular-nums">{hrs ?? "—"}h</span>
    </div>
  );
}
