"""
Withings API Client.

The scale (Body+, Body Comp, Body Cardio, Body Scan) uploads measurements
to the Withings cloud. One endpoint retrieves them all:
    POST /measure?action=getmeas

Values are returned as `value * 10^unit`. For example, 75.5 kg arrives as
value=75500, unit=-3. compute_value() handles the scaling.
"""

import requests
from datetime import datetime, timedelta, timezone
from collections import defaultdict

from config import API_BASE, MEAS_TYPES
from auth import get_valid_token


def compute_value(value, unit):
    """Withings returns (value, unit) pairs where actual = value * 10^unit."""
    return value * (10 ** unit)


class WithingsClient:
    """Client for the Withings Public Health Data API."""

    def __init__(self):
        self.token = get_valid_token()

    def _post(self, path, data):
        """POST to a Withings endpoint and unwrap {status, body}."""
        url = f"{API_BASE}{path}"
        headers = {"Authorization": f"Bearer {self.token}"}
        resp = requests.post(url, headers=headers, data=data)
        resp.raise_for_status()
        payload = resp.json()
        if payload.get("status") != 0:
            raise RuntimeError(f"Withings API error: {payload}")
        return payload.get("body", {})

    def get_measurements(self, start=None, end=None, meastypes=None):
        """Fetch measurements between two datetimes.

        Args:
            start: datetime (UTC) — defaults to 90 days ago
            end: datetime (UTC) — defaults to now
            meastypes: list of meastype ints — defaults to all configured types

        Returns:
            List of dicts, one per weigh-in, with named fields:
            {
              "date": "2026-04-20",
              "timestamp": 1713600000,
              "weight_kg": 104.2,
              "fat_ratio_pct": 28.5,
              ...
            }
        """
        if end is None:
            end = datetime.now(timezone.utc)
        if start is None:
            start = end - timedelta(days=90)
        if meastypes is None:
            meastypes = list(MEAS_TYPES.keys())

        data = {
            "action": "getmeas",
            "meastypes": ",".join(str(m) for m in meastypes),
            "category": 1,  # 1 = real measurements, 2 = user objectives
            "startdate": int(start.timestamp()),
            "enddate": int(end.timestamp()),
        }

        body = self._post("/measure", data)
        return self._flatten_measuregrps(body.get("measuregrps", []))

    def _flatten_measuregrps(self, measuregrps):
        """Turn Withings' nested measuregrps into flat per-weigh-in records."""
        records = []
        for grp in measuregrps:
            ts = grp.get("date")
            record = {
                "timestamp": ts,
                "date": datetime.fromtimestamp(ts, tz=timezone.utc).strftime("%Y-%m-%d"),
                "datetime": datetime.fromtimestamp(ts, tz=timezone.utc).isoformat(),
                "grpid": grp.get("grpid"),
            }
            for m in grp.get("measures", []):
                meastype = m.get("type")
                if meastype in MEAS_TYPES:
                    field = MEAS_TYPES[meastype]
                    record[field] = round(compute_value(m["value"], m["unit"]), 3)
            records.append(record)
        records.sort(key=lambda r: r["timestamp"])
        return records

    def get_last_n_days(self, days=30):
        """Convenience: pull last N days of scale data."""
        end = datetime.now(timezone.utc)
        start = end - timedelta(days=days)
        records = self.get_measurements(start=start, end=end)
        return {
            "measurements": records,
            "period": {
                "start": start.isoformat(),
                "end": end.isoformat(),
                "days": days,
            },
        }

    def get_date_range(self, start_date, end_date):
        """Pull data for a specific date range (YYYY-MM-DD strings or datetimes)."""
        if isinstance(start_date, str):
            start = datetime.fromisoformat(start_date).replace(tzinfo=timezone.utc)
        else:
            start = start_date
        if isinstance(end_date, str):
            end = datetime.fromisoformat(end_date).replace(tzinfo=timezone.utc)
        else:
            end = end_date

        records = self.get_measurements(start=start, end=end)
        return {
            "measurements": records,
            "period": {"start": start.isoformat(), "end": end.isoformat()},
        }
