"""
WHOOP API Configuration.

SETUP:
1. Go to https://developer-dashboard.whoop.com
2. Sign in with your WHOOP account
3. Create a Team (any name)
4. Create an App with these settings:
   - Scopes: read:recovery, read:cycles, read:sleep, read:workout,
            read:profile, read:body_measurement
   - Redirect URI: http://localhost:8080/callback
5. Copy your Client ID and Client Secret into a `.env` file in this directory
   (see .env.example). The values below read from the environment.
"""

import os
from pathlib import Path

# Optional: load a local .env file if python-dotenv is available. Falls back to
# plain os.environ otherwise.
try:
    from dotenv import load_dotenv  # type: ignore
    load_dotenv(Path(__file__).parent / ".env")
except ImportError:
    pass

CLIENT_ID = os.environ.get("WHOOP_CLIENT_ID", "")
CLIENT_SECRET = os.environ.get("WHOOP_CLIENT_SECRET", "")
REDIRECT_URI = os.environ.get("WHOOP_REDIRECT_URI", "http://localhost:8080/callback")

SCOPES = [
    "offline",
    "read:recovery",
    "read:cycles",
    "read:sleep",
    "read:workout",
    "read:profile",
    "read:body_measurement",
]

# API URLs
AUTH_URL = "https://api.prod.whoop.com/oauth/oauth2/auth"
TOKEN_URL = "https://api.prod.whoop.com/oauth/oauth2/token"
API_BASE = "https://api.prod.whoop.com/developer"

# Local token storage (relative to this file so the script works from any cwd)
TOKEN_FILE = str(Path(__file__).parent / "whoop_tokens.json")
