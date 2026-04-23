"""
Configuration for the Vercel serverless version of the Telegram bot.
Reads secrets from environment variables (set in Vercel project settings).
"""

import os

BOT_TOKEN = os.environ["BOT_TOKEN"].strip()
CHAT_ID = int(os.environ["CHAT_ID"].strip())
TIMEZONE = os.environ.get("TIMEZONE", "America/New_York").strip()
CRON_SECRET = os.environ.get("CRON_SECRET", "").strip()

API_URL = f"https://api.telegram.org/bot{BOT_TOKEN}"

# ---- Supplement reminders ----
# Customize to match YOUR stack (see sections/08_supplements.md).

SUPPLEMENT_REMINDERS = {
    "morning": {
        "label": "Morning Supplements",
        "message": (
            "*MORNING STACK*\n\n"
            "  • [Supplement 1] — [dose]\n"
            "  • [Supplement 2] — [dose]\n"
            "  • [Supplement 3] — [dose]\n\n"
            "Hit /done when taken ✅"
        ),
    },
    "evening": {
        "label": "Evening Supplements",
        "message": (
            "*EVENING STACK*\n\n"
            "  • [Supplement] — [dose]\n\n"
            "Hit /done when taken ✅"
        ),
    },
}

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
