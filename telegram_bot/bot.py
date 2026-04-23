"""
Telegram Supplement & Workout Reminder Bot

Sends scheduled supplement reminders and daily workout plans via Telegram.
Run this script and it will stay alive, sending reminders at the configured times.
"""

import os
import time
import requests
import schedule
from datetime import datetime
from zoneinfo import ZoneInfo

from config import (
    BOT_TOKEN, CHAT_ID, REMINDERS, WORKOUTS, GYM_REMINDER_TIME,
    TIMEZONE, TIMEZONE_FILE,
)

API_URL = f"https://api.telegram.org/bot{BOT_TOKEN}"

VALID_TIMEZONES = [
    "America/Toronto", "America/New_York", "America/Chicago",
    "America/Denver", "America/Los_Angeles", "America/Vancouver",
    "America/Edmonton", "America/Winnipeg", "America/Halifax",
    "America/St_Johns", "Europe/London", "Europe/Berlin",
    "Europe/Paris", "Asia/Kolkata", "Asia/Dubai", "Asia/Tokyo",
    "Asia/Shanghai", "Asia/Singapore", "Australia/Sydney",
    "Pacific/Auckland", "UTC",
]


def get_timezone():
    """Read timezone from file, fall back to config default."""
    tz_path = os.path.join(os.path.dirname(__file__), TIMEZONE_FILE)
    if os.path.exists(tz_path):
        with open(tz_path) as f:
            tz = f.read().strip()
            if tz:
                return tz
    return TIMEZONE


def set_timezone(tz):
    """Save timezone to file."""
    tz_path = os.path.join(os.path.dirname(__file__), TIMEZONE_FILE)
    with open(tz_path, "w") as f:
        f.write(tz)


def now():
    return datetime.now(ZoneInfo(get_timezone()))


def now_str():
    return now().strftime("%Y-%m-%d %H:%M:%S")


def send_message(text):
    """Send a message to the configured Telegram chat."""
    payload = {
        "chat_id": CHAT_ID,
        "text": text,
        "parse_mode": "Markdown",
    }
    try:
        resp = requests.post(f"{API_URL}/sendMessage", json=payload, timeout=10)
        resp.raise_for_status()
        print(f"[{now_str()}] Message sent.")
    except requests.RequestException as e:
        print(f"[{now_str()}] Failed to send: {e}")


def build_workout_message():
    """Build today's workout reminder based on day of week."""
    day = now().weekday()  # 0=Monday
    workout = WORKOUTS.get(day)
    if not workout:
        return None

    day_name = now().strftime("%A").upper()

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


def send_supplement_reminder(reminder):
    """Send a supplement reminder."""
    send_message(reminder["message"])


def send_gym_reminder():
    """Send today's workout reminder."""
    msg = build_workout_message()
    if msg:
        send_message(msg)


def reschedule_all():
    """Clear and reschedule all jobs for current timezone."""
    schedule.clear()
    tz = get_timezone()
    for reminder in REMINDERS:
        schedule.every().day.at(reminder["time"], tz).do(
            send_supplement_reminder, reminder
        )
        print(f"[{now_str()}] Scheduled: {reminder['label']} at {reminder['time']} ({tz})")

    schedule.every().day.at(GYM_REMINDER_TIME, tz).do(send_gym_reminder)
    print(f"[{now_str()}] Scheduled: Gym reminder at {GYM_REMINDER_TIME} ({tz})")


def handle_updates(last_update_id):
    """Check for bot commands and respond."""
    try:
        resp = requests.get(
            f"{API_URL}/getUpdates",
            params={"offset": last_update_id + 1, "timeout": 5},
            timeout=15,
        )
        resp.raise_for_status()
        updates = resp.json().get("result", [])
    except requests.RequestException:
        return last_update_id

    for update in updates:
        last_update_id = update["update_id"]
        message = update.get("message", {})
        text = message.get("text", "").strip()
        chat_id = message.get("chat", {}).get("id")

        if chat_id != CHAT_ID:
            continue

        cmd = text.lower()

        if cmd == "/done":
            send_message("Logged. You're building something most people never will. Keep going. \U0001f525")

        elif cmd == "/status":
            tz = get_timezone()
            lines = [f"*Your Current Stack* (timezone: {tz})", ""]
            for r in REMINDERS:
                lines.append(f"*{r['label']}* \u2014 {r['time']}")
            lines.append(f"*Gym Reminder* \u2014 {GYM_REMINDER_TIME}")
            lines.append("")
            lines.append("Commands: /done /remind /workout /timezone")
            send_message("\n".join(lines))

        elif cmd == "/start":
            send_message(
                "\U0001f525 *Supplement & Workout Reminder Bot*\n\n"
                "I'm here to keep you on track. No days off.\n\n"
                "*Commands:*\n"
                "/status \u2014 see your schedule\n"
                "/done \u2014 confirm supplements taken\n"
                "/remind \u2014 get supplement reminders now\n"
                "/workout \u2014 see today's workout\n"
                "/timezone \u2014 change your timezone\n"
            )

        elif cmd == "/remind":
            for r in REMINDERS:
                send_message(r["message"])

        elif cmd == "/workout":
            msg = build_workout_message()
            if msg:
                send_message(msg)

        elif cmd.startswith("/timezone"):
            parts = text.split(maxsplit=1)
            if len(parts) == 1:
                current = get_timezone()
                tz_list = "\n".join(f"  \u2022 `{tz}`" for tz in VALID_TIMEZONES)
                send_message(
                    f"*Current timezone:* `{current}`\n\n"
                    f"To change, send:\n`/timezone America/Toronto`\n\n"
                    f"*Available timezones:*\n{tz_list}"
                )
            else:
                new_tz = parts[1].strip()
                # Try to validate the timezone
                try:
                    ZoneInfo(new_tz)
                    set_timezone(new_tz)
                    reschedule_all()
                    send_message(
                        f"Timezone updated to `{new_tz}`\n\n"
                        "All reminders rescheduled. \u2705"
                    )
                except (KeyError, Exception):
                    send_message(
                        f"`{new_tz}` is not a valid timezone.\n\n"
                        "Send /timezone to see available options."
                    )

    return last_update_id


def main():
    print(f"[{now_str()}] Supplement & Workout Reminder Bot starting...")
    reschedule_all()

    # Startup message
    send_message(
        "\U0001f525 *Bot is live. No days off.*\n\n"
        "Your reminders:\n"
        + "\n".join(f"  \u2022 {r['time']} \u2014 {r['label']}" for r in REMINDERS)
        + f"\n  \u2022 {GYM_REMINDER_TIME} \u2014 Today's Workout"
        + f"\n\nTimezone: `{get_timezone()}`"
        + "\n\nCommands: /status /done /remind /workout /timezone"
    )

    # Main loop
    last_update_id = 0
    while True:
        schedule.run_pending()
        last_update_id = handle_updates(last_update_id)
        time.sleep(2)


if __name__ == "__main__":
    main()
