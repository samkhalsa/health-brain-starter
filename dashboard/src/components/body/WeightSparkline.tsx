"use client";

import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip } from "recharts";

type Point = { date: string; weightLb: number };

export function WeightSparkline({
  data,
  goalLb,
}: {
  data: Point[];
  goalLb?: number;
}) {
  if (!data.length) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted">
        No weigh-ins yet.
      </div>
    );
  }
  const latest = data[data.length - 1]?.weightLb;
  const min = Math.min(...data.map((d) => d.weightLb));
  const max = Math.max(...data.map((d) => d.weightLb));

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[10px] uppercase tracking-widest text-muted">
          Weight ({data.length}d)
        </div>
        <div className="text-xs text-muted tabular-nums">
          {latest?.toFixed(1)} lbs · range {min.toFixed(1)}–{max.toFixed(1)}
        </div>
      </div>
      <div className="h-20">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
            <YAxis domain={["dataMin - 1", "dataMax + 1"]} hide />
            <Tooltip
              contentStyle={{
                background: "#111318",
                border: "1px solid #232832",
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: "#7a8699" }}
              formatter={(v: number) => [`${v.toFixed(1)} lbs`, "Weight"]}
            />
            <Line
              type="monotone"
              dataKey="weightLb"
              stroke="#4ade80"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {goalLb && (
        <div className="mt-2 text-xs text-muted">
          Goal: <span className="text-fg">{goalLb} lbs</span>{" "}
          · {((latest ?? 0) - goalLb).toFixed(1)} lbs to go
        </div>
      )}
    </div>
  );
}
