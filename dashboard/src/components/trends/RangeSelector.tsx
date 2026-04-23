"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { RANGE_LABELS, type RangeKey } from "@/lib/trends-data";

const KEYS: RangeKey[] = ["7d", "30d", "90d", "180d", "12mo", "all"];

export function RangeSelector({ current }: { current: RangeKey }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const set = (next: RangeKey) => {
    const qs = new URLSearchParams(params);
    if (next === "30d") qs.delete("r");
    else qs.set("r", next);
    router.replace(`${pathname}?${qs.toString()}`, { scroll: false });
  };

  return (
    <div
      className="flex gap-2 overflow-x-auto whitespace-nowrap [&::-webkit-scrollbar]:hidden -mx-1 px-1 py-1"
      style={{ scrollbarWidth: "none" }}
    >
      {KEYS.map((k) => (
        <button
          key={k}
          onClick={() => set(k)}
          className={cn(
            "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
            current === k
              ? "border-accent bg-accent/10 text-accent"
              : "border-border bg-card text-muted hover:text-fg"
          )}
        >
          {RANGE_LABELS[k]}
        </button>
      ))}
    </div>
  );
}
