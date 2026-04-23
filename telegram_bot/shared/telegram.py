"""
Telegram API helpers.
"""

import requests
from shared.config import API_URL, CHAT_ID


def send_message(text, chat_id=None):
    """Send a message to the configured Telegram chat."""
    payload = {
        "chat_id": chat_id or CHAT_ID,
        "text": text,
        "parse_mode": "Markdown",
    }
    resp = requests.post(f"{API_URL}/sendMessage", json=payload, timeout=10)
    resp.raise_for_status()
    return resp.json()
