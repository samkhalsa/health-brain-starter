"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { refreshData, type RefreshResult } from "@/app/(app)/actions";

type UiState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "success"; whoop: number; withings: number }
  | { kind: "error"; message: string };

export function RefreshButton() {
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<UiState>({ kind: "idle" });

  const onClick = () => {
    setState({ kind: "loading" });
    startTransition(async () => {
      try {
        const res: RefreshResult = await refreshData();
        if (res.ok) {
          setState({
            kind: "success",
            whoop: res.whoopRecords,
            withings: res.withingsRecords,
          });
        } else {
          setState({
            kind: "error",
            message: res.errors.join(" · ") || "Unknown error",
          });
        }
        setTimeout(() => setState({ kind: "idle" }), 3500);
      } catch (e) {
        setState({
          kind: "error",
          message: e instanceof Error ? e.message : String(e),
        });
        setTimeout(() => setState({ kind: "idle" }), 4500);
      }
    });
  };

  const disabled = isPending || state.kind === "loading";

  return (
    <div className="flex items-center gap-2">
      {state.kind === "success" && (
        <span className="text-[11px] text-recovery-green">
          ✓ synced {state.whoop} · {state.withings}
        </span>
      )}
      {state.kind === "error" && (
        <span className="text-[11px] text-recovery-red truncate max-w-[180px]" title={state.message}>
          ✗ {state.message}
        </span>
      )}
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label="Refresh data from WHOOP and Withings"
        className={cn(
          "inline-flex items-center justify-center h-8 w-8 rounded-full border border-border bg-card text-muted hover:text-fg hover:border-muted transition-colors",
          disabled && "opacity-60 cursor-not-allowed"
        )}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn("h-4 w-4", disabled && "animate-spin")}
        >
          <polyline points="23 4 23 10 17 10" />
          <polyline points="1 20 1 14 7 14" />
          <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
        </svg>
      </button>
    </div>
  );
}
