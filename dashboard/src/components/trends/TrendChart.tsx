"use client";

import {
  LineChart,
  Line,
  ResponsiveContainer,
  YAxis,
  XAxis,
  Tooltip,
  ReferenceArea,
  ReferenceLine,
  CartesianGrid,
} from "recharts";
import type { Point, TrendSeries } from "@/lib/trends-data";
import { summarize } from "@/lib/trends-data";
import { cn } from "@/lib/utils";

type Props = TrendSeries;

type Row = { date: string; value: number | null; rolling: number | null };

function mergePoints(data: Point[], rolling?: Point[]): Row[] {
  const byDate = new Map<string, Row>();
  for (const p of data) byDate.set(p.date, { date: p.date, value: p.value, rolling: null });
  if (rolling) {
    for (const p of rolling) {
      const cur = byDate.get(p.date);
      if (cur) cur.rolling = p.value;
      else byDate.set(p.date, { date: p.date, value: null, rolling: p.value });
    }
  }
  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}

function fmt(v: number | null, precision: number, unit: string): string {
  if (v === null) return "—";
  return `${v.toFixed(precision)}${unit ? " " + unit : ""}`;
}

export function TrendChart({
  label,
  unit,
  data,
  rolling7,
  optimalMin,
  optimalMax,
  goalLines,
  direction,
  precision,
}: Props) {
  const rows = mergePoints(data, rolling7);
  const s = summarize(data, precision);
  const deltaIsGood =
    s.delta === null
      ? null
      : direction === "higher"
      ? s.delta > 0
      : direction === "lower"
      ? s.delta < 0
      : null;
  const deltaColor =
    deltaIsGood === null
      ? "text-muted"
      : deltaIsGood
      ? "text-recovery-green"
      : "text-recovery-red";

  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-baseline justify-between gap-2 mb-2 flex-wrap">
        <div className="text-sm text-muted">
          {label}
          {unit ? ` (${unit})` : ""}
        </div>
        <div className="text-xs text-muted tabular-nums">
          latest <span className="text-fg">{fmt(s.latest, precision, "")}</span>
          {" · "}
          avg <span className="text-fg">{fmt(s.avg, precision, "")}</span>
          {" · "}
          min/max{" "}
          <span className="text-fg">
            {fmt(s.min, precision, "")}/{fmt(s.max, precision, "")}
          </span>
          {s.delta !== null && (
            <>
              {" · "}
              <span className={cn("tabular-nums", deltaColor)}>
                Δ {s.delta > 0 ? "+" : ""}
                {s.delta.toFixed(precision)}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="h-36 sm:h-40 -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows} margin={{ top: 6, right: 6, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="#232832" strokeDasharray="2 4" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#7a8699"
              tick={{ fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(d: string) =>
                d ? `${d.slice(5, 7)}/${d.slice(8, 10)}` : ""
              }
              interval="preserveStartEnd"
              minTickGap={24}
            />
            <YAxis
              stroke="#7a8699"
              tick={{ fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={32}
              domain={["auto", "auto"]}
            />
            {optimalMin !== undefined && optimalMax !== undefined && (
              <ReferenceArea
                y1={optimalMin ?? undefined}
                y2={optimalMax ?? undefined}
                fill="#22c55e"
                fillOpacity={0.08}
                stroke="none"
              />
            )}
            {optimalMin === undefined && optimalMax !== undefined && (
              <ReferenceLine
                y={optimalMax ?? undefined}
                stroke="#22c55e"
                strokeDasharray="3 3"
                strokeOpacity={0.5}
              />
            )}
            {optimalMax === undefined && optimalMin !== undefined && (
              <ReferenceLine
                y={optimalMin ?? undefined}
                stroke="#22c55e"
                strokeDasharray="3 3"
                strokeOpacity={0.5}
              />
            )}
            {goalLines?.map((g) => (
              <ReferenceLine
                key={g.value}
                y={g.value}
                stroke="#4ade80"
                strokeOpacity={0.4}
                strokeDasharray="3 3"
                label={{
                  value: g.label,
                  position: "right",
                  fill: "#7a8699",
                  fontSize: 10,
                }}
              />
            ))}
            <Tooltip
              contentStyle={{
                background: "#111318",
                border: "1px solid #232832",
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: "#7a8699", fontSize: 11 }}
              formatter={(v, name) => {
                if (typeof v !== "number") return ["—", name];
                return [`${v.toFixed(precision)}${unit ? " " + unit : ""}`, name];
              }}
            />
            {rolling7 && (
              <Line
                dataKey="rolling"
                name="7d avg"
                type="monotone"
                stroke="#4ade80"
                strokeOpacity={0.35}
                strokeWidth={2}
                dot={false}
                connectNulls={false}
                isAnimationActive={false}
              />
            )}
            <Line
              dataKey="value"
              name={label}
              type="monotone"
              stroke="#4ade80"
              strokeWidth={2}
              dot={{ r: 1.5, fill: "#4ade80" }}
              activeDot={{ r: 4 }}
              connectNulls={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
