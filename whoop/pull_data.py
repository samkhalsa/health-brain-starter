#!/usr/bin/env python3
"""
Pull WHOOP data and generate a markdown report for the Health Brain.

Usage:
    python3 pull_data.py                  # Last 7 days
    python3 pull_data.py 30               # Last 30 days
    python3 pull_data.py 2026-03-01 2026-04-13  # Specific date range

Output:
    - whoop_report.md    (formatted report ready to paste into HEALTH_BRAIN.md)
    - whoop_raw.json     (raw API data for reference)
"""

import json
import sys
from datetime import datetime, timezone

from api import WhoopClient


def ms_to_hours(ms):
    """Convert milliseconds to hours with 1 decimal."""
    if ms is None:
        return 0.0
    return round(ms / 3_600_000, 1)


def ms_to_minutes(ms):
    """Convert milliseconds to minutes."""
    if ms is None:
        return 0
    return round(ms / 60_000)


def format_recovery(records):
    """Format recovery data as markdown table."""
    if not records:
        return "No recovery data found.\n"

    lines = [
        "| Date | Recovery % | HRV (ms) | RHR (bpm) | SpO2 % | Skin Temp (C) |",
        "|------|-----------|----------|-----------|--------|---------------|",
    ]

    for r in sorted(records, key=lambda x: x.get("created_at", "")):
        score = r.get("score")
        if not score or r.get("score_state") != "SCORED":
            continue

        date = r.get("created_at", "")[:10]
        recovery = score.get("recovery_score", "—")
        hrv = round(score.get("hrv_rmssd_milli", 0), 1)
        rhr = round(score.get("resting_heart_rate", 0))
        spo2 = round(score.get("spo2_percentage", 0), 1) if score.get("spo2_percentage") else "—"
        skin = round(score.get("skin_temp_celsius", 0), 1) if score.get("skin_temp_celsius") else "—"

        lines.append(f"| {date} | {recovery} | {hrv} | {rhr} | {spo2} | {skin} |")

    return "\n".join(lines) + "\n"


def format_sleep(records):
    """Format sleep data as markdown table."""
    if not records:
        return "No sleep data found.\n"

    lines = [
        "| Date | Total (hrs) | Deep (hrs) | REM (hrs) | Light (hrs) | Awake (hrs) | Efficiency % | Performance % | Resp Rate |",
        "|------|------------|-----------|----------|------------|------------|-------------|--------------|-----------|",
    ]

    for s in sorted(records, key=lambda x: x.get("start", "")):
        score = s.get("score")
        if not score or s.get("score_state") != "SCORED" or s.get("nap"):
            continue

        stages = score.get("stage_summary", {})
        date = s.get("start", "")[:10]

        total_sleep = (
            stages.get("total_light_sleep_time_milli", 0)
            + stages.get("total_slow_wave_sleep_time_milli", 0)
            + stages.get("total_rem_sleep_time_milli", 0)
        )

        total_hrs = ms_to_hours(total_sleep)
        deep = ms_to_hours(stages.get("total_slow_wave_sleep_time_milli"))
        rem = ms_to_hours(stages.get("total_rem_sleep_time_milli"))
        light = ms_to_hours(stages.get("total_light_sleep_time_milli"))
        awake = ms_to_hours(stages.get("total_awake_time_milli"))
        efficiency = round(score.get("sleep_efficiency_percentage", 0), 1)
        performance = round(score.get("sleep_performance_percentage", 0), 1)
        resp = round(score.get("respiratory_rate", 0), 1)

        lines.append(
            f"| {date} | {total_hrs} | {deep} | {rem} | {light} | {awake} | {efficiency} | {performance} | {resp} |"
        )

    return "\n".join(lines) + "\n"


def format_cycles(records):
    """Format daily strain/cycle data as markdown table."""
    if not records:
        return "No cycle data found.\n"

    lines = [
        "| Date | Strain (0-21) | Avg HR | Max HR | Calories (kJ) |",
        "|------|--------------|--------|--------|---------------|",
    ]

    for c in sorted(records, key=lambda x: x.get("start", "")):
        score = c.get("score")
        if not score or c.get("score_state") != "SCORED":
            continue

        date = c.get("start", "")[:10]
        strain = round(score.get("strain", 0), 1)
        avg_hr = score.get("average_heart_rate", "—")
        max_hr = score.get("max_heart_rate", "—")
        kj = round(score.get("kilojoule", 0))

        lines.append(f"| {date} | {strain} | {avg_hr} | {max_hr} | {kj} |")

    return "\n".join(lines) + "\n"


def format_workouts(records):
    """Format workout data as markdown table."""
    if not records:
        return "No workout data found.\n"

    lines = [
        "| Date | Activity | Strain | Avg HR | Max HR | Duration (min) | Calories (kJ) |",
        "|------|---------|--------|--------|--------|---------------|---------------|",
    ]

    for w in sorted(records, key=lambda x: x.get("start", "")):
        score = w.get("score")
        if not score or w.get("score_state") != "SCORED":
            continue

        date = w.get("start", "")[:10]
        sport = w.get("sport_name", "unknown").replace("_", " ").title()
        strain = round(score.get("strain", 0), 1)
        avg_hr = score.get("average_heart_rate", "—")
        max_hr = score.get("max_heart_rate", "—")
        kj = round(score.get("kilojoule", 0))

        # Calculate duration from start/end
        start_dt = w.get("start", "")
        end_dt = w.get("end", "")
        duration = "—"
        if start_dt and end_dt:
            try:
                s = datetime.fromisoformat(start_dt.replace("Z", "+00:00"))
                e = datetime.fromisoformat(end_dt.replace("Z", "+00:00"))
                duration = round((e - s).total_seconds() / 60)
            except (ValueError, TypeError):
                pass

        lines.append(
            f"| {date} | {sport} | {strain} | {avg_hr} | {max_hr} | {duration} | {kj} |"
        )

    return "\n".join(lines) + "\n"


def compute_averages(recovery_records, sleep_records):
    """Compute period averages for key metrics."""
    hrv_values = []
    rhr_values = []
    recovery_values = []
    sleep_hours = []
    deep_pct = []
    rem_pct = []
    efficiency = []

    for r in recovery_records:
        score = r.get("score")
        if not score or r.get("score_state") != "SCORED":
            continue
        if score.get("hrv_rmssd_milli"):
            hrv_values.append(score["hrv_rmssd_milli"])
        if score.get("resting_heart_rate"):
            rhr_values.append(score["resting_heart_rate"])
        if score.get("recovery_score") is not None:
            recovery_values.append(score["recovery_score"])

    for s in sleep_records:
        score = s.get("score")
        if not score or s.get("score_state") != "SCORED" or s.get("nap"):
            continue
        stages = score.get("stage_summary", {})

        total_sleep = (
            stages.get("total_light_sleep_time_milli", 0)
            + stages.get("total_slow_wave_sleep_time_milli", 0)
            + stages.get("total_rem_sleep_time_milli", 0)
        )

        if total_sleep > 0:
            hrs = total_sleep / 3_600_000
            sleep_hours.append(hrs)
            deep_pct.append(stages.get("total_slow_wave_sleep_time_milli", 0) / total_sleep * 100)
            rem_pct.append(stages.get("total_rem_sleep_time_milli", 0) / total_sleep * 100)

        if score.get("sleep_efficiency_percentage"):
            efficiency.append(score["sleep_efficiency_percentage"])

    def avg(lst):
        return round(sum(lst) / len(lst), 1) if lst else "—"

    return {
        "avg_hrv": avg(hrv_values),
        "avg_rhr": avg(rhr_values),
        "avg_recovery": avg(recovery_values),
        "avg_sleep_hours": avg(sleep_hours),
        "avg_deep_pct": avg(deep_pct),
        "avg_rem_pct": avg(rem_pct),
        "avg_efficiency": avg(efficiency),
        "hrv_min": round(min(hrv_values), 1) if hrv_values else "—",
        "hrv_max": round(max(hrv_values), 1) if hrv_values else "—",
    }


def generate_report(data):
    """Generate the full markdown report."""
    period = data["period"]
    recovery = data.get("recovery", [])
    sleep = data.get("sleep", [])
    cycles = data.get("cycles", [])
    workouts = data.get("workouts", [])

    avgs = compute_averages(recovery, sleep)

    report = f"""# WHOOP Data Report

> Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}
> Period: {period.get('start', '?')[:10]} to {period.get('end', '?')[:10]}

---

## Summary Averages

| Metric | Average | Target (Longevity) | Status |
|--------|---------|-------------------|--------|
| HRV (rMSSD) | {avgs['avg_hrv']} ms (range: {avgs['hrv_min']}–{avgs['hrv_max']}) | Trending up / stable | |
| Resting Heart Rate | {avgs['avg_rhr']} bpm | <60 bpm | |
| Recovery Score | {avgs['avg_recovery']}% | >66% (green) | |
| Total Sleep | {avgs['avg_sleep_hours']} hrs | 7.5–9.0 hrs | |
| Deep Sleep | {avgs['avg_deep_pct']}% | 15–23% | |
| REM Sleep | {avgs['avg_rem_pct']}% | 20–25% | |
| Sleep Efficiency | {avgs['avg_efficiency']}% | >90% | |

---

## Recovery (Daily)

{format_recovery(recovery)}

---

## Sleep (Nightly)

{format_sleep(sleep)}

---

## Daily Strain

{format_cycles(cycles)}

---

## Workouts

{format_workouts(workouts)}
"""

    return report


def main():
    print("Connecting to WHOOP API...")
    client = WhoopClient()

    # Parse arguments
    if len(sys.argv) == 1:
        days = 7
        print(f"Pulling last {days} days of data...")
        data = client.get_last_n_days(days)
    elif len(sys.argv) == 2:
        days = int(sys.argv[1])
        print(f"Pulling last {days} days of data...")
        data = client.get_last_n_days(days)
    elif len(sys.argv) == 3:
        start, end = sys.argv[1], sys.argv[2]
        print(f"Pulling data from {start} to {end}...")
        data = client.get_date_range(start, end)
    else:
        print("Usage:")
        print("  python3 pull_data.py              # Last 7 days")
        print("  python3 pull_data.py 30            # Last 30 days")
        print("  python3 pull_data.py 2026-03-01 2026-04-13  # Date range")
        sys.exit(1)

    # Save raw data
    with open("whoop_raw.json", "w") as f:
        json.dump(data, f, indent=2, default=str)
    print(f"Raw data saved to whoop_raw.json")

    # Generate markdown report
    report = generate_report(data)
    with open("whoop_report.md", "w") as f:
        f.write(report)
    print(f"Report saved to whoop_report.md")

    # Print summary
    recovery = data.get("recovery", [])
    sleep = data.get("sleep", [])
    workouts = data.get("workouts", [])
    print(f"\nData pulled:")
    print(f"  Recovery records: {len(recovery)}")
    print(f"  Sleep records:    {len(sleep)}")
    print(f"  Workouts:         {len(workouts)}")
    print(f"\nDone! Check whoop_report.md for the formatted report.")


if __name__ == "__main__":
    main()
