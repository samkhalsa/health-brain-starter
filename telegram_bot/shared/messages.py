"""
Message builders for workout and supplement reminders.
"""

from datetime import datetime
from zoneinfo import ZoneInfo

from shared.config import WORKOUTS, SUPPLEMENT_REMINDERS, TIMEZONE


def get_today_weekday():
    return datetime.now(ZoneInfo(TIMEZONE)).weekday()


def get_today_name():
    return datetime.now(ZoneInfo(TIMEZONE)).strftime("%A").upper()


def build_workout_message():
    """Build today's workout reminder based on day of week."""
    day = get_today_weekday()
    workout = WORKOUTS.get(day)
    if not workout:
        return None

    day_name = get_today_name()

    if workout["type"] == "REST DAY":
        lines = [
            f"\U0001f9d8 *{day_name} — REST + MOBILITY*",
            "",
            "No iron today. Your muscles grow when you recover.",
            "Trust the process.",
            "",
            f"\U0001f552 *{workout['duration']}* — Full Mobility Flow",
            "",
        ]
    elif workout["type"] == "ACTIVE RECOVERY":
        lines = [
            f"\U0001f6b6 *{day_name} — {workout['name']}*",
            "",
            "Low and slow today. This is where fat gets burned.",
            "Get outside. Move your body. Clear your head.",
            "",
            f"\U0001f552 *{workout['duration']}*",
            f"\U0001f3af *Focus:* {workout['focus']}",
            "",
        ]
    elif "CARDIO" in workout["type"]:
        lines = [
            f"\U0001f525 *{day_name} — {workout['name']}*",
            "",
            "Zone 2 builds the engine. Mobility fixes the chassis.",
            "You're reversing years of damage. Show up.",
            "",
            f"\U0001f552 *{workout['duration']}*",
            f"\U0001f3af *Focus:* {workout['focus']}",
            "",
        ]
    else:
        lines = [
            f"\U0001f3cb *{day_name} — {workout['name']}*",
            "",
            "Time to move weight. No excuses. No shortcuts.",
            "Every set is an investment in the next 60 years.",
            "",
            f"\U0001f552 *{workout['duration']}*",
            f"\U0001f3af *Focus:* {workout['focus']}",
            "",
        ]

    lines.append("*Today's Program:*")
    for ex in workout["exercises"]:
        lines.append(f"  \u2022 {ex}")

    lines.append("")
    lines.append("You showed up. That's already more than most people.")
    lines.append("Now execute. \U0001f4aa")

    return "\n".join(lines)


def build_status_message():
    """Build the /status response."""
    return (
        f"*Your Schedule* (timezone: `{TIMEZONE}`)\n\n"
        "  \u2022 09:00 — Morning Supplements\n"
        "  \u2022 11:00 — Gym / Workout\n"
        "  \u2022 21:00 — Evening Supplements\n\n"
        "*Commands:*\n"
        "/status — see your schedule\n"
        "/done — confirm supplements taken\n"
        "/remind — get supplement reminders now\n"
        "/workout — see today's workout"
    )
