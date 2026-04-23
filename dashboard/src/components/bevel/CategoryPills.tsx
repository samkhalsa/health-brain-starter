"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  CATEGORIES,
  CATEGORY_LABEL,
  type BiomarkerCategory,
} from "@/lib/biomarkers/ranges";

export function CategoryPills() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const current = (params.get("cat") as BiomarkerCategory | null) ?? "all";

  const set = (cat: string) => {
    const next = new URLSearchParams(params);
    if (cat === "all") next.delete("cat");
    else next.set("cat", cat);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  const pills: { value: string; label: string }[] = [
    { value: "all", label: "All" },
    ...CATEGORIES.map((c) => ({ value: c, label: CATEGORY_LABEL[c] })),
  ];

  return (
    <div
      className="flex gap-2 overflow-x-auto whitespace-nowrap [&::-webkit-scrollbar]:hidden -mx-1 px-1 py-1"
      style={{ scrollbarWidth: "none" }}
    >
      {pills.map((p) => (
        <button
          key={p.value}
          onClick={() => set(p.value)}
          className={cn(
            "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
            current === p.value
              ? "border-accent bg-accent/10 text-accent"
              : "border-border bg-card text-muted hover:text-fg"
          )}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
