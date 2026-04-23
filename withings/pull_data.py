#!/usr/bin/env python3
"""
Pull Withings scale data and generate a markdown report for the Health Brain.

Usage:
    python3 pull_data.py                         # Last 30 days
    python3 pull_data.py 90                      # Last 90 days
    python3 pull_data.py 2026-01-01 2026-04-21   # Specific date range

Output:
    - withings_report.md    (formatted report — paste into sections/02_body_composition.md)
    - withings_raw.json     (raw measurements)
"""

import json
import sys
from datetime import datetime

from api import WithingsClient


KG_TO_LB = 2.20462


def kg_to_lb(kg):
    if kg is None:
        return None
    return round(kg * KG_TO_LB, 1)


def fmt(v, suffix=""):
    return f"{v}{suffix}" if v is not None else "—"


def collapse_to_daily(records):
    """If multiple weigh-ins per day, keep the last one (most recent that day)."""
    by_date = {}
    for r in records:
        by_date[r["date"]] = r  # records are sorted, so last write wins
    return sorted(by_date.values(), key=lambda r: r["date"])


def format_table(records):
    if not records:
        return "No measurements found in this period.\n"

    lines = [
        "| Date | Weight (lbs) | Weight (kg) | Body Fat % | Fat Mass (lbs) | Lean Mass (lbs) | Muscle (lbs) | Bone (lbs) | Water (lbs) | HR (bpm) |",
        "|------|------------|------------|-----------|---------------|----------------|-------------|-----------|------------|----------|",
    ]

    for r in records:
        weight_kg = r.get("weight_kg")
        weight_lb = kg_to_lb(weight_kg)
        fat_pct = r.get("fat_ratio_pct")
        fat_mass_lb = kg_to_lb(r.get("fat_mass_kg"))
        lean_lb = kg_to_lb(r.get("fat_free_mass_kg"))
        muscle_lb = kg_to_lb(r.get("muscle_mass_kg"))
        bone_lb = kg_to_lb(r.get("bone_mass_kg"))
        water_lb = kg_to_lb(r.get("hydration_kg"))
        hr = r.get("heart_pulse_bpm")

        lines.append(
            f"| {r['date']} | {fmt(weight_lb)} | {fmt(weight_kg)} | "
            f"{fmt(fat_pct)} | {fmt(fat_mass_lb)} | {fmt(lean_lb)} | "
            f"{fmt(muscle_lb)} | {fmt(bone_lb)} | {fmt(water_lb)} | {fmt(hr)} |"
        )
    return "\n".join(lines) + "\n"


def compute_summary(records):
    """Compute headline stats: latest, average, trend (first vs latest)."""
    if not records:
        return None

    def pluck(field):
        return [r[field] for r in records if r.get(field) is not None]

    weights = pluck("weight_kg")
    fats = pluck("fat_ratio_pct")
    leans = pluck("fat_free_mass_kg")
    muscles = pluck("muscle_mass_kg")

    def avg(lst):
        return round(sum(lst) / len(lst), 2) if lst else None

    latest = records[-1]
    first = records[0]

    return {
        "count": len(records),
        "first_date": first["date"],
        "latest_date": latest["date"],
        "latest_weight_kg": latest.get("weight_kg"),
        "latest_weight_lb": kg_to_lb(latest.get("weight_kg")),
        "latest_fat_pct": latest.get("fat_ratio_pct"),
        "latest_lean_lb": kg_to_lb(latest.get("fat_free_mass_kg")),
        "latest_muscle_lb": kg_to_lb(latest.get("muscle_mass_kg")),
        "avg_weight_kg": avg(weights),
        "avg_weight_lb": kg_to_lb(avg(weights)),
        "avg_fat_pct": avg(fats),
        "avg_lean_lb": kg_to_lb(avg(leans)),
        "avg_muscle_lb": kg_to_lb(avg(muscles)),
        "weight_change_kg": round(latest.get("weight_kg", 0) - first.get("weight_kg", 0), 2) if weights else None,
        "weight_change_lb": kg_to_lb(round(latest.get("weight_kg", 0) - first.get("weight_kg", 0), 2)) if weights else None,
        "fat_pct_change": round(latest.get("fat_ratio_pct", 0) - first.get("fat_ratio_pct", 0), 2) if fats and first.get("fat_ratio_pct") else None,
    }


def generate_report(data):
    period = data["period"]
    records = collapse_to_daily(data.get("measurements", []))
    summary = compute_summary(records)

    if summary is None:
        return f"""# Withings Scale Report

> Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}
> Period: {period.get('start', '?')[:10]} to {period.get('end', '?')[:10]}

No measurements found. Make sure the scale has synced to the Withings app.
"""

    # Targets — edit to your personal goals (see sections/14_goals.md).
    target_weight_lb = "[your target]"
    target_fat_pct = "[your target]"

    report = f"""# Withings Scale Report

> Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}
> Period: {period.get('start', '?')[:10]} to {period.get('end', '?')[:10]}
> Weigh-ins: {summary['count']}

---

## Latest Measurement ({summary['latest_date']})

| Metric | Value | Target | Delta from period start |
|--------|-------|--------|-------------------------|
| Weight | {fmt(summary['latest_weight_lb'], ' lbs')} ({fmt(summary['latest_weight_kg'], ' kg')}) | {target_weight_lb} lbs | {fmt(summary['weight_change_lb'], ' lbs')} |
| Body Fat % | {fmt(summary['latest_fat_pct'], '%')} | {target_fat_pct}% | {fmt(summary['fat_pct_change'], '%')} |
| Lean Mass | {fmt(summary['latest_lean_lb'], ' lbs')} | >70% of body weight | — |
| Muscle Mass | {fmt(summary['latest_muscle_lb'], ' lbs')} | Trending up | — |

> Note: Bioimpedance body-fat % is ±3–5% noisy — track *trend*, not absolute. DEXA remains source of truth.

---

## Period Averages

| Metric | Average |
|--------|---------|
| Weight | {fmt(summary['avg_weight_lb'], ' lbs')} ({fmt(summary['avg_weight_kg'], ' kg')}) |
| Body Fat % | {fmt(summary['avg_fat_pct'], '%')} |
| Lean Mass | {fmt(summary['avg_lean_lb'], ' lbs')} |
| Muscle Mass | {fmt(summary['avg_muscle_lb'], ' lbs')} |

---

## All Weigh-Ins

{format_table(records)}
"""
    return report


def main():
    print("Connecting to Withings API...")
    client = WithingsClient()

    if len(sys.argv) == 1:
        days = 30
        print(f"Pulling last {days} days of measurements...")
        data = client.get_last_n_days(days)
    elif len(sys.argv) == 2:
        days = int(sys.argv[1])
        print(f"Pulling last {days} days of measurements...")
        data = client.get_last_n_days(days)
    elif len(sys.argv) == 3:
        start, end = sys.argv[1], sys.argv[2]
        print(f"Pulling data from {start} to {end}...")
        data = client.get_date_range(start, end)
    else:
        print("Usage:")
        print("  python3 pull_data.py                          # Last 30 days")
        print("  python3 pull_data.py 90                       # Last 90 days")
        print("  python3 pull_data.py 2026-01-01 2026-04-21    # Date range")
        sys.exit(1)

    with open("withings_raw.json", "w") as f:
        json.dump(data, f, indent=2, default=str)
    print("Raw data saved to withings_raw.json")

    report = generate_report(data)
    with open("withings_report.md", "w") as f:
        f.write(report)
    print("Report saved to withings_report.md")

    records = data.get("measurements", [])
    print(f"\nWeigh-ins found: {len(records)}")
    if records:
        print(f"  First: {records[0]['date']}")
        print(f"  Last:  {records[-1]['date']}")
    print("\nDone! Check withings_report.md for the formatted report.")


if __name__ == "__main__":
    main()
