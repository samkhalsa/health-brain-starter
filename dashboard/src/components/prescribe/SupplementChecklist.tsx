"use client";

import { useTransition, useState } from "react";
import { cn } from "@/lib/utils";
import {
  SUPPLEMENTS,
  supplementsByBlock,
  type Supplement,
} from "@/lib/supplements";
import { toggleSupplement } from "@/app/(app)/actions";

export function SupplementChecklist({
  takenKeys,
}: {
  takenKeys: string[];
}) {
  const morning = supplementsByBlock("morning");
  const evening = supplementsByBlock("evening");
  const takenCount = takenKeys.length;
  const total = SUPPLEMENTS.length;

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="px-2.5 py-1 text-[10px] font-semibold tracking-widest uppercase rounded-full border border-border bg-surface text-muted">
          Stack
        </span>
        <div className="text-sm text-muted">Daily Supplements</div>
        <div className="ml-auto text-xs text-muted tabular-nums">
          {takenCount}/{total}
        </div>
      </div>

      <Block title="Morning" items={morning} takenKeys={takenKeys} />
      <div className="h-4" />
      <Block title="Evening" items={evening} takenKeys={takenKeys} />
    </div>
  );
}

function Block({
  title,
  items,
  takenKeys,
}: {
  title: string;
  items: Supplement[];
  takenKeys: string[];
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-muted mb-2">
        {title}
      </div>
      <ul className="space-y-1">
        {items.map((s) => (
          <SupplementRow
            key={s.key}
            supplement={s}
            taken={takenKeys.includes(s.key)}
          />
        ))}
      </ul>
    </div>
  );
}

function SupplementRow({
  supplement,
  taken,
}: {
  supplement: Supplement;
  taken: boolean;
}) {
  const [optimisticTaken, setOptimisticTaken] = useState(taken);
  const [isPending, startTransition] = useTransition();

  const onToggle = () => {
    const next = !optimisticTaken;
    setOptimisticTaken(next);
    startTransition(async () => {
      await toggleSupplement(supplement.key);
    });
  };

  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        disabled={isPending}
        className={cn(
          "w-full flex items-start gap-3 text-left py-3 px-2 -mx-2 rounded-lg transition-colors min-h-[44px]",
          "hover:bg-surface/70 active:bg-surface",
          isPending && "opacity-70"
        )}
      >
        <span
          className={cn(
            "mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors",
            optimisticTaken
              ? "border-recovery-green bg-recovery-green text-bg"
              : "border-border bg-bg"
          )}
          aria-hidden="true"
        >
          {optimisticTaken && (
            <svg
              viewBox="0 0 16 16"
              fill="none"
              className="h-4 w-4"
              strokeWidth={3}
              stroke="currentColor"
            >
              <path d="M3 8.5l3.5 3.5L13 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
        <span className="flex-1 min-w-0">
          <span
            className={cn(
              "block text-sm",
              optimisticTaken ? "text-muted line-through" : "text-fg"
            )}
          >
            {supplement.name}{" "}
            <span className="text-muted">— {supplement.dose}</span>
          </span>
          {supplement.note && (
            <span className="block text-xs text-muted mt-0.5">{supplement.note}</span>
          )}
        </span>
      </button>
    </li>
  );
}
