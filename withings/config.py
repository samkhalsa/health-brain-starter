"""
Withings API Configuration.

SETUP:
1. Go to https://developer.withings.com/dashboard/
2. Create an application with:
   - Registered URLs (callback): http://localhost:8080/callback
   - Scope: user.metrics
3. Copy your Client ID and Client Secret into a `.env` file in this directory
   (see .env.example). The values below read from the environment.

Scope user.metrics covers weight + body composition data from the scale.
"""

import os
from pathlib import Path

try:
    from dotenv import load_dotenv  # type: ignore
    load_dotenv(Path(__file__).parent / ".env")
except ImportError:
    pass

CLIENT_ID = os.environ.get("WITHINGS_CLIENT_ID", "")
CLIENT_SECRET = os.environ.get("WITHINGS_CLIENT_SECRET", "")
REDIRECT_URI = os.environ.get("WITHINGS_REDIRECT_URI", "http://localhost:8080/callback")

SCOPES = ["user.metrics"]

# API URLs
AUTH_URL = "https://account.withings.com/oauth2_user/authorize2"
TOKEN_URL = "https://wbsapi.withings.net/v2/oauth2"
API_BASE = "https://wbsapi.withings.net"

# Local token storage
TOKEN_FILE = str(Path(__file__).parent / "withings_tokens.json")

# Measurement type codes we care about.
# Full list: https://developer.withings.com/api-reference/
MEAS_TYPES = {
    1:   "weight_kg",
    5:   "fat_free_mass_kg",
    6:   "fat_ratio_pct",
    8:   "fat_mass_kg",
    11:  "heart_pulse_bpm",
    76:  "muscle_mass_kg",
    77:  "hydration_kg",
    88:  "bone_mass_kg",
    91:  "pulse_wave_velocity",
    155: "vascular_age",
    226: "visceral_fat",
}
