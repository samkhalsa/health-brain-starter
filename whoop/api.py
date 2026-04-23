"""
WHOOP API Client.

Handles all API calls with automatic pagination and token management.
"""

import requests
from datetime import datetime, timedelta, timezone

from config import API_BASE
from auth import get_valid_token


class WhoopClient:
    """Client for the WHOOP Developer API v2."""

    def __init__(self):
        self.token = get_valid_token()
        self.headers = {"Authorization": f"Bearer {self.token}"}

    def _get(self, path, params=None):
        """Make an authenticated GET request."""
        url = f"{API_BASE}{path}"
        resp = requests.get(url, headers=self.headers, params=params)
        resp.raise_for_status()
        return resp.json()

    def _get_paginated(self, path, start=None, end=None, limit=25):
        """Fetch all pages from a paginated endpoint."""
        all_records = []
        params = {"limit": limit}

        if start:
            params["start"] = start.isoformat() if isinstance(start, datetime) else start
        if end:
            params["end"] = end.isoformat() if isinstance(end, datetime) else end

        while True:
            data = self._get(path, params)
            records = data.get("records", [])
            all_records.extend(records)

            next_token = data.get("next_token")
            if not next_token:
                break
            params["nextToken"] = next_token

        return all_records

    # --- Profile ---

    def get_profile(self):
        """Get user profile."""
        return self._get("/v2/user/profile/basic")

    def get_body_measurement(self):
        """Get body measurements."""
        return self._get("/v2/user/measurement/body")

    # --- Recovery ---

    def get_recovery(self, start=None, end=None):
        """Get recovery records.

        Args:
            start: Start datetime (inclusive)
            end: End datetime (exclusive, defaults to now)

        Returns:
            List of recovery records with HRV, RHR, recovery score, SpO2, skin temp.
        """
        return self._get_paginated("/v2/recovery", start=start, end=end)

    # --- Sleep ---

    def get_sleep(self, start=None, end=None):
        """Get sleep records.

        Returns sleep stages, performance, efficiency, respiratory rate.
        """
        return self._get_paginated("/v2/activity/sleep", start=start, end=end)

    # --- Cycles (Day Strain) ---

    def get_cycles(self, start=None, end=None):
        """Get physiological cycles.

        Returns daily strain, average/max HR, kilojoules burned.
        """
        return self._get_paginated("/v2/cycle", start=start, end=end)

    # --- Workouts ---

    def get_workouts(self, start=None, end=None):
        """Get workout records.

        Returns workout strain, HR zones, distance, calories.
        """
        return self._get_paginated("/v2/activity/workout", start=start, end=end)

    # --- Convenience methods ---

    def get_last_n_days(self, days=7):
        """Pull all data for the last N days.

        Returns dict with recovery, sleep, cycles, and workouts.
        """
        end = datetime.now(timezone.utc)
        start = end - timedelta(days=days)

        return {
            "recovery": self.get_recovery(start=start, end=end),
            "sleep": self.get_sleep(start=start, end=end),
            "cycles": self.get_cycles(start=start, end=end),
            "workouts": self.get_workouts(start=start, end=end),
            "profile": self.get_profile(),
            "body": self.get_body_measurement(),
            "period": {"start": start.isoformat(), "end": end.isoformat(), "days": days},
        }

    def get_date_range(self, start_date, end_date):
        """Pull all data for a specific date range.

        Args:
            start_date: str like '2026-04-01' or datetime
            end_date: str like '2026-04-13' or datetime
        """
        if isinstance(start_date, str):
            start = datetime.fromisoformat(start_date).replace(tzinfo=timezone.utc)
        else:
            start = start_date

        if isinstance(end_date, str):
            end = datetime.fromisoformat(end_date).replace(tzinfo=timezone.utc)
        else:
            end = end_date

        return {
            "recovery": self.get_recovery(start=start, end=end),
            "sleep": self.get_sleep(start=start, end=end),
            "cycles": self.get_cycles(start=start, end=end),
            "workouts": self.get_workouts(start=start, end=end),
            "period": {"start": start.isoformat(), "end": end.isoformat()},
        }
