"""
Telegram Supplement & Workout Reminder Bot — Vercel Serverless API

Routes:
  POST /api/webhook    — Telegram webhook (receives messages)
  GET  /api/cron/morning — Morning supplement reminder
  GET  /api/cron/evening — Evening supplement reminder
  GET  /api/cron/gym     — Gym workout reminder
"""

import os
import sys
from flask import Flask, request, jsonify

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from shared.config import CHAT_ID, SUPPLEMENT_REMINDERS, CRON_SECRET
from shared.telegram import send_message
from shared.messages import build_workout_message, build_status_message

app = Flask(__name__)


def verify_cron(req):
    """Verify cron requests using CRON_SECRET."""
    if not CRON_SECRET:
        return True
    auth = req.headers.get("Authorization", "")
    return auth == f"Bearer {CRON_SECRET}"


@app.route("/api/webhook", methods=["POST"])
def webhook():
    """Handle incoming Telegram messages."""
    update = request.get_json(silent=True)
    if not update:
        return jsonify({"error": "invalid json"}), 400

    message = update.get("message", {})
    text = message.get("text", "").strip().lower()
    chat_id = message.get("chat", {}).get("id")

    if chat_id != CHAT_ID:
        return jsonify({"ok": True})

    if text == "/start":
        send_message(
            "\U0001f525 *Supplement & Workout Reminder Bot*\n\n"
            "I'm here to keep you on track. No days off.\n\n"
            "*Commands:*\n"
            "/status \u2014 see your schedule\n"
            "/done \u2014 confirm supplements taken\n"
            "/remind \u2014 get supplement reminders now\n"
            "/workout \u2014 see today's workout"
        )
    elif text == "/done":
        send_message(
            "Logged. You're building something most people never will. "
            "Keep going. \U0001f525"
        )
    elif text == "/status":
        send_message(build_status_message())
    elif text == "/remind":
        for r in SUPPLEMENT_REMINDERS.values():
            send_message(r["message"])
    elif text == "/workout":
        msg = build_workout_message()
        if msg:
            send_message(msg)

    return jsonify({"ok": True})


@app.route("/api/cron/morning", methods=["GET"])
def cron_morning():
    """8:00 AM — Morning supplements."""
    if not verify_cron(request):
        return jsonify({"error": "unauthorized"}), 401
    send_message(SUPPLEMENT_REMINDERS["morning"]["message"])
    return jsonify({"ok": True, "sent": "morning"})


@app.route("/api/cron/evening", methods=["GET"])
def cron_evening():
    """9:00 PM — Evening supplements."""
    if not verify_cron(request):
        return jsonify({"error": "unauthorized"}), 401
    send_message(SUPPLEMENT_REMINDERS["evening"]["message"])
    return jsonify({"ok": True, "sent": "evening"})


@app.route("/api/cron/gym", methods=["GET"])
def cron_gym():
    """11:00 AM — Gym workout reminder."""
    if not verify_cron(request):
        return jsonify({"error": "unauthorized"}), 401
    msg = build_workout_message()
    if msg:
        send_message(msg)
    return jsonify({"ok": True, "sent": "gym"})


@app.route("/api/health", methods=["GET"])
def health():
    """Health check."""
    return jsonify({"status": "alive", "bot": "supplement-reminder"})
