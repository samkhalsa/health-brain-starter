"""
Telegram Supplement & Workout Reminder Bot — local-run configuration.

For Vercel deployment, see shared/config.py (reads from env vars).

SETUP:
1. In Telegram, message @BotFather → /newbot → save the token
2. Message your new bot from your personal account ("hello")
3. Get your chat ID from: https://api.telegram.org/bot<TOKEN>/getUpdates
4. Copy .env.example to .env and paste BOT_TOKEN + CHAT_ID there
"""

import os
from pathlib import Path

try:
    from dotenv import load_dotenv  # type: ignore
    load_dotenv(Path(__file__).parent / ".env")
except ImportError:
    pass

BOT_TOKEN = os.environ.get("BOT_TOKEN", "")
CHAT_ID = int(os.environ["CHAT_ID"]) if os.environ.get("CHAT_ID") else 0

# Default timezone (can be changed at runtime via the /timezone command).
TIMEZONE = os.environ.get("TIMEZONE", "America/New_York")
TIMEZONE_FILE = "timezone.txt"

# ---- Supplement reminders ----
# Customize the time, label, and message to match YOUR stack (see
# sections/08_supplements.md). Each reminder fires daily at its configured time.

REMINDERS = [
    {
        "time": "08:00",
        "label": "Morning Supplements",
        "message": (
            "*MORNING STACK*\n\n"
            "  • [Supplement 1] — [dose]\n"
            "  • [Supplement 2] — [dose]\n"
            "  • [Supplement 3] — [dose]\n\n"
            "Hit /done when taken ✅"
        ),
    },
    {
        "time": "21:00",
        "label": "Evening Supplements",
        "message": (
            "*EVENING STACK*\n\n"
            "  • [Supplement] — [dose]\n\n"
            "Hit /done when taken ✅"
        ),
    },
]

# ---- Weekly workout schedule (0 = Monday, 6 = Sunday) ----
# Customize to match YOUR weekly split (see sections/04_strength.md).

WORKOUTS = {
    0: {
        "name": "UPPER PUSH + CORE",
        "type": "STRENGTH",
        "duration": "55 min",
        "exercises": [
            "Warmup / Mobility (10 min)",
            "[Exercise 1] — [sets × reps]",
            "[Exercise 2] — [sets × reps]",
            "[Exercise 3] — [sets × reps]",
            "Zone 2 finisher — 10 min",
        ],
        "focus": "Chest, shoulders, triceps, core",
    },
    1: {
        "name": "ZONE 2 + MOBILITY",
        "type": "CARDIO + MOBILITY",
        "duration": "45 min",
        "exercises": [
            "Zone 2 cardio — 30 min",
            "[Mobility drill 1]",
            "[Mobility drill 2]",
        ],
        "focus": "Base aerobic capacity, mobility",
    },
    2: {
        "name": "LOWER BODY",
        "type": "STRENGTH",
        "duration": "55 min",
        "exercises": [
            "Warmup / Mobility (10 min)",
            "[Exercise 1] — [sets × reps]",
            "[Exercise 2] — [sets × reps]",
            "[Exercise 3] — [sets × reps]",
        ],
        "focus": "Legs, glutes, posterior chain",
    },
    3: {
        "name": "ZONE 2 + MOBILITY",
        "type": "CARDIO + MOBILITY",
        "duration": "45 min",
        "exercises": [
            "Zone 2 cardio — 30 min",
            "[Mobility drill 1]",
            "[Mobility drill 2]",
        ],
        "focus": "Base aerobic capacity, mobility",
    },
    4: {
        "name": "UPPER PULL + CORE",
        "type": "STRENGTH",
        "duration": "55 min",
        "exercises": [
            "Warmup / Mobility (10 min)",
            "[Exercise 1] — [sets × reps]",
            "[Exercise 2] — [sets × reps]",
            "[Exercise 3] — [sets × reps]",
        ],
        "focus": "Back, biceps, scapular stability",
    },
    5: {
        "name": "LONG ZONE 2 / ACTIVE",
        "type": "ACTIVE RECOVERY",
        "duration": "45–60 min",
        "exercises": [
            "Pick one: walk, hike, bike, swim, row",
            "Keep HR conversational (110–140)",
        ],
        "focus": "Extended aerobic, enjoyment",
    },
    6: {
        "name": "REST + MOBILITY FLOW",
        "type": "REST DAY",
        "duration": "20 min",
        "exercises": [
            "Ankle CARs — 5 each direction",
            "Hip CARs — 5 each direction",
            "T-spine rotation — 10 each side",
            "Deep squat hold — 2 min",
        ],
        "focus": "Joint maintenance, reset for next week",
    },
}

GYM_REMINDER_TIME = os.environ.get("GYM_REMINDER_TIME", "11:00")
