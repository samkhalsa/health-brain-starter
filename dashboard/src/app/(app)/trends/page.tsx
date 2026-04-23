import { getTrends, parseRange } from "@/lib/trends-data";
import { RangeSelector } from "@/components/trends/RangeSelector";
import { TrendChart } from "@/components/trends/TrendChart";

export const dynamic = "force-dynamic";

export default async function TrendsPage({
  searchParams,
}: {
  searchParams: Promise<{ r?: string }>;
}) {
  const { r } = await searchParams;
  const range = parseRange(r);
  const series = await getTrends(range);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Trends</h1>
        <p className="text-xs text-muted mt-1">
          All metrics over time. Tap a point for exact value.
        </p>
      </div>

      <div className="sticky top-[57px] sm:top-[61px] -mx-4 sm:-mx-6 px-4 sm:px-6 py-2 bg-bg/90 backdrop-blur z-[5] border-b border-border">
        <RangeSelector current={range} />
      </div>

      <div className="space-y-3">
        {series.map((s) => {
          const { key, ...rest } = s;
          return <TrendChart key={key} {...rest} />;
        })}
      </div>
    </div>
  );
}
