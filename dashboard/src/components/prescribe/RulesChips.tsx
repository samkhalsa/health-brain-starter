export function RulesChips({ rules }: { rules: string[] }) {
  if (!rules.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {rules.map((r) => (
        <span
          key={r}
          className="inline-flex items-center rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] text-muted"
        >
          {r}
        </span>
      ))}
    </div>
  );
}
